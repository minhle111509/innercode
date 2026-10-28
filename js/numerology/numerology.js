/**
 * Pure numerology logic (Pythagorean system, Vietnamese convention).
 * No DOM access here so it can be unit-tested in Node.
 */

const MASTER_NUMBERS = new Set([11, 22, 33]);
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);
const MIN_YEAR = 1900;

export function sumDigits(value) {
  return String(value)
    .replace(/\D/g, '')
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);
}

/** Reduce to 1–9, optionally keeping master numbers 11/22/33. */
export function reduceNumber(n, { keepMaster = true } = {}) {
  let result = n;
  while (result > 9 && !(keepMaster && MASTER_NUMBERS.has(result))) {
    result = sumDigits(result);
  }
  return result;
}

/**
 * Vietnamese life-path convention: stop reducing once the value is
 * in 2–11, or is 22 / 33. That is why 10 is a valid life path here.
 */
export function reduceLifePath(n) {
  let result = n;
  while (result > 11 && result !== 22 && result !== 33) {
    result = sumDigits(result);
  }
  return result;
}

/**
 * Parse "YYYY-MM-DD" (the value of <input type="date">).
 * Throws an Error with a user-facing Vietnamese message on invalid input.
 */
export function parseBirthDate(input, today = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(input ?? '').trim());
  if (!match) throw new Error('Vui lòng nhập ngày sinh hợp lệ.');

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  // Date.UTC silently rolls over invalid dates (e.g. 31/02 → 03/03), so compare back.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error('Ngày sinh không tồn tại.');
  }
  if (year < MIN_YEAR) throw new Error(`Năm sinh phải từ ${MIN_YEAR} trở đi.`);

  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (date.getTime() > todayUtc) throw new Error('Ngày sinh không được ở tương lai.');

  return { day, month, year };
}

export function lifePathNumber({ day, month, year }) {
  return reduceLifePath(sumDigits(day) + sumDigits(month) + sumDigits(year));
}

export function birthDayNumber({ day }) {
  return reduceNumber(day);
}

export function personalYearNumber({ day, month }, currentYear) {
  return reduceNumber(sumDigits(day) + sumDigits(month) + sumDigits(currentYear), { keepMaster: false });
}

/** Count of each digit 1–9 in the birth date (zeros are ignored by convention). */
export function birthChart({ day, month, year }) {
  const counts = Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => [d, 0]));
  for (const ch of `${day}${month}${year}`) {
    const digit = Number(ch);
    if (digit > 0) counts[digit] += 1;
  }
  return counts;
}

/** Strip Vietnamese diacritics, keep only A–Z and spaces, uppercase. */
export function normalizeName(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function letterValue(letter) {
  const code = letter.charCodeAt(0) - 65;
  if (code < 0 || code > 25) throw new RangeError(`Not an A–Z letter: ${letter}`);
  return (code % 9) + 1;
}

/**
 * Returns null when the name contains no usable letters.
 * - expression (Số sứ mệnh): all letters
 * - soulUrge (Số linh hồn): vowels
 * - personality (Số nhân cách): consonants
 */
export function nameNumbers(name) {
  const letters = normalizeName(name).replace(/ /g, '');
  if (!letters) return null;

  let all = 0;
  let vowels = 0;
  let consonants = 0;
  for (const letter of letters) {
    const value = letterValue(letter);
    all += value;
    if (VOWELS.has(letter)) vowels += value;
    else consonants += value;
  }
  return {
    expression: reduceNumber(all),
    soulUrge: vowels ? reduceNumber(vowels) : null,
    personality: consonants ? reduceNumber(consonants) : null,
  };
}

export function calculateReport({ fullName, birthDate, today = new Date() }) {
  const date = parseBirthDate(birthDate, today);
  return {
    date,
    lifePath: lifePathNumber(date),
    birthDay: birthDayNumber(date),
    personalYear: personalYearNumber(date, today.getFullYear()),
    currentYear: today.getFullYear(),
    chart: birthChart(date),
    name: nameNumbers(fullName),
  };
}
