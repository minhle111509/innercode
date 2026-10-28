import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sumDigits, reduceNumber, reduceLifePath, parseBirthDate, lifePathNumber,
  personalYearNumber, birthChart, normalizeName, letterValue, nameNumbers, calculateReport,
} from '../js/numerology/numerology.js';
import { NUMBER_MEANINGS, PERSONAL_YEAR_MEANINGS } from '../js/numerology/meanings.js';

const TODAY = new Date(2026, 9, 28);

test('sumDigits handles numbers and strings', () => {
  assert.equal(sumDigits(1990), 19);
  assert.equal(sumDigits('15/08/1990'), 33);
});

test('reduceNumber keeps master numbers unless disabled', () => {
  assert.equal(reduceNumber(29), 11);
  assert.equal(reduceNumber(29, { keepMaster: false }), 2);
  assert.equal(reduceNumber(38), 11);
  assert.equal(reduceNumber(7), 7);
});

test('reduceLifePath stops at 2–11, 22, 33', () => {
  assert.equal(reduceLifePath(28), 10);
  assert.equal(reduceLifePath(10), 10);
  assert.equal(reduceLifePath(22), 22);
  assert.equal(reduceLifePath(33), 33);
  assert.equal(reduceLifePath(40), 4);
  assert.equal(reduceLifePath(47), 11);
});

test('lifePathNumber on known dates', () => {
  assert.equal(lifePathNumber({ day: 15, month: 8, year: 1990 }), 33);
  assert.equal(lifePathNumber({ day: 29, month: 12, year: 1988 }), 4);
  assert.equal(lifePathNumber({ day: 19, month: 9, year: 1999 }), 11);
  assert.equal(lifePathNumber({ day: 1, month: 1, year: 2006 }), 10);
});

test('parseBirthDate accepts valid dates', () => {
  assert.deepEqual(parseBirthDate('2000-02-29', TODAY), { day: 29, month: 2, year: 2000 });
});

test('parseBirthDate rejects invalid input', () => {
  assert.throws(() => parseBirthDate('', TODAY), /hợp lệ/);
  assert.throws(() => parseBirthDate('abc', TODAY), /hợp lệ/);
  assert.throws(() => parseBirthDate(undefined, TODAY), /hợp lệ/);
  assert.throws(() => parseBirthDate('2001-02-29', TODAY), /không tồn tại/);
  assert.throws(() => parseBirthDate('2000-13-01', TODAY), /không tồn tại/);
  assert.throws(() => parseBirthDate('1899-12-31', TODAY), /1900/);
  assert.throws(() => parseBirthDate('2026-10-29', TODAY), /tương lai/);
});

test('personalYearNumber reduces to 1–9', () => {
  // 15/08 in 2026: 1+5+8 + 2+0+2+6 = 24 → 6
  assert.equal(personalYearNumber({ day: 15, month: 8 }, 2026), 6);
  // 29/09 in 2026: 2+9+9+10 = 30 → 3
  assert.equal(personalYearNumber({ day: 29, month: 9 }, 2026), 3);
});

test('birthChart counts digits and ignores zeros', () => {
  const chart = birthChart({ day: 15, month: 8, year: 1990 });
  assert.deepEqual(chart, { 1: 2, 2: 0, 3: 0, 4: 0, 5: 1, 6: 0, 7: 0, 8: 1, 9: 2 });
});

test('normalizeName strips Vietnamese diacritics and junk', () => {
  assert.equal(normalizeName('  Nguyễn   Thị Đào <script> '), 'NGUYEN THI DAO SCRIPT');
  assert.equal(normalizeName(null), '');
});

test('letterValue follows Pythagorean table', () => {
  assert.equal(letterValue('A'), 1);
  assert.equal(letterValue('I'), 9);
  assert.equal(letterValue('J'), 1);
  assert.equal(letterValue('Z'), 8);
  assert.throws(() => letterValue('1'), RangeError);
});

test('nameNumbers computes expression, soul urge and personality', () => {
  // AN: A=1, N=5 → expression 6, vowels 1, consonants 5
  assert.deepEqual(nameNumbers('An'), { expression: 6, soulUrge: 1, personality: 5 });
  assert.equal(nameNumbers('   '), null);
  assert.equal(nameNumbers('123'), null);
  assert.deepEqual(nameNumbers('A'), { expression: 1, soulUrge: 1, personality: null });
});

test('calculateReport returns numbers that all have meanings', () => {
  const report = calculateReport({ fullName: 'Nguyễn Thị Hoa', birthDate: '1990-08-15', today: TODAY });
  assert.equal(report.lifePath, 33);
  assert.equal(report.birthDay, 6);
  assert.equal(report.currentYear, 2026);
  assert.ok(NUMBER_MEANINGS[report.lifePath]);
  assert.ok(PERSONAL_YEAR_MEANINGS[report.personalYear]);
  for (const value of Object.values(report.name)) assert.ok(NUMBER_MEANINGS[value]);
});

test('every reachable life path has a meaning', () => {
  for (let total = 1; total <= 60; total += 1) {
    assert.ok(NUMBER_MEANINGS[reduceLifePath(total)], `missing meaning for total ${total}`);
  }
});
