const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const noticeComponent = fs.readFileSync(
  path.join(
    __dirname,
    '..',
    'src',
    'components',
    'UserRelatedApiEnvironmentNotice',
    'index.tsx',
  ),
  'utf-8',
);

const apiItemLayoutWrapper = fs.readFileSync(
  path.join(
    __dirname,
    '..',
    'src',
    'theme',
    'ApiItem',
    'Layout',
    'index.tsx',
  ),
  'utf-8',
);

test('switcher uses nav semantics and marks the active environment', () => {
  assert.match(noticeComponent, /<nav[\s\S]*aria-label="User-related API environment switcher"/);
  assert.match(noticeComponent, /aria-current=\{isActive \? "page" : undefined\}/);
});

test('ApiItem layout wrapper forwards original props', () => {
  assert.match(apiItemLayoutWrapper, /const \{ children, \.\.\.restProps \} = props;/);
  assert.match(apiItemLayoutWrapper, /<ApiItemLayout \{\.\.\.restProps\}>/);
});
