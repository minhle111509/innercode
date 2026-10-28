import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fourPillars } from '../js/bazi/bazi.js';
import {
  tenGod, hiddenStems, weightedElements, seasonState, analyzeStrength, interactions,
  shenSha, luckPillars, annualPillars, analyzeAdvanced,
} from '../js/bazi/advanced.js';
import { HIDDEN_STEMS, TEN_GODS } from '../js/bazi/data.js';

test('ten gods relative to a Giáp (yang wood) day master', () => {
  const g = (s) => tenGod(0, s);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(g), [
    'Tỷ Kiên', 'Kiếp Tài', 'Thực Thần', 'Thương Quan', 'Thiên Tài',
    'Chính Tài', 'Thất Sát', 'Chính Quan', 'Thiên Ấn', 'Chính Ấn',
  ]);
  for (const name of Object.keys(TEN_GODS)) assert.ok([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(g).includes(name));
});

test('hidden stems: every branch has 1–3 with weights summing to 1', () => {
  assert.equal(HIDDEN_STEMS.length, 12);
  for (let b = 0; b < 12; b += 1) {
    const h = hiddenStems(b);
    assert.ok(h.length >= 1 && h.length <= 3);
    assert.equal(Math.round(h.reduce((s, x) => s + x.weight, 0) * 100), 100);
    // main qi of a branch shares the branch's element
  }
  assert.deepEqual(hiddenStems(1).map((h) => h.stem.name), ['Kỷ', 'Quý', 'Tân']);
  assert.deepEqual(hiddenStems(2).map((h) => h.stem.name), ['Giáp', 'Bính', 'Mậu']);
});

test('weighted elements total 8 for a full chart', () => {
  const p = fourPillars({ year: 1990, month: 8, day: 15, hour: 10 });
  const w = weightedElements(p);
  assert.equal(Math.round(Object.values(w).reduce((a, b) => a + b, 0)), 8);
});

test('season states', () => {
  assert.equal(seasonState('Mộc', 2), 'Vượng'); // Dần month
  assert.equal(seasonState('Hỏa', 2), 'Tướng');
  assert.equal(seasonState('Thủy', 2), 'Hưu');
  assert.equal(seasonState('Kim', 2), 'Tù');
  assert.equal(seasonState('Thổ', 2), 'Tử');
});

test('strength analysis returns a level and favourable elements', () => {
  const p = fourPillars({ year: 1990, month: 8, day: 15, hour: 10 }); // Nhâm day in Thân month
  const s = analyzeStrength(p);
  assert.equal(s.state, 'Tướng'); // Kim season generates Thủy
  assert.ok(['Thân vượng', 'Trung hòa', 'Thân nhược'].includes(s.level));
  assert.ok(s.favorable.length >= 2);
});

test('interactions detect clash, harmony and stem combination', () => {
  const p = fourPillars({ year: 1990, month: 8, day: 15, hour: 10 }); // Canh Ngọ, Giáp Thân, Nhâm Tý, Ất Tỵ
  const types = interactions(p).map((i) => i.type);
  assert.ok(types.includes('Lục xung')); // Ngọ – Tý
  assert.ok(types.includes('Lục hợp')); // Thân – Tỵ
});

test('shen sha are located on real pillars', () => {
  const p = fourPillars({ year: 1990, month: 8, day: 15, hour: 10 });
  for (const s of shenSha(p)) assert.ok(s.places.length > 0 && s.name && s.text);
});

test('luck pillars: direction, sequence and start age around Lập Xuân 2024', () => {
  const input = { year: 2024, month: 2, day: 3, hour: 12, minute: 0 };
  const p = fourPillars(input); // Quý Mão year (yin), Ất Sửu month
  const male = luckPillars(input, 'male', p);
  assert.equal(male.forward, false);
  assert.deepEqual(male.pillars.slice(0, 3).map((x) => x.name), ['Giáp Tý', 'Quý Hợi', 'Nhâm Tuất']);
  assert.ok(male.startYears >= 8 && male.startYears <= 10, `male start ${male.startYears}`);
  const female = luckPillars(input, 'female', p);
  assert.equal(female.forward, true);
  assert.deepEqual(female.pillars.slice(0, 2).map((x) => x.name), ['Bính Dần', 'Đinh Mão']);
  assert.equal(female.startYears, 0);
  assert.ok(female.startMonths >= 3 && female.startMonths <= 5, `female months ${female.startMonths}`);
  assert.equal(luckPillars(input, '', p), null);
});

test('annual pillars and full analysis', () => {
  const years = annualPillars(2026, 3, 8);
  assert.deepEqual(years.map((y) => y.name), ['Bính Ngọ', 'Đinh Mùi', 'Mậu Thân']);
  const input = { year: 1990, month: 8, day: 15, hour: 10, minute: 0 };
  const a = analyzeAdvanced(input, 'female', fourPillars(input), new Date(2026, 9, 28));
  assert.equal(a.luck.pillars.length, 8);
  assert.ok(a.luck.currentIndex >= 0);
  assert.equal(a.years.length, 5);
  for (const y of a.years) assert.ok(['Rất thuận', 'Thuận vừa', 'Thử thách'].includes(y.rating));
});

test('balanced charts never pick the Day Master element as the weakest', () => {
  const p = fourPillars({ year: 1990, month: 8, day: 15, hour: 10 });
  const s = analyzeStrength(p);
  if (s.level === 'Trung hòa') {
    assert.ok(!s.favorable.includes(p.day.stem.element));
    assert.deepEqual(s.favorable, ['Thổ', 'Hỏa']);
  }
});
