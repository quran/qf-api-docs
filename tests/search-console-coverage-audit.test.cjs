const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  parseArgs,
  resolveHttpUrl,
  resolveLocalUrl,
} = require(path.join(__dirname, '..', 'scripts', 'audit-search-console-coverage.js'));

const origin = 'https://preview.example.com';

function mockHead(responses) {
  return async (url) => {
    const response = responses.get(url);
    if (!response) {
      return { statusCode: 404 };
    }

    return response;
  };
}

test('live audit passes direct 200 URLs', async () => {
  const result = await resolveHttpUrl(
    'https://api-docs.quran.foundation/docs/live-page/',
    {
      origin,
      requestHead: mockHead(
        new Map([
          [`${origin}/docs/live-page/`, { statusCode: 200 }],
        ]),
      ),
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.outcome, 'ok');
  assert.equal(result.finalStatus, 200);
});

test('live audit passes redirects that end at 200', async () => {
  const result = await resolveHttpUrl(
    'https://api-docs.quran.foundation/docs/old-page',
    {
      origin,
      requestHead: mockHead(
        new Map([
          [`${origin}/docs/old-page`, {
            statusCode: 301,
            location: '/docs/new-page/',
          }],
          [`${origin}/docs/new-page/`, { statusCode: 200 }],
        ]),
      ),
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.outcome, 'redirected');
  assert.equal(result.initialStatus, 301);
  assert.equal(result.finalStatus, 200);
});

test('live audit fails redirects that end at 404', async () => {
  const result = await resolveHttpUrl(
    'https://api-docs.quran.foundation/docs/old-page',
    {
      origin,
      requestHead: mockHead(
        new Map([
          [`${origin}/docs/old-page`, {
            statusCode: 302,
            location: '/docs/missing-page/',
          }],
          [`${origin}/docs/missing-page/`, { statusCode: 404 }],
        ]),
      ),
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.outcome, 'bad-status');
  assert.equal(result.initialStatus, 302);
  assert.equal(result.finalStatus, 404);
});

test('live audit fails direct 404 URLs', async () => {
  const result = await resolveHttpUrl(
    'https://api-docs.quran.foundation/docs/missing-page/',
    {
      origin,
      requestHead: mockHead(
        new Map([
          [`${origin}/docs/missing-page/`, { statusCode: 404 }],
        ]),
      ),
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.outcome, 'bad-status');
  assert.equal(result.initialStatus, 404);
  assert.equal(result.finalStatus, 404);
});

test('live audit falls back to GET when HEAD is unsupported', async () => {
  for (const statusCode of [405, 501]) {
    const result = await resolveHttpUrl(
      'https://api-docs.quran.foundation/docs/get-only-page/',
      {
        origin,
        requestHead: mockHead(
          new Map([
            [`${origin}/docs/get-only-page/`, { statusCode }],
          ]),
        ),
        requestGet: mockHead(
          new Map([
            [`${origin}/docs/get-only-page/`, { statusCode: 200 }],
          ]),
        ),
      },
    );

    assert.equal(result.ok, true);
    assert.equal(result.outcome, 'ok');
    assert.equal(result.finalStatus, 200);
  }
});

test('live audit fails request errors and timeouts', async () => {
  const result = await resolveHttpUrl(
    'https://api-docs.quran.foundation/docs/slow-page/',
    {
      origin,
      requestHead: mockHead(
        new Map([
          [`${origin}/docs/slow-page/`, { error: 'Request timed out' }],
        ]),
      ),
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.outcome, 'request-error');
  assert.equal(result.finalStatus, 'error');
});

test('live audit fails redirect loops', async () => {
  const result = await resolveHttpUrl(
    'https://api-docs.quran.foundation/docs/a',
    {
      origin,
      requestHead: mockHead(
        new Map([
          [`${origin}/docs/a`, { statusCode: 301, location: '/docs/b' }],
          [`${origin}/docs/b`, { statusCode: 301, location: '/docs/a' }],
        ]),
      ),
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.outcome, 'redirect-loop');
  assert.equal(result.finalStatus, 'loop');
});

test('local audit resolves redirects against build paths', () => {
  const redirects = new Map([
    ['/docs/old-page', { status: '301', target: '/docs/new-page/' }],
  ]);
  const result = resolveLocalUrl(
    'https://api-docs.quran.foundation/docs/old-page',
    {
      redirects,
      pathExists: (pathname) => pathname === '/docs/new-page/',
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.outcome, 'redirected');
  assert.equal(result.finalStatus, 200);
});

test('local audit fails missing build paths without redirects', () => {
  const result = resolveLocalUrl(
    'https://api-docs.quran.foundation/docs/missing-page/',
    {
      redirects: new Map(),
      pathExists: () => false,
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.outcome, 'not-found');
  assert.equal(result.finalStatus, 404);
});

test('local audit reports external redirect targets without aborting', () => {
  const redirects = new Map([
    ['/docs/external-page', {
      status: '301',
      target: 'https://developers.example.com/docs/external-page/',
    }],
  ]);
  const result = resolveLocalUrl(
    'https://api-docs.quran.foundation/docs/external-page',
    {
      redirects,
      pathExists: () => false,
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.outcome, 'external-redirect');
  assert.equal(result.initialStatus, 301);
  assert.equal(result.finalStatus, 'external');
  assert.equal(result.finalUrl, 'https://developers.example.com/docs/external-page/');
  assert.deepEqual(result.chain, [
    {
      source: '/docs/external-page',
      status: '301',
      target: 'https://developers.example.com/docs/external-page/',
    },
  ]);
});

test('parseArgs accepts positive integer numeric options', () => {
  const { options, files } = parseArgs([
    '--mode=live',
    '--timeout-ms=5000',
    '--max-redirects=4',
    '--concurrency=3',
    'coverage.xlsx',
  ]);

  assert.equal(options.mode, 'live');
  assert.equal(options.timeoutMs, 5000);
  assert.equal(options.maxRedirects, 4);
  assert.equal(options.concurrency, 3);
  assert.deepEqual(files, ['coverage.xlsx']);
});

test('parseArgs rejects invalid numeric options with clear errors', () => {
  assert.throws(
    () => parseArgs(['--timeout-ms=abc', 'coverage.xlsx']),
    /--timeout-ms must be a positive integer/,
  );
  assert.throws(
    () => parseArgs(['--max-redirects=0', 'coverage.xlsx']),
    /--max-redirects must be a positive integer/,
  );
  assert.throws(
    () => parseArgs(['--concurrency=-2', 'coverage.xlsx']),
    /--concurrency must be a positive integer/,
  );
});
