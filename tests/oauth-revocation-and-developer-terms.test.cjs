const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.join(__dirname, '..');
const oauthSpec = JSON.parse(
  fs.readFileSync(
    path.join(repositoryRoot, 'openAPI', 'oauth2-apis', 'v1.json'),
    'utf8',
  ),
);
const developerTerms = fs.readFileSync(
  path.join(repositoryRoot, 'src', 'pages', 'legal', 'developer-terms.mdx'),
  'utf8',
);

test('does not advertise anonymous access to the token revocation endpoint', () => {
  const revocationOperation = oauthSpec.paths['/oauth2/revoke'].post;

  assert.deepEqual(revocationOperation.security, [{ basicAuth: [] }]);
});

test('defines notice delivery separately for QF and the external Developer', () => {
  assert.match(
    developerTerms,
    /Notices to QF .*sent to \*\*developers@quran\.com\*\*\./,
  );
  assert.match(
    developerTerms,
    /Notices to Developer .*email associated with Developer’s account\./,
  );
});

test('keeps the requested content-rights clarifications without expanding the default grant', () => {
  assert.match(developerTerms, /Serving QF Content from a Developer-controlled backend/);
  assert.match(developerTerms, /Certain QF Content resources have their own underlying rights holders and may therefore carry additional restrictions/);
  assert.match(developerTerms, /\*\*Derived Materials\*\*/);
  assert.match(developerTerms, /Recitation metadata and audio URLs are distinct from the underlying recordings/);
  assert.match(developerTerms, /Content Sync storage exception does not itself authorize distributing a prepackaged database/);
  assert.match(developerTerms, /Retrieval-augmented generation \(RAG\) within the Application is distinct from/);
  assert.doesNotMatch(developerTerms, /no additional rights verified|model evaluation|permanent media-cache/i);
});

test('keeps previously synced content available while connectivity is unavailable', () => {
  assert.match(developerTerms, /backend or an offline device/);
  assert.match(developerTerms, /at least every \*\*7 days when connectivity to QF permits\*\*/);
  assert.match(developerTerms, /may continue using its previously synced Content Sync copy/);
  assert.match(developerTerms, /perform a next sync promptly when connectivity returns/);
});
