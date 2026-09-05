import { test } from 'node:test';
import assert from 'node:assert/strict';
import { programs } from '../lib/programs.ts';
import { validatePrograms } from '../lib/data-validation.ts';
const sample = programs[0];
test('same school and shared source can have distinct college records', () => {
  assert.deepEqual(validatePrograms([sample, { ...sample, id: 'second-2027', institute: '另一学院' }]), []);
});
test('duplicate college batch is rejected even with a new id or title', () => {
  assert.ok(validatePrograms([sample, { ...sample, id: 'duplicate-2027', title: '改标题' }]).some(e => e.includes('重复院级批次')));
});
test('independent second rounds remain distinct', () => {
  assert.deepEqual(validatePrograms([sample, { ...sample, id: 'second-round-2027', round: '第二轮' }]), []);
});
test('bad dates, missing original source and unsafe protocols fail', () => {
  assert.ok(validatePrograms([{ ...sample, sourceUrl: '', deadline: 'tomorrow' }]).length >= 2);
  assert.ok(validatePrograms([{ ...sample, sourceUrl: 'javascript:alert(1)' }]).length);
});
