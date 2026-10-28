import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cycleIndex, napAm, yearPillarOf, fourPillars, elementBalance, dayMasterStrength,
  parseBirthDateTime, calculateBazi,
} from '../js/bazi/bazi.js';

test('sexagenary cycle index', () => {
  assert.equal(cycleIndex(0, 0), 0); // Giáp Tý
  assert.equal(cycleIndex(1, 1), 1); // Ất Sửu
  assert.equal(cycleIndex(0, 10), 10); // Giáp Tuất
  assert.equal(cycleIndex(9, 11), 59); // Quý Hợi
});

test('year pillars and Nạp Âm match the well-known table', () => {
  assert.equal(yearPillarOf(1990).name, 'Canh Ngọ');
  assert.equal(yearPillarOf(1984).name, 'Giáp Tý');
  assert.equal(yearPillarOf(2024).name, 'Giáp Thìn');
  const y = (year) => { const p = yearPillarOf(year); return napAm(p.stemIndex, p.branchIndex).name; };
  assert.equal(y(1990), 'Lộ Bàng Thổ');
  assert.equal(y(1984), 'Hải Trung Kim');
  assert.equal(y(2024), 'Phú Đăng Hỏa');
  assert.equal(y(1983), 'Đại Hải Thủy');
});

test('day pillars on reference dates', () => {
  assert.equal(fourPillars({ year: 2024, month: 2, day: 10 }).day.name, 'Giáp Thìn');
  assert.equal(fourPillars({ year: 2000, month: 1, day: 1 }).day.name, 'Mậu Ngọ');
});

test('year and month pillars switch at Lập Xuân, not at Tết', () => {
  const before = fourPillars({ year: 2024, month: 2, day: 3, hour: 12 });
  assert.equal(before.year.name, 'Quý Mão');
  assert.equal(before.month.name, 'Ất Sửu');
  const after = fourPillars({ year: 2024, month: 2, day: 5, hour: 12 });
  assert.equal(after.year.name, 'Giáp Thìn');
  assert.equal(after.month.name, 'Bính Dần');
});

test('hour pillar follows the Ngũ Thử Độn rule and 23:00 moves the day', () => {
  const p = fourPillars({ year: 2024, month: 2, day: 10, hour: 0 });
  assert.equal(p.hour.name, 'Giáp Tý'); // Giáp day → Giáp Tý hour
  const late = fourPillars({ year: 2024, month: 2, day: 9, hour: 23 });
  assert.equal(late.day.name, 'Giáp Thìn');
  assert.equal(fourPillars({ year: 2024, month: 2, day: 10 }).hour, null);
});

test('element balance and strength', () => {
  const pillars = fourPillars({ year: 1990, month: 8, day: 15, hour: 10 });
  const balance = elementBalance(pillars);
  assert.equal(balance.total, 8);
  assert.equal(Object.values(balance.counts).reduce((a, b) => a + b, 0), 8);
  const strength = dayMasterStrength(pillars, balance);
  assert.equal(strength.element, pillars.day.stem.element);
  assert.equal(strength.favorable.length, 2);
});

test('parseBirthDateTime validates and allows unknown time', () => {
  assert.deepEqual(parseBirthDateTime('1990-08-15', ''), { year: 1990, month: 8, day: 15, hour: null, minute: 0 });
  assert.deepEqual(parseBirthDateTime('1990-08-15', '07:45'), { year: 1990, month: 8, day: 15, hour: 7, minute: 45 });
  assert.throws(() => parseBirthDateTime('', ''), /hợp lệ/);
  assert.throws(() => parseBirthDateTime('1990-02-30', ''), /không tồn tại/);
  assert.throws(() => parseBirthDateTime('1990-08-15', '25:00'), /Giờ sinh/);
});

test('calculateBazi uses lunar year for con giáp', () => {
  // 20/01/1990 is still lunar year 1989 (Kỷ Tỵ)
  const r = calculateBazi(parseBirthDateTime('1990-01-20', ''));
  assert.equal(r.zodiac.name, 'Kỷ Tỵ');
  assert.equal(r.zodiac.animal, 'Rắn');
  assert.ok(r.dayMaster.text);
});
