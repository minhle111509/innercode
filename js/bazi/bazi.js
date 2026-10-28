/**
 * Bát Tự (Four Pillars) – pure logic, no DOM.
 * - Year and month pillars change at the solar terms (Lập Xuân, Kinh Trập, …), not at Tết.
 * - Day pillar from the Julian day number; from 23:00 the day pillar moves to the next day.
 * - "Tuổi" (con giáp) and Nạp Âm follow the Vietnamese custom of the lunar year.
 */

import { jdFromDate, solarToLunar, sunLongitudeDegrees } from '../shared/lunar.js';
import { STEMS, BRANCHES, NAP_AM, ELEMENTS, DAY_MASTERS } from './data.js';

const VIETNAM_TZ = 7;
export const ELEMENT_ORDER = ['Mộc', 'Hỏa', 'Thổ', 'Kim', 'Thủy'];
const GENERATES = { Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim', Kim: 'Thủy', Thủy: 'Mộc' };
const CONTROLS = { Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim', Kim: 'Mộc' };
const generatorOf = (element) => ELEMENT_ORDER.find((e) => GENERATES[e] === element);

function pillar(stemIndex, branchIndex) {
  const stem = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  return { stemIndex, branchIndex, stem, branch, name: `${stem.name} ${branch.name}` };
}

/** Position 0–59 in the sexagenary cycle for a stem/branch pair. */
export function cycleIndex(stemIndex, branchIndex) {
  return (((6 * stemIndex - 5 * branchIndex) % 60) + 60) % 60;
}

export function napAm(stemIndex, branchIndex) {
  const [name, image] = NAP_AM[Math.floor(cycleIndex(stemIndex, branchIndex) / 2)];
  return { name, image, element: name.split(' ').pop() };
}

export function yearPillarOf(year) {
  return pillar((((year + 6) % 10) + 10) % 10, (((year + 8) % 12) + 12) % 12);
}

function addDays({ year, month, day }, n) {
  const d = new Date(Date.UTC(year, month - 1, day + n));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/**
 * @param {{year:number, month:number, day:number, hour?:number|null, minute?:number}} input
 * hour = null when the birth time is unknown (hour pillar is then omitted).
 */
export function fourPillars({ year, month, day, hour = null, minute = 0 }) {
  const dayDate = hour === 23 ? addDays({ year, month, day }, 1) : { year, month, day };
  const jdn = jdFromDate(dayDate.day, dayDate.month, dayDate.year);
  const dayPillar = pillar((jdn + 9) % 10, (jdn + 1) % 12);

  // Solar-term month: 0 = Dần (starts at 315°, Lập Xuân), 1 = Mão (345°), …
  const clock = hour ?? 12;
  const jdUT = jdFromDate(day, month, year) - 0.5 + (clock + minute / 60 - VIETNAM_TZ) / 24;
  const longitude = sunLongitudeDegrees(jdUT);
  const termMonth = Math.floor((((longitude - 315) % 360) + 360) % 360 / 30);
  const pillarYear = month <= 2 && termMonth >= 10 ? year - 1 : year;

  const yearPillar = yearPillarOf(pillarYear);
  const monthPillar = pillar(((yearPillar.stemIndex % 5) * 2 + 2 + termMonth) % 10, (2 + termMonth) % 12);

  let hourPillar = null;
  if (hour !== null) {
    const branchIndex = Math.floor((hour + 1) / 2) % 12;
    hourPillar = pillar(((dayPillar.stemIndex % 5) * 2 + branchIndex) % 10, branchIndex);
  }
  return { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar };
}

export function elementBalance(pillars) {
  const counts = Object.fromEntries(ELEMENT_ORDER.map((e) => [e, 0]));
  for (const p of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    if (!p) continue;
    counts[p.stem.element] += 1;
    counts[p.branch.element] += 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const max = Math.max(...Object.values(counts));
  return {
    counts,
    total,
    strongest: ELEMENT_ORDER.filter((e) => counts[e] === max),
    missing: ELEMENT_ORDER.filter((e) => counts[e] === 0),
  };
}

/**
 * Simplified strength check: Day Master is "vượng" when its own element plus the element
 * that generates it make up at least half of all characters.
 */
export function dayMasterStrength(pillars, balance = elementBalance(pillars)) {
  const element = pillars.day.stem.element;
  const support = balance.counts[element] + balance.counts[generatorOf(element)];
  const strong = support * 2 >= balance.total;
  const favorable = strong
    ? [GENERATES[element], CONTROLS[element]]
    : [element, generatorOf(element)];
  return { element, support, total: balance.total, strong, favorable };
}

export function parseBirthDateTime(dateValue, timeValue) {
  const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateValue ?? '').trim());
  if (!date) throw new Error('Vui lòng nhập ngày sinh hợp lệ.');
  const [year, month, day] = date.slice(1).map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new Error('Ngày sinh không tồn tại.');
  }
  if (year < 1900 || year > 2199) throw new Error('Năm sinh phải trong khoảng 1900–2199.');

  const timeText = String(timeValue ?? '').trim();
  if (!timeText) return { year, month, day, hour: null, minute: 0 };
  const time = /^(\d{2}):(\d{2})/.exec(timeText);
  if (!time || Number(time[1]) > 23 || Number(time[2]) > 59) throw new Error('Giờ sinh không hợp lệ.');
  return { year, month, day, hour: Number(time[1]), minute: Number(time[2]) };
}

export function calculateBazi(input) {
  const pillars = fourPillars(input);
  const lunar = solarToLunar(input.day, input.month, input.year);
  const lunarYear = yearPillarOf(lunar.year);
  const balance = elementBalance(pillars);
  return {
    input,
    lunar,
    pillars,
    zodiac: { ...lunarYear, animal: lunarYear.branch.animal },
    napAm: napAm(lunarYear.stemIndex, lunarYear.branchIndex),
    balance,
    strength: dayMasterStrength(pillars, balance),
    dayMaster: { ...pillars.day.stem, ...DAY_MASTERS[pillars.day.stem.name] },
    elements: ELEMENTS,
  };
}
