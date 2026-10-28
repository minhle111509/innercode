import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, rankThemes, yearInfluence, buildProfile } from '../js/profile/profile.js';

const TODAY = new Date(2026, 9, 28);

test('rankThemes weights and keeps sources', () => {
  const ranked = rankThemes([
    { label: 'A', themes: ['care'], weight: 2 },
    { label: 'B', themes: ['care', 'lead'], weight: 1 },
    { label: 'C', themes: ['lead'], weight: 1 },
  ]);
  assert.equal(ranked[0].key, 'care');
  assert.deepEqual(ranked[0].sources, ['A', 'B']);
  assert.equal(ranked[1].key, 'lead');
  assert.equal(ranked[0].name, THEMES.care.name);
});

test('yearInfluence covers the five relations', () => {
  assert.equal(yearInfluence('Hỏa', 'Hỏa').name, 'Tỷ Kiếp');
  assert.equal(yearInfluence('Hỏa', 'Mộc').name, 'Ấn Tinh');
  assert.equal(yearInfluence('Hỏa', 'Thổ').name, 'Thực Thương');
  assert.equal(yearInfluence('Hỏa', 'Kim').name, 'Tài Tinh');
  assert.equal(yearInfluence('Hỏa', 'Thủy').name, 'Quan Sát');
});

test('buildProfile cross-references all systems', () => {
  const p = buildProfile({ fullName: 'Nguyễn Thị Hoa', birthDate: '1990-08-15', birthTime: '07:30', today: TODAY });
  assert.equal(p.numerology.lifePath, 33);
  assert.equal(p.matrix.points.E, 12);
  assert.equal(p.rows.length, 6);
  for (const row of p.rows) {
    for (const field of ['topic', 'numerology', 'matrix', 'bazi']) assert.ok(row[field] && !row[field].includes('undefined'), `${row.topic} ${field}`);
  }
  assert.ok(p.themes.length >= 2);
  assert.equal(p.practices.length, 3);
  assert.equal(p.currentYearPillar.name, 'Bính Ngọ');
  assert.ok(!p.summary.includes('undefined'));
});

test('buildProfile works without name and time, and validates date', () => {
  const p = buildProfile({ birthDate: '2001-01-01', today: TODAY });
  assert.equal(p.numerology.name, null);
  assert.equal(p.bazi.pillars.hour, null);
  assert.throws(() => buildProfile({ birthDate: '', today: TODAY }), /hợp lệ/);
});

test('every reachable number and arcana maps to themes', async () => {
  const { calculateMatrix } = await import('../js/matrix/matrix.js');
  for (let year = 1930; year <= 2020; year += 3) {
    for (let month = 1; month <= 12; month += 1) {
      for (const day of [1, 7, 15, 23, 28]) {
        const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const p = buildProfile({ fullName: 'Lan', birthDate, today: TODAY });
        assert.ok(p.themes.length > 0);
        assert.ok(!p.summary.includes('undefined'), birthDate);
        assert.ok(calculateMatrix({ day, month, year }));
      }
    }
  }
});
