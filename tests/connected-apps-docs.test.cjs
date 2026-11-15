const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const docsDir = path.join(repoRoot, 'docs');
const docPath = path.join(docsDir, 'connected-apps.mdx');
const doc = fs.readFileSync(docPath, 'utf8');
const oauthGuide = fs.readFileSync(
  path.join(docsDir, 'tutorials', 'oidc', 'getting-started-with-oauth2.mdx'),
  'utf8',
);
const customCss = fs.readFileSync(
  path.join(repoRoot, 'src', 'css', 'custom.css'),
  'utf8',
);
const packageJson = require(path.join(repoRoot, 'package.json'));
const sidebars = require(path.join(repoRoot, 'sidebars.js'));
const docusaurusConfig = require(path.join(repoRoot, 'docusaurus.config.js'));
const preliveUserApi = require(path.join(
  repoRoot,
  'openAPI',
  'user-related-apis',
  'pre-live',
  'v1.json',
));
const { generateLlmsTxt } = require(path.join(
  repoRoot,
  'plugins',
  'llms-txt-plugin.js',
));

const findSidebarDoc = (sidebarName, docId) => {
  const sidebar = sidebars[sidebarName];
  assert.ok(sidebar, `expected ${sidebarName} to exist`);

  return sidebar.find(
    (item) => item && item.type === 'doc' && item.id === docId,
  );
};

test('keeps generated Connected Apps header examples MDX-safe', () => {
  const cookieExample =
    preliveUserApi.paths['/users/csrf-token'].get.responses['200'].headers[
      'Set-Cookie'
    ].example;

  assert.match(cookieExample, /^_csrf=[^<>\s;]+; Path=\/; SameSite=Lax$/);
  assert.doesNotMatch(JSON.stringify(preliveUserApi), /<opaque>/);
});

