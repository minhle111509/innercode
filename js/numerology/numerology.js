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
