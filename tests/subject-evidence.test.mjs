import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesSubject } from '../lib/subject-evidence.ts';
test('direction names and unchecked degree labels do not prove a code', () => {
  assert.equal(matchesSubject('nju-social-2027', ['040200']), false);
  assert.equal(matchesSubject('pku-psy-2027', ['040200']), false);
  assert.equal(matchesSubject('ecnu-psy-2027', ['045400']), true);
  assert.equal(matchesSubject('ecnu-edu-psy-2027', ['045400']), false);
  assert.equal(matchesSubject('ecnu-sii-2027', ['045400']), false);
});
test('an empty code filter preserves notices awaiting verification', () => {
  assert.equal(matchesSubject('nju-social-2027', []), true);
});
