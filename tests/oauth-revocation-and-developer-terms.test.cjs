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

test('distinguishes in-app backend use from reusable content distribution', () => {
  assert.match(developerTerms, /\*\*Private backend versus redistribution\.\*\*/);
  assert.match(developerTerms, /general-purpose or third-party API, bulk export/);
  assert.match(developerTerms, /\*\*Derived Materials\*\*/);
});

test('sets ongoing sync, bundle, and AI conditions', () => {
  assert.match(developerTerms, /backend cache and to each offline device/);
  assert.match(developerTerms, /at least every \*\*7 days when connectivity permits\*\*/);
  assert.match(developerTerms, /may continue serving or displaying its previously synced copy/);
  assert.match(developerTerms, /attempt sync promptly when connectivity returns/);
  assert.doesNotMatch(developerTerms, /not serve or display stale QF Content/);
  assert.match(developerTerms, /\*\*Build-time bundles and prepackaged databases\.\*\*/);
  assert.match(developerTerms, /ordinary written bundling permission alone does not authorize that redistribution/);
  assert.match(developerTerms, /Retrieval-augmented generation \(RAG\)/);
  assert.match(developerTerms, /content-derived embeddings/);
});

test('points to a resource matrix that separates audio rows from recordings', () => {
  const matrix = fs.readFileSync(
    path.join(repositoryRoot, 'src', 'pages', 'legal', 'resource-rights.mdx'),
    'utf8',
  );
  assert.match(developerTerms, /\[resource rights matrix\]\(\/legal\/resource-rights\)/);
  assert.match(matrix, /\*\*metadata and audio-file rows\*\*/);
  assert.match(matrix, /\*\*Underlying recitation recordings\*\*/);
  for (const id of ['quran_core:1', 'mushafs:1', 'translations:19', 'tafsirs:151', 'recitations:10', 'chapter_recitations:159']) {
    assert.ok(matrix.includes(`\`${id}\``), `missing rights status for ${id}`);
  }
  assert.match(matrix, /independently reusable copies require a signed commercial license under Section 2\.2/);
  assert.match(matrix, /no additional rights verified/i);
  assert.match(matrix, /source-specific/);
});
