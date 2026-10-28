import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reduceArcana, calculateMatrix, calculateMatrixReport } from '../js/matrix/matrix.js';
import { ARCANA, POSITIONS, PURPOSES } from '../js/matrix/meanings.js';

const TODAY = new Date(2026, 9, 28);

test('reduceArcana keeps 1–22 and sums digits above 22', () => {
  assert.equal(reduceArcana(1), 1);
  assert.equal(reduceArcana(22), 22);
  assert.equal(reduceArcana(23), 5);
  assert.equal(reduceArcana(31), 4);
  assert.equal(reduceArcana(48), 12);
  assert.equal(reduceArcana(99), 18);
});

test('reduceArcana rejects invalid input', () => {
  assert.throws(() => reduceArcana(0), RangeError);
  assert.throws(() => reduceArcana(-3), RangeError);
  assert.throws(() => reduceArcana(2.5), RangeError);
});

test('calculateMatrix for 15/08/1990 (hand-computed)', () => {
  const { points, purposes } = calculateMatrix({ day: 15, month: 8, year: 1990 });
  assert.deepEqual(points, {
    A: 15, B: 8, C: 19, D: 6, E: 12,
    F: 5, G: 9, H: 7, I: 21,
    A1: 9, A2: 6, B1: 20, B2: 10, C1: 4, C2: 5, D1: 18, D2: 6,
    X: 22, money: 8, love: 4,
  });
  assert.deepEqual(purposes, {
    sky: 14, earth: 7, personal: 21, male: 12, female: 3, social: 15, spiritual: 9, planetary: 6,
  });
});

test('calculateMatrix reduces day above 22 and year digit sum', () => {
  const { points } = calculateMatrix({ day: 31, month: 12, year: 1999 });
  assert.equal(points.A, 4);
  assert.equal(points.B, 12);
  assert.equal(points.C, 10);
  assert.equal(points.D, 8);
  assert.equal(points.E, 7);
});

test('every date in a range yields arcana 1–22 that all have meanings', () => {
  for (let year = 1900; year <= 2026; year += 7) {
    for (let month = 1; month <= 12; month += 1) {
      for (const day of [1, 9, 22, 23, 28]) {
        const { points, purposes } = calculateMatrix({ day, month, year });
        for (const value of [...Object.values(points), ...Object.values(purposes)]) {
          assert.ok(ARCANA[value], `no meaning for ${value} (${day}/${month}/${year})`);
        }
      }
    }
  }
});

test('meaning tables are complete', () => {
  for (let n = 1; n <= 22; n += 1) {
    for (const field of ['name', 'keywords', 'plus', 'minus']) assert.ok(ARCANA[n][field]);
  }
  const { points, purposes } = calculateMatrix({ day: 1, month: 1, year: 2000 });
  for (const p of POSITIONS) {
    assert.ok(p.key in points);
    for (const k of p.trio ?? []) assert.ok(k in points);
  }
  for (const p of PURPOSES) assert.ok(p.key in purposes);
});

test('calculateMatrixReport validates the birth date', () => {
  assert.equal(calculateMatrixReport({ birthDate: '1990-08-15', today: TODAY }).points.E, 12);
  assert.throws(() => calculateMatrixReport({ birthDate: '2030-01-01', today: TODAY }), /tương lai/);
  assert.throws(() => calculateMatrixReport({ birthDate: '', today: TODAY }), /hợp lệ/);
});
