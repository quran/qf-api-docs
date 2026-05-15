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

const docItemLayoutWrapper = fs.readFileSync(
  path.join(
    __dirname,
    '..',
    'src',
    'theme',
    'DocItem',
    'Layout',
    'index.tsx',
  ),
  'utf-8',
);

const renderContext = fs.readFileSync(
  path.join(
    __dirname,
    '..',
    'src',
    'components',
    'UserRelatedApiEnvironmentNotice',
    'renderContext.tsx',
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

test('DocItem layout wrapper renders the switcher on user-related docs pages', () => {
  assert.match(docItemLayoutWrapper, /getUserRelatedDocsEnvironment\(location\.pathname\)/);
  assert.match(docItemLayoutWrapper, /<UserRelatedApiEnvironmentNoticeRenderedProvider/);
  assert.match(docItemLayoutWrapper, /shouldRenderNotice && \(/);
  assert.match(docItemLayoutWrapper, /<DocItemLayout \{\.\.\.restProps\}>/);
});

test('ApiItem layout wrapper avoids duplicating the doc-level switcher', () => {
  assert.match(
    renderContext,
    /export const useUserRelatedApiEnvironmentNoticeRendered = \(\) =>/,
  );
  assert.match(
    apiItemLayoutWrapper,
    /const isNoticeAlreadyRendered = useUserRelatedApiEnvironmentNoticeRendered\(\);/,
  );
  assert.match(apiItemLayoutWrapper, /!isNoticeAlreadyRendered && \(/);
});
