/** Pure tarot logic: secure shuffling, drawing and spread summary. No DOM access. */

import { SUITS } from './deck.js';

export const SPREADS = {
  single: {
    name: 'Thông điệp trong ngày (1 lá)',
    positions: ['Thông điệp dành cho bạn'],
  },
  pastPresentFuture: {
    name: 'Quá khứ – Hiện tại – Tương lai (3 lá)',
    positions: ['Quá khứ', 'Hiện tại', 'Tương lai'],
  },
  love: {
    name: 'Tình yêu (3 lá)',
    positions: ['Bạn', 'Người ấy', 'Mối quan hệ'],
  },
  decision: {
    name: 'Ra quyết định (3 lá)',
    positions: ['Tình huống', 'Hành động nên làm', 'Kết quả có thể xảy ra'],
  },
};

/** Uniform random integer in [0, max) using Web Crypto with rejection sampling (no modulo bias). */
export function secureRandomInt(max) {
  if (!Number.isInteger(max) || max <= 0 || max > 2 ** 32) {
    throw new RangeError(`max must be an integer in (0, 2^32], got ${max}`);
  }
  const limit = Math.floor(2 ** 32 / max) * max;
  const buffer = new Uint32Array(1);
  let value;
  do {
    globalThis.crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
}

/** Fisher–Yates shuffle; returns a new array and leaves the input untouched. */
export function shuffle(items, randomInt = secureRandomInt) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function drawCards(deck, count, { allowReversed = true, randomInt = secureRandomInt } = {}) {
  if (!Number.isInteger(count) || count < 1 || count > deck.length) {
    throw new RangeError(`count must be between 1 and ${deck.length}, got ${count}`);
  }
  return shuffle(deck, randomInt)
    .slice(0, count)
    .map((card) => ({ card, reversed: allowReversed && randomInt(2) === 1 }));
}

export function readSpread(deck, spreadKey, options) {
  const spread = SPREADS[spreadKey];
  if (!spread) throw new Error(`Unknown spread: ${spreadKey}`);
  const drawn = drawCards(deck, spread.positions.length, options);
  return drawn.map((entry, i) => ({ ...entry, position: spread.positions[i] }));
}

/** Short overall insight derived from the composition of the drawn cards. */
export function summarizeReading(reading) {
  const notes = [];
  const majors = reading.filter(({ card }) => card.arcana === 'major').length;
  const reversed = reading.filter(({ reversed: r }) => r).length;

  if (reading.length > 1 && majors / reading.length >= 0.5) {
    notes.push('Nhiều lá Ẩn Chính xuất hiện: đây là giai đoạn mang tính bước ngoặt, những bài học lớn đang đến với bạn.');
  }

  const suitCounts = {};
  for (const { card } of reading) {
    if (card.suit) suitCounts[card.suit] = (suitCounts[card.suit] ?? 0) + 1;
  }
  const [topSuit, topCount] = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0] ?? [];
  if (topSuit && topCount >= 2) {
    notes.push(`Bộ ${SUITS[topSuit].vi} chiếm ưu thế: chủ đề chính xoay quanh ${SUITS[topSuit].domain}.`);
  }

  if (reading.length > 1 && reversed / reading.length > 0.5) {
    notes.push('Nhiều lá ngược: năng lượng đang bị chặn lại — hãy chậm lại và nhìn vào bên trong.');
  }

  if (!notes.length) {
    notes.push('Năng lượng trải bài khá cân bằng: hãy đọc kỹ từng vị trí và lắng nghe trực giác của bạn.');
  }
  return notes;
}
