import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateMatrix } from '../js/matrix/matrix.js';
import {
  CHAKRAS, healthChart, ageForecast, currentPeriod, ancestralLines, karmicTail,
} from '../js/matrix/advanced.js';

const { points } = calculateMatrix({ day: 15, month: 8, year: 1990 });

test('health chart for 15/08/1990 (hand-computed)', () => {
  const chart = healthChart(points);
  assert.equal(chart.rows.length, 7);
  const pairs = chart.rows.map((row) => [row.physical, row.energy, row.emotion]);
  assert.deepEqual(pairs, [
    [15, 8, 5], // A, B, 15+8 = 23 → 5
    [6, 10, 16], // A2, B2
    [9, 20, 11], // A1, B1, 29 → 11
    [21, 5, 8], // A3 = 9+12, B3 = 20+12 = 32 → 5; 26 → 8
    [12, 12, 6], // E, E, 24 → 6
    [4, 18, 22], // C1, D1
    [19, 6, 7], // C, D, 25 → 7
  ]);
  assert.deepEqual(chart.total, { physical: 14, energy: 16, emotion: 12 }); // 86→14, 79→16, 75→12
  assert.equal(CHAKRAS.length, 7);
});

test('age forecast has 64 periods covering 0–80 and starts at A', () => {
  const periods = ageForecast(points);
  assert.equal(periods.length, 64);
  assert.equal(periods[0].from, 0);
  assert.equal(periods[63].to, 80);
  assert.equal(periods[0].value, points.A);
  assert.equal(periods[8].value, points.F); // age 10
  assert.equal(periods[16].value, points.B); // age 20
  assert.equal(periods[32].value, points.C); // age 40
});

test('age 5 is the midpoint A + F', () => {
  const periods = ageForecast(points);
  assert.equal(periods[4].from, 5);
  assert.equal(periods[4].value, 20); // A + F = 15 + 5
});

test('currentPeriod and every value is a valid arcana', () => {
  const periods = ageForecast(points);
  assert.equal(currentPeriod(periods, 36).from, 35);
  assert.equal(currentPeriod(periods, 99).to, 80);
  for (const p of periods) assert.ok(p.value >= 1 && p.value <= 22);
});

test('ancestral lines and karmic tail', () => {
  const lines = ancestralLines(points);
  assert.deepEqual(lines.paternal.points, [5, 7]);
  assert.equal(lines.paternal.line, 12);
  assert.deepEqual(lines.maternal.points, [9, 21]);
  assert.equal(lines.maternal.line, 3);
  assert.deepEqual(karmicTail(points).map((s) => s.value), [6, 6, 18]);
});