test('adds a production Connected Apps docs page', () => {
  assert.match(doc, /^title: "Connected Apps"$/m);
  assert.match(doc, /^sidebar_label: "Connected Apps"$/m);
  assert.match(doc, /^displayed_sidebar: "APIsSidebar"$/m);

  for (const prototypeOnlyText of [
    'Atlas Docs Hub',
    'Concept 01',
    'body.dark',
    'mobile-nav',
    'Quran.Foundation / Connected Apps',
    'Boundaries to communicate',
    'Internal visibility controls',
    'teams need',
    'promoting apps',
    'planned partner workspace',
    'not just a page of links',
    'when enabled',
  ]) {
    assert.doesNotMatch(
      doc,
      new RegExp(prototypeOnlyText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      `expected page to exclude prototype-only text: ${prototypeOnlyText}`,
    );
  }

  assert.doesNotMatch(
    doc,
    /\[FILL|ƒ|Â|â|�/,
    'expected production page to exclude launch placeholders and mojibake',
  );
});

const slugify = (heading) =>
  heading
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/ /g, '-');

const headingIds = new Set(
  [...doc.matchAll(/^#{1,6} (.+)$/gm)].map((match) => slugify(match[1])),
);
const aliasIds = new Set(
  [...doc.matchAll(/<a id="([a-z0-9-]+)" className="connectedAppsLegacyAnchor"><\/a>/g)].map((match) => match[1]),
);

test('documents the RC1 Connected Apps release concepts', () => {
  const requiredPatterns = [
    /\*\*Version:\*\* 1\.1 · \*\*Published:\*\* \d{4}-\d{2}-\d{2} · \*\*Effective date:\*\* \d{4}-\d{2}-\d{2}/,
    /\*\*Quran App Store\*\* at \[Quran\.com\/apps\]\(https:\/\/quran\.com\/apps\)/,
    /Scholarly, engineering, and user experience \(UX\) review then run in parallel and can complete in any order/,
    /within \*\*5 business days\*\*/,
    /within \*\*1 to 2 business days\*\*/,
    /within \*\*3 calendar weeks\*\*/,
    /the three-week target restarts/,
    /Up to \*\*40 characters\*\*/,
    /Up to \*\*60 characters\*\*/,
    /Up to \*\*160 characters\*\*/,
    /at least \*\*512 x 512 px\*\*/,
    /Study tools, Reflections, Quran Reader, Community, Hadith and Sunnah, and Audio/,
    /\| Status \| Requirements \| Visibility \| Quran ID \|/,
    /\*\*Integrated App\*\* \| Registered in the Developer Console and uses Quran Foundation APIs; has not applied to or been admitted to the Quran App Store\. \| Not publicly listed\. \| Not required by status\. \|/,
    /\*\*Verified App\*\* \| Trusted content, agreement to Quran Foundation principles, and responsible practices\. \| Searchable only; excluded from browsable sections\. \| Not required by status\. \|/,
    /\*\*Vision-Aligned App\*\* \| Scholarly reviewed, strongly aligned with the Quran Foundation mission, and uses Quran ID for user continuity\. \| Listed in the Quran App Store\. \| Required\. \|/,
    /\*\*Transformational App\*\* \| Upholds the highest partner standards: unique value and meaningful contribution, high scholarly standards, exclusive Quran ID authentication for user continuity, support for tracking users' Quran journeys and meaningful progress, and a da'wah-oriented purpose\. \| High visibility in the Quran App Store; potential Quran\.com homepage featuring, requested by email\. \| Exclusive authentication\. \|/,
    /Integrated Apps are registered in the Developer Console and use Quran Foundation APIs\. They have not applied to or been admitted to the Quran App Store\. Applicants must pass all four eligibility gates/,
    /Verified App, Vision-Aligned App, and Transformational App are assigned after review\. Submitting an application does not grant a reviewed status\./,
    /\[Quran ID\]\(#connect-quran-id\) \(Quran Foundation OAuth\) connects a user's Quran Foundation account to participating apps\./,
    /Visibility follows the assigned status and ongoing compliance\./,
    /Transformational is the goal: help users carry a meaningful Quran journey across the ecosystem\./,
    /:::tip Aim for Transformational/,
    /Quran ID is the sole source of backend user authentication/,
    /Signing in does not automatically synchronize all account data\./,
    /Transformational partners may request Quran\.com homepage consideration by emailing \[developers@quran\.com\]/,
    /### Journey tracking and shared insights/,
    /Never sell user data or repurpose it beyond disclosed features\./,
    /Status, ranking, and editorial placement cannot be bought through donations/,
    /A published app cannot open a new submission while it is live/,
    /Prior approval does not approve new functionality\./,
    /material changes to disclosed data collection, sharing, or purposes/,
    /Voluntary withdrawal and resubmission starts a new three-week target\./,
    /### Does every app need Quran ID\?/,
    /\[Developer Privacy Policy Packet\]\(https:\/\/api-docs\.quran\.foundation\/legal\/developer-privacy\/\)/,
    /\[Quran Foundation Developer Terms of Service: License Grant\]\(https:\/\/api-docs\.quran\.foundation\/legal\/developer-terms\/#2-license-grant\)/,
    /Quran data provided by \[Quran Foundation\]\(https:\/\/quran\.foundation\/\)/,
    /every seven days when connectivity permits/,
    /\[Content Sync guide\]\(https:\/\/api-docs\.quran\.foundation\/docs\/tutorials\/content-sync\/getting-started\/\)/,
    /https:\/\/calendar\.app\.google\/Xi4TJMrLtqHj8C5o7/,
    /developers@quran\.com/,
    /14-day notice period/,
  ];

  for (const pattern of requiredPatterns) {
    assert.match(doc, pattern);
  }

  assert.doesNotMatch(doc, /weekly delta sync/i);
  assert.doesNotMatch(
    doc,
    /Indexed App|Indexed \(searchable\)|Verified Listing|Vision Aligned|user enabled\) App/,
    'expected only the current app status names',
  );
  assert.doesNotMatch(doc, /\bPopular\b/, 'Popular is not a selectable category');

  for (const retiredCopy of [
    /New submissions default to Verified App/,
    /Every status, including Integrated App/,
    /Quran Foundation SSO/,
    /\[Developer Terms\]/,
    /developer privacy requirements/,
    /Prominent App Store placement/,
    /briefed to the relevant teams rather than re-reviewed/,
  ]) {
    assert.doesNotMatch(doc, retiredCopy, `expected retired copy to be removed: ${retiredCopy}`);
  }
  assert.equal(
    (doc.match(/Quran Foundation OAuth/g) || []).length,
    1,
    'expected Quran Foundation OAuth only at the first Quran ID mention',
  );
});

test('orders the guide around the developer journey', () => {
  const headings = [
    '## The Developer Console',
    '## Follow the Connected Apps process',
    '## Check whether your app is eligible',
    '## Prepare your listing',
    '## How to submit',
    '## App statuses',
    '## After approval: updates and status changes',
  ];
  const indexes = headings.map((heading) => doc.indexOf(`\n${heading}\n`));

  indexes.forEach((index, position) => {
    assert.ok(index >= 0, `expected heading: ${headings[position]}`);
    if (position > 0) {
      assert.ok(
        indexes[position - 1] < index,
        `expected ${headings[position - 1]} before ${headings[position]}`,
      );
    }
  });
});

test('meets the RC1 copy conventions', () => {
  assert.equal(
    (doc.match(/^# /gm) || []).length,
    1,
    'expected exactly one H1',
  );
  assert.doesNotMatch(doc, /—/, 'expected no em dashes');
  assert.doesNotMatch(doc, /[“”‘’]/, 'expected straight quotes');
  assert.doesNotMatch(doc, /<!--/, 'expected no internal maintainer notes');
  assert.doesNotMatch(doc, /\bQF\b/, 'expected Quran Foundation in full');
});

test('resolves every in-page anchor and keeps legacy anchors', () => {
  for (const [, anchor] of doc.matchAll(/\]\(#([a-z0-9-]+)\)/g)) {
    assert.ok(
      headingIds.has(anchor) || aliasIds.has(anchor),
      `expected in-page anchor to resolve: #${anchor}`,
    );
  }

  for (const legacyAnchor of [
    'who-should-use-this-guide',
    'what-review-looks-at',
    'gate-1-content-integrity-and-updates',
    'gate-2-security-and-privacy-baseline',
    'gate-3-api-and-platform-compliance',
    'gate-4-maintenance-and-responsiveness',
    'card-specs',
    'indexed-searchable-app',
    'verified-listing-app',
    'vision-aligned-app',
    'transformational-user-enabled-app',
    'integrated-app',
    'verified-app',
    'transformational-app',
    'featured-placement-temporary-editorial-promotion',
    'what-a-status-does-and-does-not-mean',
    'directory-listing-versus-homepage-promotion',
    'connect-qurancom-user-accounts',
    'what-your-app-must-tell-users',
    'build-toward-trust',
    'avoid-avoidable-harm',
    'tell-us-before-shipping-material-changes',
    'terms-and-compliance',
    'after-publication',
    'connect-quran-foundation-user-accounts',
    'does-every-app-need-oauth',
  ]) {
    assert.ok(aliasIds.has(legacyAnchor), `expected legacy anchor alias: #${legacyAnchor}`);
  }

  for (const [rowAnchor, rowLabel] of [
    ['gate-1-content-integrity-and-updates', '**1. Content integrity and updates**'],
    ['gate-2-security-and-privacy-baseline', '**2. Security and privacy**'],
    ['gate-3-api-and-platform-compliance', '**3. API and platform compliance**'],
    ['gate-4-maintenance-and-responsiveness', '**4. Maintenance and responsiveness**'],
  ]) {
    assert.ok(
      doc.includes(`| <a id="${rowAnchor}" className="connectedAppsLegacyAnchor"></a>${rowLabel} |`),
      `expected #${rowAnchor} on its matching table row`,
    );
  }

  const anchorTag = (id) => `<a id="${id}" className="connectedAppsLegacyAnchor"></a>`;
  for (const [rowAnchors, rowLabel] of [
    [['integrated-app'], '**Integrated App**'],
    [['verified-app', 'indexed-searchable-app'], '**Verified App**'],
    [['vision-aligned-app', 'verified-listing-app'], '**Vision-Aligned App**'],
    [['transformational-app', 'transformational-user-enabled-app'], '**Transformational App**'],
  ]) {
    assert.ok(
      doc.includes(`| ${rowAnchors.map(anchorTag).join('')}${rowLabel} |`),
      `expected #${rowAnchors.join(', #')} on the ${rowLabel} status row`,
    );
  }

  for (const consoleAnchor of [
    'ai-features-and-generated-religious-content',
    'review-stages-and-timing',
    'terms-and-commercial-use',
    'content-and-attribution-requirements',
    'connect-quran-id',
    'after-approval-updates-and-status-changes',
  ]) {
    assert.ok(headingIds.has(consoleAnchor), `expected linked heading: #${consoleAnchor}`);
  }
});

test('routes self-service setup through the Developer Console', () => {
  assert.doesNotMatch(doc, /to="\/request-access"/);
  assert.match(
    doc,
    /\[Developer Console\]\(https:\/\/dev-console\.quran\.foundation\/projects\)/,
  );
  assert.match(doc, /\[eligibility gates\]\(#check-whether-your-app-is-eligible\)/);
  assert.doesNotMatch(
    doc,
    /docs\.google\.com\/document/,
    'listing submission runs in the Developer Console, not a Google Doc',
  );
});

test('uses the current Quran Foundation name in hand-authored guides', () => {
  for (const [name, source] of [
    ['Connected Apps', doc],
    ['OAuth getting started', oauthGuide],
  ]) {
    assert.doesNotMatch(
      source,
      /Quran\.Foundation/,
      `${name} should use the current Quran Foundation name`,
    );
  }
});

test('surfaces Connected Apps in navbar and shared sidebars', () => {
  const navbarItems = docusaurusConfig.themeConfig.navbar.items;
  const updatesIndex = navbarItems.findIndex(
    (item) => item.type === 'doc' && item.docId === 'updates/index',
  );
  const connectedAppsIndex = navbarItems.findIndex(
    (item) => item.type === 'doc' && item.docId === 'connected-apps',
  );

  assert.ok(updatesIndex >= 0, 'expected Updates navbar item');
  assert.equal(
    connectedAppsIndex,
    updatesIndex + 1,
    'expected Connected Apps directly after Updates',
  );
  assert.equal(navbarItems[connectedAppsIndex].label, 'Connected Apps');

  const apisDropdown = navbarItems.find(
    (item) => item.type === 'dropdown' && item.label === 'APIs',
  );
  assert.ok(apisDropdown, 'expected APIs dropdown');
  assert.equal(
    Object.hasOwn(apisDropdown, 'sidebarId'),
    false,
    'dropdown navbar items should not pass sidebarId through to the DOM',
  );

  for (const sidebarName of ['APIsSidebar', 'APIsVersionedSidebar']) {
    assert.deepEqual(findSidebarDoc(sidebarName, 'connected-apps'), {
      type: 'doc',
      id: 'connected-apps',
      label: 'Connected Apps',
    });
  }
});

test('includes Connected Apps in generated llms.txt discovery', () => {
  const { content } = generateLlmsTxt(docsDir);

  assert.match(
    content,
    /\[Connected Apps\]\(https:\/\/api-docs\.quran\.foundation\/docs\/connected-apps\/\): Partner guide/,
  );
});

test('does not ship orphaned Connected Apps CSS classes', () => {
  const cssClassNames = new Set(
    [...customCss.matchAll(/\.(connectedApps[A-Za-z0-9_-]+)/g)].map(
      (match) => match[1],
    ),
  );
  const pageClassNames = new Set(
    [...doc.matchAll(/\bconnectedApps[A-Za-z0-9_-]+\b/g)].map(
      (match) => match[0],
    ),
  );
  const orphanedClassNames = [...cssClassNames].filter(
    (className) => !pageClassNames.has(className),
  );

  assert.deepEqual(
    orphanedClassNames,
    [],
    'Connected Apps CSS classes must be used by the MDX page',
  );
});

test('uses the cross-platform test runner wrapper', () => {
  assert.equal(packageJson.scripts.test, 'node scripts/run-tests.cjs');
  assert.ok(
    fs.existsSync(path.join(repoRoot, 'scripts', 'run-tests.cjs')),
    'expected test runner wrapper to exist',
  );
});
