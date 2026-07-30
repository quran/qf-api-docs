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
