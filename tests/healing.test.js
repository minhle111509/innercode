import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FREQUENCIES, EMOTIONS, COLORS, HOLD_MS, chooseFrequency, bowlPartials } from '../js/healing/frequency.js';
import { PRODUCTS } from '../js/shop/catalog.js';

test('every emotion and colour maps to a described frequency', () => {
  for (const e of EMOTIONS) assert.ok(FREQUENCIES[e.hz], e.key);
  for (const c of COLORS) assert.ok(FREQUENCIES[c.hz] && /^#[0-9a-f]{6}$/i.test(c.hex), c.key);
  assert.equal(HOLD_MS, 3000);
});

test('chooseFrequency is deterministic and pairs a different companion tone', () => {
  const a = chooseFrequency('anxious', 'green');
  assert.equal(a.primary.hz, 396);
  assert.equal(a.companion.hz, 639);
  assert.deepEqual(chooseFrequency('anxious', 'green'), a);
  assert.equal(chooseFrequency('anxious', 'red').companion.hz, 432); // same tone → 432 base
  assert.equal(chooseFrequency('stressed', 'white').companion.hz, 528); // 432 twice → 528
  for (const e of EMOTIONS) {
    for (const c of COLORS) {
      const r = chooseFrequency(e.key, c.key);
      assert.notEqual(r.primary.hz, r.companion.hz);
      for (const key of r.products) assert.ok(PRODUCTS.some((p) => p.key === key), key);
    }
  }
});

test('chooseFrequency asks for both choices', () => {
  assert.throws(() => chooseFrequency(undefined, 'red'), /cảm xúc/);
  assert.throws(() => chooseFrequency('calm', 'black'), /màu/);
});

test('bowl partials are inharmonic and decay faster when higher', () => {
  const p = bowlPartials(432);
  assert.equal(p[0].freq, 432);
  assert.ok(p.every((x, i) => i === 0 || (x.freq > p[i - 1].freq && x.decay < p[i - 1].decay)));
});
