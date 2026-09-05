import { test } from 'node:test';
import assert from 'node:assert/strict';
import { universityDirectory } from '../lib/coverage.ts';

test('the school directory always contains the full 985/211 audit baseline', () => {
  assert.equal(universityDirectory.length, 116);
  assert.equal(new Set(universityDirectory.map(item => item.school)).size, 116);
});

test('multiple recruiting colleges remain separate within one university', () => {
  const school = universityDirectory.find(item => item.school === '华南师范大学');
  assert.ok(school);
  assert.ok(school.units.some(item => item.institute === '心理学院'));
  assert.ok(school.units.some(item => item.institute === '脑科学与康复医学研究院'));
});
