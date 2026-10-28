/**
 * Pure Matrix of Destiny logic (22-arcana system popularised by Natalia Ladini).
 * No DOM access here so it can be unit-tested in Node.
 *
 * Point naming:
 *   A (left) = day, B (top) = month, C (right) = year, D (bottom), E (center)
 *   F, G, H, I = ancestral square corners (top-left, top-right, bottom-right, bottom-left)
 *   X1 / X2 = points on the line from X toward the center (X1 nearer the center)
 */

import { parseBirthDate } from '../shared/date.js';
import { sumDigits } from '../shared/digits.js';

export const MAX_ARCANA = 22;

/** Reduce any positive integer to the 1–22 arcana range by summing digits. */
export function reduceArcana(n) {
  if (!Number.isInteger(n) || n < 1) throw new RangeError(`Expected a positive integer, got ${n}`);
  let result = n;
  while (result > MAX_ARCANA) result = sumDigits(result);
  return result;
}

export function calculateMatrix({ day, month, year }) {
  const r = reduceArcana;

  const A = r(day);
  const B = r(month);
  const C = r(sumDigits(year));
  const D = r(A + B + C);
  const E = r(A + B + C + D);

  const F = r(A + B);
  const G = r(B + C);
  const H = r(C + D);
  const I = r(D + A);

  const A1 = r(A + E);
  const B1 = r(B + E);
  const C1 = r(C + E);
  const D1 = r(D + E);
  const A2 = r(A + A1);
  const B2 = r(B + B1);
  const C2 = r(C + C1);
  const D2 = r(D + D1);

  // Money / love channel sits between C1 and D1.
  const X = r(C1 + D1);
  const money = r(C1 + X);
  const love = r(D1 + X);

  const sky = r(B + D);
  const earth = r(A + C);
  const personal = r(sky + earth);
  const male = r(F + H);
  const female = r(G + I);
  const social = r(male + female);
  const spiritual = r(personal + social);
  const planetary = r(social + spiritual);

  return {
    points: { A, B, C, D, E, F, G, H, I, A1, A2, B1, B2, C1, C2, D1, D2, X, money, love },
    purposes: { sky, earth, personal, male, female, social, spiritual, planetary },
  };
}

export function calculateMatrixReport({ birthDate, today = new Date() }) {
  const date = parseBirthDate(birthDate, today);
  return { date, ...calculateMatrix(date) };
}
