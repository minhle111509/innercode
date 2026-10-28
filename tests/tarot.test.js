import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DECK } from '../js/tarot/deck.js';
import {
  SPREADS, secureRandomInt, shuffle, drawCards, readSpread, summarizeReading,
} from '../js/tarot/tarot.js';

const major = (n) => DECK.find((c) => c.id === `major-${n}`);
const minor = (suit, n) => DECK.find((c) => c.id === `${suit}-${n}`);

test('deck has 78 unique, complete cards', () => {
  assert.equal(DECK.length, 78);
  assert.equal(new Set(DECK.map((c) => c.id)).size, 78);
  assert.equal(DECK.filter((c) => c.arcana === 'major').length, 22);
  for (const card of DECK) {
    for (const field of ['nameVi', 'nameEn', 'upright', 'reversed', 'label', 'symbol']) {
      assert.ok(card[field], `${card.id} missing ${field}`);
    }
  }
  assert.ok(Object.isFrozen(DECK) && Object.isFrozen(DECK[0]));
});

test('secureRandomInt stays in range and validates input', () => {
  for (let i = 0; i < 1000; i += 1) {
    const n = secureRandomInt(7);
    assert.ok(Number.isInteger(n) && n >= 0 && n < 7);
  }
  assert.throws(() => secureRandomInt(0), RangeError);
  assert.throws(() => secureRandomInt(1.5), RangeError);
});

test('shuffle is a permutation and does not mutate input', () => {
  const input = [1, 2, 3, 4, 5];
  const output = shuffle(input);
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
  assert.deepEqual([...output].sort(), [1, 2, 3, 4, 5]);
});

test('shuffle with deterministic RNG is reproducible', () => {
  const alwaysZero = () => 0;
  assert.deepEqual(shuffle([1, 2, 3, 4], alwaysZero), [2, 3, 4, 1]);
});

test('drawCards returns unique cards and respects allowReversed', () => {
  const drawn = drawCards(DECK, 10, { allowReversed: false });
  assert.equal(drawn.length, 10);
  assert.equal(new Set(drawn.map((d) => d.card.id)).size, 10);
  assert.ok(drawn.every((d) => d.reversed === false));
});

test('drawCards validates count', () => {
  assert.throws(() => drawCards(DECK, 0), RangeError);
  assert.throws(() => drawCards(DECK, 79), RangeError);
  assert.throws(() => drawCards(DECK, 2.5), RangeError);
});

test('readSpread labels each card with its position', () => {
  for (const [key, spread] of Object.entries(SPREADS)) {
    const reading = readSpread(DECK, key);
    assert.deepEqual(reading.map((r) => r.position), spread.positions);
  }
  assert.throws(() => readSpread(DECK, 'nope'), /Unknown spread/);
});

test('summarizeReading detects majors, dominant suit and reversals', () => {
  const notes = summarizeReading([
    { card: major(0), reversed: true },
    { card: major(1), reversed: true },
    { card: minor('cups', 2), reversed: false },
  ]);
  assert.ok(notes.some((n) => n.includes('Ẩn Chính')));
  assert.ok(notes.some((n) => n.includes('lá ngược')));

  const suitNotes = summarizeReading([
    { card: minor('cups', 1), reversed: false },
    { card: minor('cups', 3), reversed: false },
    { card: minor('swords', 3), reversed: false },
  ]);
  assert.ok(suitNotes.some((n) => n.includes('Cốc')));

  const balanced = summarizeReading([{ card: minor('wands', 5), reversed: false }]);
  assert.equal(balanced.length, 1);
});
