/**
 * Pure numerology logic (Pythagorean system, Vietnamese convention).
 * No DOM access here so it can be unit-tested in Node.
 */

import { parseBirthDate } from '../shared/date.js';
import { sumDigits } from '../shared/digits.js';

export { parseBirthDate, sumDigits };

const MASTER_NUMBERS = new Set([11, 22, 33]);
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

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
    .replace(/[\u0300-\u036f]/g, '')
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

const singleDigit = (n) => reduceNumber(n, { keepMaster: false });

/** Số thái độ: day + month. */
export function attitudeNumber({ day, month }) {
  return reduceNumber(sumDigits(day) + sumDigits(month));
}

/** Số trưởng thành: life path + expression. */
export function maturityNumber(lifePath, expression) {
  return reduceNumber(lifePath + expression);
}

/**
 * Bốn đỉnh cao (pinnacles) and the age each one starts.
 * Vietnamese convention: the first peak is at 36 − life path (master numbers reduced: 11→2, 22→4, 33→6; 10→1).
 */
export function pinnacles({ day, month, year }, lifePath) {
  const m = singleDigit(month);
  const d = singleDigit(sumDigits(day));
  const y = singleDigit(sumDigits(year));
  const p1 = reduceNumber(m + d);
  const p2 = reduceNumber(d + y);
  const p3 = reduceNumber(p1 + p2);
  const p4 = reduceNumber(m + y);
  const firstAge = 36 - singleDigit(lifePath);
  return [p1, p2, p3, p4].map((value, i) => ({ value, age: firstAge + 9 * i }));
}

/** Bốn thử thách (challenges), values 0–8. */
export function challenges({ day, month, year }) {
  const m = singleDigit(month);
  const d = singleDigit(sumDigits(day));
  const y = singleDigit(sumDigits(year));
  const c1 = Math.abs(m - d);
  const c2 = Math.abs(d - y);
  return [c1, c2, Math.abs(c1 - c2), Math.abs(m - y)];
}

export const ARROW_LINES = ['123', '456', '789', '147', '258', '369', '159', '357'];

/** Mũi tên: a line is "full" when all its digits appear, "empty" when none do. */
export function birthArrows(chart) {
  const arrows = [];
  for (const line of ARROW_LINES) {
    const present = [...line].filter((d) => chart[d] > 0).length;
    if (present === 3) arrows.push({ line, type: 'full' });
    else if (present === 0) arrows.push({ line, type: 'empty' });
  }
  return arrows;
}

export function personalYearCycle(date, fromYear, count = 4) {
  return Array.from({ length: count }, (_, i) => ({
    year: fromYear + i,
    number: personalYearNumber(date, fromYear + i),
  }));
}

const KARMIC_DEBT = new Set([13, 14, 16, 19]);

/** Every value met while reducing `n` with the given reducer (including n itself). */
function reductionChain(n, reducer) {
  const chain = [n];
  let current = n;
  while (reducer(current) !== current) {
    current = sumDigits(current);
    chain.push(current);
  }
  return chain;
}

function nameSums(name) {
  const letters = normalizeName(name).replace(/ /g, '');
  let all = 0;
  let vowels = 0;
  let consonants = 0;
  for (const letter of letters) {
    const value = letterValue(letter);
    all += value;
    if (VOWELS.has(letter)) vowels += value;
    else consonants += value;
  }
  return { letters, all, vowels, consonants };
}

/** Số nợ nghiệp 13/14/16/19 found in the day of birth or on the way to a core number. */
export function karmicDebts(date, fullName = '') {
  const found = [];
  const check = (label, total, reducer) => {
    const hit = reductionChain(total, reducer).find((v) => KARMIC_DEBT.has(v));
    if (hit) found.push({ source: label, number: hit });
  };
  check('Ngày sinh', date.day, reduceNumber);
  check('Số chủ đạo', sumDigits(date.day) + sumDigits(date.month) + sumDigits(date.year), reduceLifePath);
  const sums = nameSums(fullName);
  if (sums.letters) {
    check('Số sứ mệnh', sums.all, reduceNumber);
    if (sums.vowels) check('Số linh hồn', sums.vowels, reduceNumber);
    if (sums.consonants) check('Số nhân cách', sums.consonants, reduceNumber);
  }
  return found;
}

/** Bài học nghiệp: digits 1–9 that no letter of the name produces. */
export function karmicLessons(fullName) {
  const { letters } = nameSums(fullName);
  if (!letters) return null;
  const present = new Set([...letters].map(letterValue));
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !present.has(d));
}

/** Số đam mê ẩn: the most frequent letter value(s) in the name. */
export function hiddenPassion(fullName) {
  const { letters } = nameSums(fullName);
  if (!letters) return null;
  const counts = {};
  for (const letter of letters) counts[letterValue(letter)] = (counts[letterValue(letter)] ?? 0) + 1;
  const max = Math.max(...Object.values(counts));
  return { numbers: Object.keys(counts).filter((k) => counts[k] === max).map(Number), count: max };
}

/** Số cân bằng: initials of each word in the name. */
export function balanceNumber(fullName) {
  const words = normalizeName(fullName).split(' ').filter(Boolean);
  if (!words.length) return null;
  return reduceNumber(words.reduce((sum, word) => sum + letterValue(word[0]), 0));
}

export function personalMonthNumber(date, year, month) {
  return reduceNumber(personalYearNumber(date, year) + month, { keepMaster: false });
}

export function personalDayNumber(date, year, month, day) {
  return reduceNumber(personalMonthNumber(date, year, month) + sumDigits(day), { keepMaster: false });
}

/** Ba chu kỳ đường đời: month → day → year, switching at the first pinnacle age and 27 years later. */
export function lifeCycles({ day, month, year }, lifePath) {
  const firstEnd = 36 - singleDigit(lifePath);
  return [
    { value: reduceNumber(month), from: 0, to: firstEnd, label: 'Chu kỳ gieo hạt' },
    { value: reduceNumber(sumDigits(day)), from: firstEnd, to: firstEnd + 27, label: 'Chu kỳ phát triển' },
    { value: reduceNumber(sumDigits(year)), from: firstEnd + 27, to: null, label: 'Chu kỳ thu hoạch' },
  ];
}

export function calculateReport({ fullName, birthDate, today = new Date() }) {
  const date = parseBirthDate(birthDate, today);
  const lifePath = lifePathNumber(date);
  const name = nameNumbers(fullName);
  const chart = birthChart(date);
  const currentYear = today.getFullYear();
  return {
    date,
    lifePath,
    birthDay: birthDayNumber(date),
    attitude: attitudeNumber(date),
    maturity: name ? maturityNumber(lifePath, name.expression) : null,
    personalYear: personalYearNumber(date, currentYear),
    yearCycle: personalYearCycle(date, currentYear),
    currentYear,
    age: currentYear - date.year,
    chart,
    arrows: birthArrows(chart),
    pinnacles: pinnacles(date, lifePath),
    challenges: challenges(date),
    lifeCycles: lifeCycles(date, lifePath),
    karmicDebts: karmicDebts(date, fullName),
    karmicLessons: karmicLessons(fullName),
    hiddenPassion: hiddenPassion(fullName),
    balance: balanceNumber(fullName),
    personalMonths: [0, 1, 2].map((offset) => {
      const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1, number: personalMonthNumber(date, d.getFullYear(), d.getMonth() + 1) };
    }),
    personalDay: personalDayNumber(date, today.getFullYear(), today.getMonth() + 1, today.getDate()),
    name,
  };
}
