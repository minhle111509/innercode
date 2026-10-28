import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATEMENTS, TYPES, scoreQuiz } from '../js/self/enneagram.js';
import {
  LIFE_AREAS, summarizeWheel, BREATHING_PATTERNS, breathingPhases, cyclesFor, JOURNAL_PROMPTS,
} from '../js/self/practices.js';

const answerAll = (fn) => Object.fromEntries(STATEMENTS.map((s) => [s.id, fn(s)]));

test('quiz has 36 interleaved statements, 4 per type', () => {
  assert.equal(STATEMENTS.length, 36);
  assert.equal(new Set(STATEMENTS.map((s) => s.id)).size, 36);
  for (let i = 1; i < STATEMENTS.length; i += 1) assert.notEqual(STATEMENTS[i].type, STATEMENTS[i - 1].type);
  for (let t = 1; t <= 9; t += 1) assert.equal(STATEMENTS.filter((s) => s.type === t).length, 4);
});

test('scoreQuiz finds the dominant type and its wing', () => {
  const r = scoreQuiz(answerAll((s) => (s.type === 5 ? 5 : s.type === 4 ? 4 : 2)));
  assert.equal(r.main, 5);
  assert.equal(r.wing, 4);
  assert.equal(r.scores[5], 100);
  assert.equal(r.scores[1], 25);
});

test('scoreQuiz wraps neighbours around 9 ↔ 1', () => {
  const r = scoreQuiz(answerAll((s) => ({ 9: 5, 1: 4 }[s.type] ?? 1)));
  assert.equal(r.main, 9);
  assert.equal(r.wing, 1);
});

test('scoreQuiz rejects incomplete or invalid answers', () => {
  assert.throws(() => scoreQuiz({}), /36 câu/);
  const answers = answerAll(() => 3);
  answers[STATEMENTS[0].id] = 7;
  assert.throws(() => scoreQuiz(answers), /1 câu/);
});

test('every type has full description and valid arrows', () => {
  for (let t = 1; t <= 9; t += 1) {
    const type = TYPES[t];
    for (const field of ['name', 'desire', 'fear', 'strengths', 'growth']) assert.ok(type[field]);
    assert.ok(TYPES[type.integration] && TYPES[type.stress]);
  }
});

test('summarizeWheel', () => {
  const scores = Object.fromEntries(LIFE_AREAS.map((a, i) => [a.key, i + 1]));
  const s = summarizeWheel(scores);
  assert.equal(s.average, 4.5);
  assert.deepEqual(s.lowest.map((a) => a.key), ['health', 'career']);
  assert.equal(s.highest.key, 'joy');
  assert.equal(s.spread, 7);
  assert.throws(() => summarizeWheel({ ...scores, health: 0 }), RangeError);
});

test('breathing phases drop zero-length steps and cycles fit the time', () => {
  assert.deepEqual(breathingPhases(BREATHING_PATTERNS.balance.steps).map((p) => p.kind), ['in', 'out']);
  assert.equal(breathingPhases(BREATHING_PATTERNS.box.steps).length, 4);
  assert.equal(cyclesFor([4, 4, 4, 4], 1), 4);
  assert.equal(cyclesFor([4, 7, 8, 0], 3), 9);
});

test('journal prompts', () => {
  for (const group of Object.values(JOURNAL_PROMPTS)) assert.ok(group.prompts.length >= 5);
});
