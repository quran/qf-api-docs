const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  applySearchConsoleIssueChecks,
  formatFailure,
  parseArgs,
  buildPathForPathname,
  isIntentionallyNoindexed,
  isPathBlockedByRobots,
  parseNoindexHeaderPatterns,
  parseSitemapUrls,
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

test('issue checks require redirected source URLs to be absent from sitemap', async () => {
  const result = await applySearchConsoleIssueChecks(
    'https://api-docs.quran.foundation/docs/old-page',
    'Page with redirect',
    {
      ok: true,
      outcome: 'redirected',
      finalStatus: 200,
      finalUrl: 'https://preview.example.com/docs/new-page/',
    },
    {
      robotsTxt: 'User-agent: *\nAllow: /\n',
      sitemapUrls: new Set([
        'https://api-docs.quran.foundation/docs/old-page/',
        'https://api-docs.quran.foundation/docs/new-page/',
      ]),
    },
    {
      mode: 'live',
      readIndexSignals: async () => ({
        canonical: 'https://api-docs.quran.foundation/docs/new-page/',
        contentType: 'text/html',
        metaRobots: '',
        xRobotsTag: '',
      }),
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.outcome, 'redirect-source-in-sitemap');
  assert.deepEqual(result.diagnostics, {
    sourceSitemapUrls: ['https://api-docs.quran.foundation/docs/old-page/'],
  });
});

const liveHtmlSignals = (overrides = {}) => async () => ({
  canonical: '',
  contentType: 'text/html',
  metaRobots: '',
  xRobotsTag: '',
  ...overrides,
});

test('issue checks pass trailing-slash redirects whose target is the sitemap URL', async () => {
  const result = await applySearchConsoleIssueChecks(
    'https://api-docs.quran.foundation/docs/page',
    'Page with redirect',
    {
      ok: true,
      outcome: 'redirected',
      finalStatus: 200,
      finalUrl: 'https://preview.example.com/docs/page/',
    },
    {
      robotsTxt: 'User-agent: *\nAllow: /\n',
      sitemapUrls: new Set(['https://api-docs.quran.foundation/docs/page/']),
    },
    {
      mode: 'live',
      readIndexSignals: liveHtmlSignals({
        canonical: 'https://api-docs.quran.foundation/docs/page/',
      }),
    },
  );

  assert.equal(result.ok, true);
});

test('page-with-redirect issue accepts http URLs that the edge upgrades to https', async () => {
  const result = await applySearchConsoleIssueChecks(
    'http://api-docs.quran.foundation/',
    'Page with redirect',
    {
      ok: true,
      outcome: 'ok',
      finalStatus: 200,
      finalUrl: 'https://preview.example.com/',
    },
    {
      robotsTxt: 'User-agent: *\nAllow: /\n',
      sitemapUrls: new Set(['https://api-docs.quran.foundation/']),
    },
    {
      mode: 'live',
      readIndexSignals: liveHtmlSignals({
        canonical: 'https://api-docs.quran.foundation/',
      }),
    },
  );

  assert.equal(result.ok, true);
});

test('noindex header patterns come from X-Robots-Tag rules in _headers', () => {
  const patterns = parseNoindexHeaderPatterns([
    '# comment',
    '/*',
    '  X-Frame-Options: SAMEORIGIN',
    '/docs/user_related_apis_prelive/*',
    '  X-Robots-Tag: noindex, follow',
    '/search/',
    '  X-Robots-Tag: noindex, follow',
  ].join('\n'));

  assert.equal(isIntentionallyNoindexed('/docs/user_related_apis_prelive/scopes/', patterns), true);
  assert.equal(isIntentionallyNoindexed('/search/', patterns), true);
  assert.equal(isIntentionallyNoindexed('/search/extra/', patterns), false);
  assert.equal(isIntentionallyNoindexed('/docs/user_related_apis_versioned/1.0.0/scopes/', patterns), false);
});

test('issue checks accept intentional noindex only while the page is out of the sitemap', async () => {
  const finalUrl = 'https://preview.example.com/docs/user_related_apis_prelive/scopes/';
  const run = (sitemapUrls) => applySearchConsoleIssueChecks(
    'https://api-docs.quran.foundation/docs/user_related_apis_prelive/scopes/',
    'Excluded by \u2018noindex\u2019 tag',
    { ok: true, outcome: 'ok', finalStatus: 200, finalUrl },
    {
      robotsTxt: 'User-agent: *\nAllow: /\n',
      sitemapUrls,
      noindexPatterns: [/^\/docs\/user_related_apis_prelive\/.*$/],
    },
    { mode: 'live', readIndexSignals: liveHtmlSignals({ xRobotsTag: 'noindex, follow' }) },
  );

  assert.equal((await run(new Set())).ok, true);

  const listed = await run(new Set([
    'https://api-docs.quran.foundation/docs/user_related_apis_prelive/scopes/',
  ]));
  assert.equal(listed.ok, false);
  assert.equal(listed.outcome, 'noindex-url-in-sitemap');
});

test('issue checks still flag noindex on pages not meant to be noindexed', async () => {
  const result = await applySearchConsoleIssueChecks(
    'https://api-docs.quran.foundation/docs/quickstart/',
    'Crawled - currently not indexed',
    {
      ok: true,
      outcome: 'ok',
      finalStatus: 200,
      finalUrl: 'https://preview.example.com/docs/quickstart/',
    },
    {
      robotsTxt: 'User-agent: *\nAllow: /\n',
      sitemapUrls: new Set(),
      noindexPatterns: [/^\/docs\/user_related_apis_prelive\/.*$/],
    },
    { mode: 'live', readIndexSignals: liveHtmlSignals({ metaRobots: 'noindex' }) },
  );

  assert.equal(result.ok, false);
  assert.equal(result.outcome, 'unexpected-noindex');
});

test('formatted audit failures include SEO diagnostics', () => {
  assert.deepEqual(
    formatFailure('https://api-docs.quran.foundation/docs/page/', {
      outcome: 'canonical-url-mismatch',
      initialStatus: 200,
      finalStatus: 200,
      finalUrl: 'https://api-docs.quran.foundation/docs/page/',
      diagnostics: {
        canonical: 'https://api-docs.quran.foundation/docs/page',
        expected: 'https://api-docs.quran.foundation/docs/page/',
      },
      chain: [],
    }),
    {
      url: 'https://api-docs.quran.foundation/docs/page/',
      outcome: 'canonical-url-mismatch',
      initialStatus: 200,
      finalStatus: 200,
      finalUrl: 'https://api-docs.quran.foundation/docs/page/',
      error: undefined,
      diagnostics: {
        canonical: 'https://api-docs.quran.foundation/docs/page',
        expected: 'https://api-docs.quran.foundation/docs/page/',
      },
      chain: [],
    },
  );
});

test('issue checks require final canonical URL to match the exact sitemap URL', async () => {
  const result = await applySearchConsoleIssueChecks(
    'https://api-docs.quran.foundation/docs/category/content-apis',
    'Page with redirect',
    {
      ok: true,
      outcome: 'redirected',
      finalStatus: 200,
      finalUrl: 'https://preview.example.com/docs/category/content-apis/',
    },
    {
      robotsTxt: 'User-agent: *\nAllow: /\n',
      sitemapUrls: new Set([
        'https://api-docs.quran.foundation/docs/category/content-apis-4.0.0/',
      ]),
    },
    {
      mode: 'live',
      readIndexSignals: async () => ({
        canonical: 'https://api-docs.quran.foundation/docs/category/content-apis-4.0.0/',
        contentType: 'text/html',
        metaRobots: '',
        xRobotsTag: '',
      }),
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.outcome, 'final-url-not-in-sitemap');
});

test('indexed-but-blocked issue passes only after robots allow crawl and noindex is visible', async () => {
  const result = await applySearchConsoleIssueChecks(
    'https://api-docs.quran.foundation/search/',
    'Indexed, though blocked by robots.txt',
    {
      ok: true,
      outcome: 'ok',
      finalStatus: 200,
      finalUrl: 'https://preview.example.com/search/',
    },
    {
      robotsTxt: 'User-agent: *\nAllow: /\n',
      sitemapUrls: new Set(),
    },
    {
      mode: 'live',
      readIndexSignals: async () => ({
        canonical: 'https://api-docs.quran.foundation/search/',
        contentType: 'text/html',
        metaRobots: 'noindex,follow',
        xRobotsTag: '',
      }),
    },
  );

  assert.equal(result.ok, true);
});

test('indexed-but-blocked issue fails while robots still disallows the page', async () => {
  const result = await applySearchConsoleIssueChecks(
    'https://api-docs.quran.foundation/search/',
    'Indexed, though blocked by robots.txt',
    {
      ok: true,
      outcome: 'ok',
      finalStatus: 200,
      finalUrl: 'https://preview.example.com/search/',
    },
    {
      robotsTxt: 'User-agent: *\nDisallow: /search\n',
      sitemapUrls: new Set(),
    },
    {
      mode: 'live',
      readIndexSignals: async () => ({
        canonical: 'https://api-docs.quran.foundation/search/',
        contentType: 'text/html',
        metaRobots: 'noindex,follow',
        xRobotsTag: '',
      }),
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.outcome, 'blocked-by-robots');
});

test('robots parser applies the longest matching allow or disallow rule', () => {
  assert.equal(
    isPathBlockedByRobots(
      'User-agent: *\nDisallow: /search\nAllow: /search/public\n',
      '/search/private/',
    ),
    true,
  );
  assert.equal(
    isPathBlockedByRobots(
      'User-agent: *\nDisallow: /search\nAllow: /search/public\n',
      '/search/public/',
    ),
    false,
  );
});

test('robots parser prefers specific user-agent groups over wildcard groups', () => {
  assert.equal(
    isPathBlockedByRobots(
      [
        'User-agent: Googlebot',
        'Allow: /search',
        '',
        'User-agent: *',
        'Disallow: /search',
      ].join('\n'),
      '/search/',
    ),
    false,
  );
});

test('robots parser uses only the most specific matching user-agent token', () => {
  const robotsTxt = [
    'User-agent: Googlebot',
    'Disallow: /search',
    '',
    'User-agent: Googlebot-News',
    'Allow: /search',
    '',
    'User-agent: *',
    'Disallow: /search',
  ].join('\n');

  assert.equal(
    isPathBlockedByRobots(robotsTxt, '/search/', 'Googlebot-News'),
    false,
  );
  assert.equal(
    isPathBlockedByRobots(robotsTxt, '/search/', 'Googlebot'),
    true,
  );
});

test('robots parser merges duplicate groups for the selected user-agent token', () => {
  const robotsTxt = [
    'User-agent: Googlebot-News',
    'Disallow: /search',
    '',
    'User-agent: Googlebot-News',
    'Allow: /search/public',
    '',
    'User-agent: Googlebot',
    'Disallow: /',
  ].join('\n');

  assert.equal(
    isPathBlockedByRobots(robotsTxt, '/search/private/', 'Googlebot-News'),
    true,
  );
  assert.equal(
    isPathBlockedByRobots(robotsTxt, '/search/public/', 'Googlebot-News'),
    false,
  );
});

test('sitemap parser decodes loc entries', () => {
  assert.deepEqual(
    [...parseSitemapUrls('<url><loc>https://api-docs.quran.foundation/docs/a&amp;b/</loc></url>')],
    ['https://api-docs.quran.foundation/docs/a&b/'],
  );
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

test('local audit applies redirects before built source files', () => {
  const redirects = new Map([
    ['/docs/unversioned-page/', {
      status: '301',
      target: '/docs/versioned-page/',
    }],
  ]);
  const result = resolveLocalUrl(
    'https://api-docs.quran.foundation/docs/unversioned-page/',
    {
      redirects,
      pathExists: (pathname) =>
        pathname === '/docs/unversioned-page/' ||
        pathname === '/docs/versioned-page/',
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.outcome, 'redirected');
  assert.equal(result.finalUrl, 'https://api-docs.quran.foundation/docs/versioned-page/');
});

test('local audit maps pretty URL routes to index.html build paths', () => {
  assert.equal(
    buildPathForPathname('/docs/existing-page'),
    path.join(__dirname, '..', 'build', 'docs', 'existing-page', 'index.html'),
  );
  assert.equal(
    buildPathForPathname('/docs/existing-page/'),
    path.join(__dirname, '..', 'build', 'docs', 'existing-page', 'index.html'),
  );
  assert.equal(
    buildPathForPathname('/assets/app.js'),
    path.join(__dirname, '..', 'build', 'assets', 'app.js'),
  );
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

test('parseArgs accepts valid http origin options', () => {
  const { options } = parseArgs([
    '--origin=https://preview.example.com/',
    'coverage.xlsx',
  ]);

  assert.equal(options.origin, 'https://preview.example.com');
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

test('parseArgs rejects invalid origin options with clear errors', () => {
  assert.throws(
    () => parseArgs(['--origin=preview', 'coverage.xlsx']),
    /--origin must be an http\(s\) URL origin/,
  );
  assert.throws(
    () => parseArgs(['--origin=ftp://preview.example.com', 'coverage.xlsx']),
    /--origin must be an http\(s\) URL origin/,
  );
  assert.throws(
    () => parseArgs(['--origin=https://preview.example.com/docs', 'coverage.xlsx']),
    /--origin must be an http\(s\) URL origin/,
  );
});
