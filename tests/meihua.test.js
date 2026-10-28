import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solarToLunar } from '../js/meihua/lunar.js';
import { TRIGRAMS, HEXAGRAMS, findHexagram } from '../js/meihua/data.js';
import {
  toTrigramNumber, toMovingLine, yearBranch, hourBranch, elementRelation,
  buildReading, parseDateTime, castByTime, castByNumbers,
} from '../js/meihua/meihua.js';

test('solarToLunar matches known Vietnamese calendar dates', () => {
  assert.deepEqual(solarToLunar(10, 2, 2024), { day: 1, month: 1, year: 2024, leap: false }); // Tết Giáp Thìn
  assert.deepEqual(solarToLunar(29, 1, 2025), { day: 1, month: 1, year: 2025, leap: false }); // Tết Ất Tỵ
  assert.deepEqual(solarToLunar(17, 2, 2026), { day: 1, month: 1, year: 2026, leap: false }); // Tết Bính Ngọ
  assert.deepEqual(solarToLunar(6, 10, 2025), { day: 15, month: 8, year: 2025, leap: false }); // Trung thu 2025
  assert.deepEqual(solarToLunar(9, 2, 2024), { day: 30, month: 12, year: 2023, leap: false }); // Giao thừa
  assert.deepEqual(solarToLunar(22, 3, 2023), { day: 1, month: 2, year: 2023, leap: true }); // tháng 2 nhuận 2023
  assert.deepEqual(solarToLunar(25, 7, 2025), { day: 1, month: 6, year: 2025, leap: true }); // tháng 6 nhuận 2025
});

test('trigram and line numbers wrap with remainder 0 → 8 / 6', () => {
  assert.equal(toTrigramNumber(8), 8);
  assert.equal(toTrigramNumber(16), 8);
  assert.equal(toTrigramNumber(29), 5);
  assert.equal(toMovingLine(6), 6);
  assert.equal(toMovingLine(35), 5);
});

test('earthly branches for years and hours', () => {
  assert.equal(yearBranch(2024).name, 'Thìn');
  assert.equal(yearBranch(2025).name, 'Tỵ');
  assert.equal(yearBranch(2025).number, 6);
  assert.equal(hourBranch(23).name, 'Tý');
  assert.equal(hourBranch(0).name, 'Tý');
  assert.equal(hourBranch(1).name, 'Sửu');
  assert.equal(hourBranch(11).name, 'Ngọ');
  assert.equal(hourBranch(22).name, 'Hợi');
  assert.throws(() => hourBranch(24), RangeError);
});

test('64 hexagrams are complete and named after their trigrams', () => {
  assert.equal(HEXAGRAMS.length, 64);
  assert.equal(new Set(HEXAGRAMS.map((h) => `${h.upper}-${h.lower}`)).size, 64);
  assert.deepEqual(HEXAGRAMS.map((h) => h.number), Array.from({ length: 64 }, (_, i) => i + 1));
  for (const h of HEXAGRAMS) {
    const expected = h.upper === h.lower
      ? `Thuần ${TRIGRAMS[h.upper].name}`
      : `${TRIGRAMS[h.upper].hanViet} ${TRIGRAMS[h.lower].hanViet}`;
    assert.ok(h.name.startsWith(expected), `${h.number} ${h.name} should start with ${expected}`);
    assert.ok(h.meaning);
  }
  assert.throws(() => findHexagram(9, 1), RangeError);
});

test('elementRelation covers the five Thể–Dụng cases', () => {
  assert.equal(elementRelation('Kim', 'Kim').key, 'same');
  assert.equal(elementRelation('Hỏa', 'Mộc').key, 'yongGeneratesTi');
  assert.equal(elementRelation('Kim', 'Mộc').key, 'tiControlsYong');
  assert.equal(elementRelation('Hỏa', 'Thổ').key, 'tiGeneratesYong');
  assert.equal(elementRelation('Mộc', 'Kim').key, 'yongControlsTi');
});

test('buildReading computes main, mutual and changed hexagrams', () => {
  const r = buildReading(5, 3, 5); // Tốn over Ly, moving line 5
  assert.equal(r.main.name, 'Phong Hỏa Gia Nhân');
  assert.equal(r.mutual.name, 'Hỏa Thủy Vị Tế');
  assert.equal(r.changed.name, 'Sơn Hỏa Bí');
  assert.equal(r.yong.name, 'Tốn');
  assert.equal(r.ti.name, 'Ly');
  assert.equal(r.relation.key, 'yongGeneratesTi');
  assert.equal(r.outcome.key, 'tiGeneratesYong');
  assert.throws(() => buildReading(0, 1, 1), RangeError);
  assert.throws(() => buildReading(1, 1, 7), RangeError);
});

test('castByTime on 06/10/2025 10:30 (15/8 Ất Tỵ, giờ Tỵ)', () => {
  const r = castByTime(parseDateTime('2025-10-06T10:30'));
  assert.equal(r.yearBranch.name, 'Tỵ');
  assert.equal(r.hourBranch.name, 'Tỵ');
  assert.equal(r.upperSum, 29);
  assert.equal(r.total, 35);
  assert.equal(r.main.number, 37);
  assert.equal(r.movingLine, 5);
});

test('castByTime treats 23:00 as giờ Tý of the next day', () => {
  const r = castByTime(parseDateTime('2025-10-05T23:10'));
  assert.equal(r.lunar.day, 15);
  assert.equal(r.hourBranch.name, 'Tý');
});

test('parseDateTime validates input', () => {
  assert.throws(() => parseDateTime(''), /hợp lệ/);
  assert.throws(() => parseDateTime('2025-02-30T10:00'), /không tồn tại/);
  assert.throws(() => parseDateTime('1800-01-01T10:00'), /1900/);
});

test('castByNumbers uses remainders and optional hour', () => {
  const r = castByNumbers('5', '3');
  assert.equal(r.main.name, 'Phong Hỏa Gia Nhân');
  assert.equal(r.movingLine, 2);
  assert.equal(castByNumbers(5, 3, { hour: 10 }).movingLine, toMovingLine(5 + 3 + 6));
  assert.throws(() => castByNumbers(0, 3), /Số thứ nhất/);
  assert.throws(() => castByNumbers(4, 'abc'), /Số thứ hai/);
  assert.throws(() => castByNumbers(1.5, 2), /Số thứ nhất/);
});
