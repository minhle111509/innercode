/**
 * Mai Hoa Dịch Số (Plum Blossom numerology, Thiệu Khang Tiết) – pure logic, no DOM.
 *
 * Time method:  upper = (year branch + lunar month + lunar day) mod 8
 *               lower = (that sum + hour branch) mod 8
 *               moving line = (that total) mod 6        (remainder 0 → 8 / 6)
 * Number method: upper = n1 mod 8, lower = n2 mod 8, moving = (n1 + n2 [+ hour]) mod 6
 */

import { solarToLunar } from './lunar.js';
import { TRIGRAMS, findHexagram, EARTHLY_BRANCHES, RELATIONS } from './data.js';

const GENERATES = { Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim', Kim: 'Thủy', Thủy: 'Mộc' };
const CONTROLS = { Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim', Kim: 'Mộc' };
const MIN_YEAR = 1900;
const MAX_YEAR = 2199;
const MAX_NUMBER = 999999;

const cycle = (n, size) => ((n - 1) % size) + 1;
export const toTrigramNumber = (n) => cycle(n, 8);
export const toMovingLine = (n) => cycle(n, 6);

export function yearBranch(lunarYear) {
  const index = (((lunarYear - 4) % 12) + 12) % 12;
  return { index, name: EARTHLY_BRANCHES[index], number: index + 1 };
}

/** Giờ Tý = 23:00–00:59, Sửu = 01:00–02:59, … */
export function hourBranch(hour) {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new RangeError(`Invalid hour: ${hour}`);
  const index = Math.floor((hour + 1) / 2) % 12;
  return { index, name: EARTHLY_BRANCHES[index], number: index + 1 };
}

export function trigramFromLines(lines) {
  const found = Object.values(TRIGRAMS).find((t) => t.lines.every((v, i) => v === lines[i]));
  if (!found) throw new RangeError(`Invalid trigram lines: ${lines}`);
  return found;
}

export function elementRelation(tiElement, yongElement) {
  if (tiElement === yongElement) return { key: 'same', ...RELATIONS.same };
  if (GENERATES[yongElement] === tiElement) return { key: 'yongGeneratesTi', ...RELATIONS.yongGeneratesTi };
  if (CONTROLS[tiElement] === yongElement) return { key: 'tiControlsYong', ...RELATIONS.tiControlsYong };
  if (GENERATES[tiElement] === yongElement) return { key: 'tiGeneratesYong', ...RELATIONS.tiGeneratesYong };
  return { key: 'yongControlsTi', ...RELATIONS.yongControlsTi };
}

function hexagramFromLines(lines) {
  const lower = trigramFromLines(lines.slice(0, 3));
  const upper = trigramFromLines(lines.slice(3, 6));
  return { ...findHexagram(upper.number, lower.number), lines, upperTrigram: upper, lowerTrigram: lower };
}

/** Build main / mutual / changed hexagrams and the Thể–Dụng analysis. */
export function buildReading(upperNumber, lowerNumber, movingLine) {
  if (!TRIGRAMS[upperNumber] || !TRIGRAMS[lowerNumber]) throw new RangeError('Trigram number must be 1–8');
  if (!Number.isInteger(movingLine) || movingLine < 1 || movingLine > 6) throw new RangeError('Moving line must be 1–6');

  const lines = [...TRIGRAMS[lowerNumber].lines, ...TRIGRAMS[upperNumber].lines];
  const main = hexagramFromLines(lines);
  const mutual = hexagramFromLines([...lines.slice(1, 4), ...lines.slice(2, 5)]);
  const changedLines = lines.map((v, i) => (i === movingLine - 1 ? 1 - v : v));
  const changed = hexagramFromLines(changedLines);

  // The trigram holding the moving line is Dụng (the matter); the other is Thể (the asker).
  const movingInLower = movingLine <= 3;
  const ti = movingInLower ? main.upperTrigram : main.lowerTrigram;
  const yong = movingInLower ? main.lowerTrigram : main.upperTrigram;
  const changedYong = movingInLower ? changed.lowerTrigram : changed.upperTrigram;

  return {
    main,
    mutual,
    changed,
    movingLine,
    ti,
    yong,
    changedYong,
    relation: elementRelation(ti.element, yong.element),
    outcome: elementRelation(ti.element, changedYong.element),
  };
}

/** Parse "YYYY-MM-DDTHH:MM" (value of <input type="datetime-local">). */
export function parseDateTime(input) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(input ?? '').trim());
  if (!match) throw new Error('Vui lòng chọn ngày giờ hợp lệ.');
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day
    || hour > 23 || minute > 59) {
    throw new Error('Ngày giờ không tồn tại.');
  }
  if (year < MIN_YEAR || year > MAX_YEAR) throw new Error(`Năm phải trong khoảng ${MIN_YEAR}–${MAX_YEAR}.`);
  return { year, month, day, hour, minute };
}

export function castByTime({ year, month, day, hour }) {
  // Giờ Tý starts at 23:00 and belongs to the next day.
  const base = new Date(Date.UTC(year, month - 1, hour === 23 ? day + 1 : day));
  const lunar = solarToLunar(base.getUTCDate(), base.getUTCMonth() + 1, base.getUTCFullYear());
  const yb = yearBranch(lunar.year);
  const hb = hourBranch(hour);

  const upperSum = yb.number + lunar.month + lunar.day;
  const total = upperSum + hb.number;
  return {
    method: 'time',
    lunar,
    yearBranch: yb,
    hourBranch: hb,
    upperSum,
    total,
    ...buildReading(toTrigramNumber(upperSum), toTrigramNumber(total), toMovingLine(total)),
  };
}

function validNumber(value, label) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > MAX_NUMBER) {
    throw new Error(`${label} phải là số nguyên từ 1 đến ${MAX_NUMBER}.`);
  }
  return n;
}

export function castByNumbers(first, second, { hour = null } = {}) {
  const n1 = validNumber(first, 'Số thứ nhất');
  const n2 = validNumber(second, 'Số thứ hai');
  const hb = hour === null ? null : hourBranch(hour);
  const total = n1 + n2 + (hb ? hb.number : 0);
  return {
    method: 'numbers',
    numbers: [n1, n2],
    hourBranch: hb,
    total,
    ...buildReading(toTrigramNumber(n1), toTrigramNumber(n2), toMovingLine(total)),
  };
}
