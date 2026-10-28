/**
 * Deeper Matrix of Destiny features: health (chakra) chart, age-forecast ring,
 * ancestral lines and a three-step reading of the karmic tail. Pure logic, no DOM.
 */

import { reduceArcana as r } from './matrix.js';

export const CHAKRAS = [
  { key: 'sahasrara', name: 'Sahasrara · Luân xa đỉnh đầu', body: 'Não, hệ thần kinh, da đầu', theme: 'Kết nối tâm linh, mục đích sống' },
  { key: 'ajna', name: 'Ajna · Con mắt thứ ba', body: 'Mắt, tai, xoang, tuyến yên', theme: 'Trực giác, tầm nhìn, tư duy' },
  { key: 'vishuddha', name: 'Vishuddha · Luân xa cổ họng', body: 'Họng, tuyến giáp, vai gáy', theme: 'Giao tiếp, thể hiện bản thân' },
  { key: 'anahata', name: 'Anahata · Luân xa tim', body: 'Tim, phổi, ngực, tay', theme: 'Yêu thương, tha thứ, các mối quan hệ' },
  { key: 'manipura', name: 'Manipura · Luân xa rốn', body: 'Dạ dày, gan, tụy, tiêu hóa', theme: 'Ý chí, tự tin, quyền lực cá nhân' },
  { key: 'svadhisthana', name: 'Svadhisthana · Luân xa xương cùng', body: 'Sinh sản, thận, bàng quang', theme: 'Cảm xúc, khoái lạc, sáng tạo' },
  { key: 'muladhara', name: 'Muladhara · Luân xa gốc', body: 'Xương sống, chân, hệ miễn dịch', theme: 'An toàn, tiền bạc, sinh tồn' },
];

/**
 * Health chart as used by common Matrix calculators:
 * physical column = left/right points, energy column = top/bottom points, emotion = sum of both.
 */
export function healthChart(points) {
  const A3 = r(points.A1 + points.E);
  const B3 = r(points.B1 + points.E);
  const pairs = [
    [points.A, points.B],
    [points.A2, points.B2],
    [points.A1, points.B1],
    [A3, B3],
    [points.E, points.E],
    [points.C1, points.D1],
    [points.C, points.D],
  ];
  const rows = CHAKRAS.map((chakra, i) => {
    const [physical, energy] = pairs[i];
    return { ...chakra, physical, energy, emotion: r(physical + energy) };
  });
  const sum = (field) => r(rows.reduce((total, row) => total + row[field], 0));
  return { rows, total: { physical: sum('physical'), energy: sum('energy'), emotion: sum('emotion') } };
}

/**
 * Age ring: A = 0, F = 10, B = 20, G = 30, C = 40, H = 50, D = 60, I = 70, back to A at 80.
 * Each 10-year segment is split into 8 periods by repeated midpoints.
 */
export function ageForecast(points) {
  const ring = [
    ['A', 0], ['F', 10], ['B', 20], ['G', 30], ['C', 40], ['H', 50], ['D', 60], ['I', 70], ['A', 80],
  ];
  const periods = [];
  for (let i = 0; i < 8; i += 1) {
    const [fromKey, fromAge] = ring[i];
    const [toKey] = ring[i + 1];
    const start = points[fromKey];
    const end = points[toKey];
    const mid = r(start + end); // age +5
    const q1 = r(start + mid); // +2.5
    const q3 = r(mid + end); // +7.5
    const values = [start, r(start + q1), q1, r(q1 + mid), mid, r(mid + q3), q3, r(q3 + end)];
    values.forEach((value, k) => {
      const from = fromAge + k * 1.25;
      periods.push({ from, to: from + 1.25, value, anchor: k === 0 ? fromKey : null });
    });
  }
  return periods;
}

export function currentPeriod(periods, age) {
  return periods.find((p) => age >= p.from && age < p.to) ?? periods[periods.length - 1];
}

export function ancestralLines(points) {
  return {
    paternal: { label: 'Dòng bên nội', points: [points.F, points.H], line: r(points.F + points.H) },
    maternal: { label: 'Dòng bên ngoại', points: [points.G, points.I], line: r(points.G + points.I) },
  };
}

/** Outer D = root lesson, D2 = how it shows up, D1 = key to resolve it (nearest the centre). */
export function karmicTail(points) {
  return [
    { role: 'Gốc bài học', value: points.D },
    { role: 'Cách bài học biểu hiện', value: points.D2 },
    { role: 'Chìa khóa hóa giải', value: points.D1 },
  ];
}
