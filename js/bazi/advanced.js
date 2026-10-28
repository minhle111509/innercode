/**
 * Deeper Bát Tự analysis: hidden stems, Ten Gods, seasonal strength, useful elements,
 * branch interactions, a few classic Thần Sát, 10-year luck pillars and annual pillars.
 * Pure logic, no DOM.
 */

import { jdFromDate, sunLongitudeDegrees } from '../shared/lunar.js';
import {
  STEMS, BRANCHES, HIDDEN_STEMS, HIDDEN_WEIGHTS, TEN_GODS, SEASON_STATES,
  BRANCH_RELATIONS, STEM_COMBINATIONS, SHEN_SHA,
} from './data.js';
import { yearPillarOf, ELEMENT_ORDER } from './bazi.js';

const VIETNAM_TZ = 7;
const GENERATES = { Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim', Kim: 'Thủy', Thủy: 'Mộc' };
const CONTROLS = { Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim', Kim: 'Mộc' };
const generatorOf = (e) => ELEMENT_ORDER.find((x) => GENERATES[x] === e);
const controllerOf = (e) => ELEMENT_ORDER.find((x) => CONTROLS[x] === e);
const PILLAR_KEYS = ['year', 'month', 'day', 'hour'];

/** Thập Thần of `stemIndex` seen from the Day Master `dayStemIndex`. */
export function tenGod(dayStemIndex, stemIndex) {
  const dm = STEMS[dayStemIndex];
  const other = STEMS[stemIndex];
  const samePolarity = dm.yang === other.yang;
  if (other.element === dm.element) return samePolarity ? 'Tỷ Kiên' : 'Kiếp Tài';
  if (GENERATES[dm.element] === other.element) return samePolarity ? 'Thực Thần' : 'Thương Quan';
  if (CONTROLS[dm.element] === other.element) return samePolarity ? 'Thiên Tài' : 'Chính Tài';
  if (CONTROLS[other.element] === dm.element) return samePolarity ? 'Thất Sát' : 'Chính Quan';
  return samePolarity ? 'Thiên Ấn' : 'Chính Ấn';
}

export function hiddenStems(branchIndex) {
  const stems = HIDDEN_STEMS[branchIndex];
  const weights = HIDDEN_WEIGHTS[stems.length];
  return stems.map((stemIndex, i) => ({ stemIndex, stem: STEMS[stemIndex], weight: weights[i] }));
}

/** Stems weigh 1 each; each branch weighs 1, shared among its hidden stems. */
export function weightedElements(pillars) {
  const scores = Object.fromEntries(ELEMENT_ORDER.map((e) => [e, 0]));
  for (const key of PILLAR_KEYS) {
    const p = pillars[key];
    if (!p) continue;
    scores[p.stem.element] += 1;
    for (const h of hiddenStems(p.branchIndex)) scores[h.stem.element] += h.weight;
  }
  for (const e of ELEMENT_ORDER) scores[e] = Math.round(scores[e] * 10) / 10;
  return scores;
}

const SEASON_OF_BRANCH = ['Thủy', 'Thổ', 'Mộc', 'Mộc', 'Thổ', 'Hỏa', 'Hỏa', 'Thổ', 'Kim', 'Kim', 'Thổ', 'Thủy'];

export function seasonState(element, monthBranchIndex) {
  const season = SEASON_OF_BRANCH[monthBranchIndex];
  if (season === element) return 'Vượng';
  if (GENERATES[season] === element) return 'Tướng';
  if (GENERATES[element] === season) return 'Hưu';
  if (CONTROLS[element] === season) return 'Tù';
  return 'Tử';
}

/**
 * Phù – ức (support / restrain) method: Day Master strength from its share of support
 * (own element + resource) among all weighted characters except itself, adjusted by season.
 */
export function analyzeStrength(pillars) {
  const dm = pillars.day.stem;
  const scores = weightedElements(pillars);
  scores[dm.element] -= 1; // exclude the Day Master itself
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const support = scores[dm.element] + scores[generatorOf(dm.element)];
  const state = seasonState(dm.element, pillars.month.branchIndex);
  const score = Math.round((support / total) * 100 + SEASON_STATES[state].bonus);

  let level;
  let favorable;
  if (score >= 58) {
    level = 'Thân vượng';
    favorable = [GENERATES[dm.element], CONTROLS[dm.element], controllerOf(dm.element)];
  } else if (score <= 42) {
    level = 'Thân nhược';
    favorable = [generatorOf(dm.element), dm.element];
  } else {
    level = 'Trung hòa';
    // Balanced chart: favour the weakest elements overall, other than the Day Master's own.
    const full = weightedElements(pillars);
    favorable = ELEMENT_ORDER.filter((e) => e !== dm.element).sort((a, b) => full[a] - full[b]).slice(0, 2);
  }
  const unfavorable = ELEMENT_ORDER.filter((e) => !favorable.includes(e) && (level !== 'Trung hòa'));
  return { score, level, state, stateText: SEASON_STATES[state].text, favorable, unfavorable, support: Math.round(support * 10) / 10, total: Math.round(total * 10) / 10 };
}

export function pillarTenGods(pillars) {
  const dayStem = pillars.day.stemIndex;
  return Object.fromEntries(PILLAR_KEYS.filter((k) => pillars[k]).map((key) => {
    const p = pillars[key];
    return [key, {
      stem: key === 'day' ? 'Nhật Chủ' : tenGod(dayStem, p.stemIndex),
      hidden: hiddenStems(p.branchIndex).map((h) => ({ ...h, god: tenGod(dayStem, h.stemIndex) })),
    }];
  }));
}

const LABELS = { year: 'năm', month: 'tháng', day: 'ngày', hour: 'giờ' };

export function interactions(pillars) {
  const present = PILLAR_KEYS.filter((k) => pillars[k]);
  const found = [];
  const pairText = (a, b) => `trụ ${LABELS[a]} – trụ ${LABELS[b]}`;
  for (let i = 0; i < present.length; i += 1) {
    for (let j = i + 1; j < present.length; j += 1) {
      const a = present[i];
      const b = present[j];
      const [x, y] = [pillars[a].branchIndex, pillars[b].branchIndex];
      const has = (list) => list.some(([m, n]) => (m === x && n === y) || (m === y && n === x));
      const names = `${BRANCHES[x].name} – ${BRANCHES[y].name}`;
      if (has(BRANCH_RELATIONS.sixHarmony)) found.push({ type: 'Lục hợp', good: true, text: `${names} (${pairText(a, b)}): gắn kết, hỗ trợ nhau.` });
      if (has(BRANCH_RELATIONS.clash)) found.push({ type: 'Lục xung', good: false, text: `${names} (${pairText(a, b)}): xung đột, biến động, hay thay đổi.` });
      if (has(BRANCH_RELATIONS.harm)) found.push({ type: 'Lục hại', good: false, text: `${names} (${pairText(a, b)}): hiểu lầm, tổn hại ngầm.` });
      const [s, t] = [pillars[a].stemIndex, pillars[b].stemIndex];
      const combo = STEM_COMBINATIONS.find(([m, n]) => (m === s && n === t) || (m === t && n === s));
      if (combo) found.push({ type: 'Thiên can hợp', good: true, text: `${STEMS[s].name} – ${STEMS[t].name} (${pairText(a, b)}) hợp hóa ${combo[2]}: dễ hòa hợp, có duyên hợp tác.` });
    }
  }
  const branchSet = new Set(present.map((k) => pillars[k].branchIndex));
  for (const { branches, element } of BRANCH_RELATIONS.threeHarmony) {
    if (branches.every((b) => branchSet.has(b))) {
      found.push({ type: 'Tam hợp', good: true, text: `${branches.map((b) => BRANCHES[b].name).join(' – ')} hợp thành cục ${element}: năng lượng ${element} rất mạnh.` });
    }
  }
  return found;
}

const NOBLEMAN = { 0: [1, 7], 4: [1, 7], 6: [1, 7], 1: [0, 8], 5: [0, 8], 2: [11, 9], 3: [11, 9], 8: [5, 3], 9: [5, 3], 7: [2, 6] };
const SCHOLAR = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
// Đào hoa / Dịch mã by the three-harmony group of a base branch.
const GROUP_OF = (b) => [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]].findIndex((g) => g.includes(b));
const PEACH = [9, 3, 6, 0];
const HORSE = [2, 8, 11, 5];

export function shenSha(pillars) {
  const present = PILLAR_KEYS.filter((k) => pillars[k]);
  const where = (branchIndex) => present.filter((k) => pillars[k].branchIndex === branchIndex).map((k) => LABELS[k]);
  const result = [];
  const add = (key, branchIndexes) => {
    const places = [...new Set(branchIndexes.flatMap(where))];
    if (places.length) result.push({ ...SHEN_SHA[key], places });
  };
  const dayStem = pillars.day.stemIndex;
  add('nobleman', NOBLEMAN[dayStem]);
  add('scholar', [SCHOLAR[dayStem]]);
  const bases = [pillars.year.branchIndex, pillars.day.branchIndex];
  add('peach', bases.map((b) => PEACH[GROUP_OF(b)]));
  add('horse', bases.map((b) => HORSE[GROUP_OF(b)]));
  return result;
}

/** Julian day (UT) when the sun reaches `targetLongitude`, searching near `jdGuess`. */
function solveSunLongitude(targetLongitude, jdGuess) {
  let jd = jdGuess;
  for (let i = 0; i < 6; i += 1) {
    const diff = ((targetLongitude - sunLongitudeDegrees(jd) + 540) % 360) - 180;
    jd += diff / 0.9856;
  }
  return jd;
}

/**
 * Đại vận: forward for yang-year men and yin-year women, backward otherwise.
 * Start age: days to the next (or previous) "tiết" ÷ 3 = years; 1 remaining day = 4 months.
 */
export function luckPillars({ year, month, day, hour = null, minute = 0 }, gender, pillars, count = 8) {
  if (gender !== 'male' && gender !== 'female') return null;
  const yearYang = pillars.year.stem.yang;
  const forward = (yearYang && gender === 'male') || (!yearYang && gender === 'female');

  const jdBirth = jdFromDate(day, month, year) - 0.5 + ((hour ?? 12) + minute / 60 - VIETNAM_TZ) / 24;
  const longitude = sunLongitudeDegrees(jdBirth);
  const offset = (((longitude - 15) % 30) + 30) % 30;
  const target = forward ? longitude + (30 - offset) : longitude - offset;
  const guess = jdBirth + ((forward ? 30 - offset : -offset) / 0.9856);
  const jdTerm = solveSunLongitude(((target % 360) + 360) % 360, guess);
  const days = Math.abs(jdTerm - jdBirth);
  const startYears = Math.floor(days / 3);
  const startMonths = Math.floor((days % 3) * 4);

  const monthCycle = (((6 * pillars.month.stemIndex - 5 * pillars.month.branchIndex) % 60) + 60) % 60;
  const list = Array.from({ length: count }, (_, i) => {
    const idx = (((monthCycle + (forward ? i + 1 : -(i + 1))) % 60) + 60) % 60;
    const stemIndex = idx % 10;
    const branchIndex = idx % 12;
    const startAge = startYears + i * 10;
    return {
      stemIndex,
      branchIndex,
      stem: STEMS[stemIndex],
      branch: BRANCHES[branchIndex],
      name: `${STEMS[stemIndex].name} ${BRANCHES[branchIndex].name}`,
      startAge,
      startYear: year + startAge,
      god: tenGod(pillars.day.stemIndex, stemIndex),
      branchGod: tenGod(pillars.day.stemIndex, HIDDEN_STEMS[branchIndex][0]),
    };
  });
  return { forward, days: Math.round(days * 10) / 10, startYears, startMonths, pillars: list };
}

export function annualPillars(fromYear, count, dayStemIndex) {
  return Array.from({ length: count }, (_, i) => {
    const p = yearPillarOf(fromYear + i);
    return { ...p, year: fromYear + i, god: tenGod(dayStemIndex, p.stemIndex), branchGod: tenGod(dayStemIndex, HIDDEN_STEMS[p.branchIndex][0]) };
  });
}

export function rateElements(stemElement, branchElement, favorable) {
  const hits = [stemElement, branchElement].filter((e) => favorable.includes(e)).length;
  return hits === 2 ? 'Rất thuận' : hits === 1 ? 'Thuận vừa' : 'Thử thách';
}

export function analyzeAdvanced(input, gender, pillars, today = new Date()) {
  const strength = analyzeStrength(pillars);
  const luck = luckPillars(input, gender, pillars);
  const age = today.getFullYear() - input.year;
  if (luck) {
    for (const p of luck.pillars) p.rating = rateElements(p.stem.element, p.branch.element, strength.favorable);
    luck.currentIndex = luck.pillars.findLastIndex((p) => age >= p.startAge);
  }
  const years = annualPillars(today.getFullYear(), 5, pillars.day.stemIndex)
    .map((p) => ({ ...p, rating: rateElements(p.stem.element, p.branch.element, strength.favorable) }));
  return {
    weighted: weightedElements(pillars),
    strength,
    tenGods: pillarTenGods(pillars),
    interactions: interactions(pillars),
    shenSha: shenSha(pillars),
    luck,
    years,
    tenGodInfo: TEN_GODS,
  };
}
