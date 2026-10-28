import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sumDigits, reduceNumber, reduceLifePath, parseBirthDate, lifePathNumber,
  personalYearNumber, birthChart, normalizeName, letterValue, nameNumbers, calculateReport,
} from '../js/numerology/numerology.js';
import { NUMBER_MEANINGS, PERSONAL_YEAR_MEANINGS } from '../js/numerology/meanings.js';
import {
  karmicDebts, karmicLessons, hiddenPassion, balanceNumber, personalMonthNumber, personalDayNumber, lifeCycles,
} from '../js/numerology/numerology.js';
import { KARMIC_DEBT_MEANINGS, LESSON_MEANINGS, POSITION_TEXTS } from '../js/numerology/meanings.js';
import {
  attitudeNumber, maturityNumber, pinnacles, challenges, birthArrows, personalYearCycle,
} from '../js/numerology/numerology.js';
import { NUMBER_DETAILS, CHALLENGE_MEANINGS, ARROW_MEANINGS } from '../js/numerology/meanings.js';

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

test('attitude and maturity numbers', () => {
  assert.equal(attitudeNumber({ day: 15, month: 8 }), 5); // 1+5+8 = 14 → 5
  assert.equal(attitudeNumber({ day: 29, month: 9 }), 2); // 2+9+9 = 20 → 2
  assert.equal(attitudeNumber({ day: 2, month: 9 }), 11); // master number kept
  assert.equal(maturityNumber(33, 3), 9);
});

test('pinnacles and challenges for 15/08/1990 (hand-computed)', () => {
  const date = { day: 15, month: 8, year: 1990 };
  assert.deepEqual(pinnacles(date, 33), [
    { value: 5, age: 30 }, { value: 7, age: 39 }, { value: 3, age: 48 }, { value: 9, age: 57 },
  ]);
  assert.deepEqual(challenges(date), [2, 5, 3, 7]);
  assert.equal(pinnacles(date, 10)[0].age, 35); // life path 10 counts as 1
});

test('birth arrows detect full and empty lines', () => {
  const full = { 1: 1, 2: 0, 3: 0, 4: 0, 5: 1, 6: 0, 7: 0, 8: 1, 9: 2 };
  assert.deepEqual(birthArrows(full), [{ line: '159', type: 'full' }]);
  const sparse = { 1: 2, 2: 2, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 1 };
  assert.deepEqual(birthArrows(sparse).map((a) => `${a.line}:${a.type}`), ['456:empty', '357:empty']);
});

test('personal year cycle and meaning tables are complete', () => {
  const cycle = personalYearCycle({ day: 15, month: 8 }, 2026, 4);
  assert.deepEqual(cycle.map((c) => c.year), [2026, 2027, 2028, 2029]);
  assert.equal(cycle[0].number, 6);
  assert.equal(cycle[1].number, 7);
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 22, 33]) assert.ok(NUMBER_DETAILS[n].career && NUMBER_DETAILS[n].love);
  for (let n = 0; n <= 8; n += 1) assert.ok(CHALLENGE_MEANINGS[n]);
  for (const line of ['123', '456', '789', '147', '258', '369', '159', '357']) {
    assert.ok(ARROW_MEANINGS[line].full && ARROW_MEANINGS[line].empty);
  }
});

test('calculateReport includes the deeper sections', () => {
  const report = calculateReport({ fullName: 'An', birthDate: '1990-08-15', today: TODAY });
  assert.equal(report.attitude, 5);
  assert.equal(report.maturity, maturityNumber(33, 6));
  assert.equal(report.pinnacles.length, 4);
  assert.equal(report.age, 36);
  assert.ok(NUMBER_MEANINGS[report.maturity]);
  for (const p of report.pinnacles) assert.ok(NUMBER_MEANINGS[p.value]);
});

test('karmic debt numbers are found in day and reduction chains', () => {
  assert.deepEqual(karmicDebts({ day: 13, month: 1, year: 2000 }), [{ source: 'Ngày sinh', number: 13 }]);
  // 19/07/1990: 1+9+7+1+9+9+0 = 36 → 9, no debt in life path; day 19 is a debt
  assert.deepEqual(karmicDebts({ day: 19, month: 7, year: 1990 }).map((d) => d.number), [19]);
  // 04/05/2005: 4+5+7 = 16 → 7, debt 16 on the life path
  assert.deepEqual(karmicDebts({ day: 4, month: 5, year: 2005 }), [{ source: 'Số chủ đạo', number: 16 }]);
  assert.deepEqual(karmicDebts({ day: 15, month: 8, year: 1990 }), []);
});

test('karmic lessons, hidden passion and balance from the name', () => {
  // AN: A=1, N=5 → lessons are every other digit
  assert.deepEqual(karmicLessons('An'), [2, 3, 4, 6, 7, 8, 9]);
  assert.equal(karmicLessons(''), null);
  // HOA: H=8, O=6, A=1; ANNA: A=1 N=5 N=5 A=1
  assert.deepEqual(hiddenPassion('Anna'), { numbers: [1, 5], count: 2 });
  // Nguyễn Thị Hoa → initials N(5) T(2) H(8) = 15 → 6
  assert.equal(balanceNumber('Nguyễn Thị Hoa'), 6);
  assert.equal(balanceNumber('   '), null);
});

test('personal month and day', () => {
  const date = { day: 15, month: 8 };
  assert.equal(personalMonthNumber(date, 2026, 10), 7); // year 6 + month 10 = 16 → 7
  assert.equal(personalDayNumber(date, 2026, 10, 28), 8); // 7 + 2+8 = 17 → 8
});

test('life cycles switch at the first pinnacle age', () => {
  const cycles = lifeCycles({ day: 15, month: 8, year: 1990 }, 33);
  assert.deepEqual(cycles.map((c) => [c.value, c.from, c.to]), [[8, 0, 30], [6, 30, 57], [1, 57, null]]);
});

test('new meaning tables are complete', () => {
  for (const n of [13, 14, 16, 19]) assert.ok(KARMIC_DEBT_MEANINGS[n]);
  for (let d = 1; d <= 9; d += 1) assert.ok(LESSON_MEANINGS[d]);
  for (const position of ['soul', 'personality', 'expression', 'birthday']) {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 22, 33]) assert.ok(POSITION_TEXTS[position][n], `${position} ${n}`);
  }
});
