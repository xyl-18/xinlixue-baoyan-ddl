import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chinaDateKey, validParams, getStatus, formatDeadline } from '../lib/deadline.ts';

test('share URLs reject unknown enum values and duplicate filters', () => {
  assert.deepEqual(validParams('open,broken,open', ['open', 'closed']), ['open']);
  assert.deepEqual(validParams(null, ['open']), []);
});
test('China calendar day is independent of machine timezone', () => {
  assert.equal(chinaDateKey('2026-09-05T16:30:00Z'), '2026-09-06');
});
test('future opening remains upcoming without a known closing date', () => {
  assert.equal(getStatus({ openAt: '2026-09-06T00:00:00+08:00', deadline: null }, Date.parse('2026-09-05T12:00:00+08:00')), 'upcoming');
});
test('deadline boundary closes at the specified instant', () => {
  const p = { openAt: null, deadline: '2026-09-06T12:00:00+08:00' };
  assert.equal(getStatus(p, Date.parse(p.deadline) - 1), 'open');
  assert.equal(getStatus(p, Date.parse(p.deadline)), 'closed');
});
test('day precision never invents a visible 23:59 deadline', () => {
  const text = formatDeadline({ deadline: '2026-09-06T23:59:59+08:00', deadlinePrecision: 'day' }, true);
  assert.match(text, /时刻未注明/);
  assert.doesNotMatch(text, /23:59/);
});
