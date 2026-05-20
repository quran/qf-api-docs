const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  filterMissingSidebarItems,
  getDisplayedSidebarId,
  normalizeRubElHizbDocLabels,
  normalizeRubElHizbSidebarLabels,
} = require(path.join(__dirname, '..', 'scripts', 'set-api-displayed-sidebars.js'));
const {
  createRedirectsForReplacement,
} = require(path.join(__dirname, '..', 'scripts', 'prune-generated-api-aliases.js'));

test('drops empty categories that have no surviving items and no link', () => {
  const items = [
    {
      type: 'category',
      label: 'Collections',
      items: [
        {
          type: 'doc',
          id: 'user_related_apis_versioned/add-collection',
        },
      ],
    },
  ];

  assert.deepEqual(filterMissingSidebarItems(items, new Set()), []);
});

test('preserves empty categories that still have a generated index link', () => {
  const items = [
    {
      type: 'category',
      label: 'Collections',
      link: {
        type: 'generated-index',
        slug: '/category/collections',
      },
      items: [
        {
          type: 'doc',
          id: 'user_related_apis_versioned/add-collection',
        },
      ],
    },
  ];

  assert.deepEqual(filterMissingSidebarItems(items, new Set()), [
    {
      type: 'category',
      label: 'Collections',
      link: {
        type: 'generated-index',
        slug: '/category/collections',
      },
      items: [],
    },
  ]);
});

test('keeps non-empty categories but strips invalid doc links', () => {
  const items = [
    {
      type: 'category',
      label: 'Collections',
      link: {
        type: 'doc',
        id: 'user_related_apis_versioned/missing-index',
      },
      items: [
        {
          type: 'doc',
          id: 'user_related_apis_versioned/add-collection',
        },
      ],
    },
  ];

  assert.deepEqual(
    filterMissingSidebarItems(
      items,
      new Set(['user_related_apis_versioned/add-collection']),
    ),
    [
      {
        type: 'category',
        label: 'Collections',
        items: [
          {
            type: 'doc',
            id: 'user_related_apis_versioned/add-collection',
          },
        ],
      },
    ],
  );
});

test('links generated tag docs to matching sidebar categories', () => {
  const items = [
    {
      type: 'category',
      label: 'Activity Days',
      items: [
        {
          type: 'doc',
          id: 'user_related_apis_prelive/add-update-activity-day',
        },
      ],
    },
  ];

  assert.deepEqual(
    filterMissingSidebarItems(
      items,
      new Set([
        'user_related_apis_prelive/activity-days',
        'user_related_apis_prelive/add-update-activity-day',
      ]),
    ),
    [
      {
        type: 'category',
        label: 'Activity Days',
        link: {
          type: 'doc',
          id: 'user_related_apis_prelive/activity-days',
        },
        items: [
          {
            type: 'doc',
            id: 'user_related_apis_prelive/add-update-activity-day',
          },
        ],
      },
    ],
  );
});

test('normalizes Rub el Hizb alias labels in generated API docs', () => {
  const filePath = path.join(
    __dirname,
    '..',
    'docs',
    'content_apis_versioned',
    'verses-by-rub-el-hizb-number.api.mdx',
  );
  const content = `---
id: verses-by-rub-el-hizb-number
title: "By Rub el Hizb number (alias: /by_rub_el_hizb)"
sidebar_label: "By Rub el Hizb number (alias: /by_rub_el_hizb)"
api: {"postman":{"name":"By Rub el Hizb number (alias: /by_rub_el_hizb)"}}
---

## By Rub el Hizb number (alias: /by_rub_el_hizb)
`;

  assert.equal(
    normalizeRubElHizbDocLabels(filePath, content),
    `---
id: verses-by-rub-el-hizb-number
title: "By Rub el Hizb number"
sidebar_label: "By Rub el Hizb number"
api: {"postman":{"name":"By Rub el Hizb number"}}
---

## By Rub el Hizb number
`,
  );
});

test('keeps the shared sidebar for pre-live API docs', () => {
  assert.equal(
    getDisplayedSidebarId(
      path.join(
        __dirname,
        '..',
        'docs',
        'user_related_apis_prelive',
        'delete-note-by-id.api.mdx',
      ),
    ),
    'APIsSidebar',
  );
});

test('keeps shared sidebars for latest and versioned generated API docs', () => {
  assert.equal(
    getDisplayedSidebarId(
      path.join(
        __dirname,
        '..',
        'docs',
        'user_related_apis_versioned',
        'delete-note-by-id.api.mdx',
      ),
    ),
    'APIsSidebar',
  );

  assert.equal(
    getDisplayedSidebarId(
      path.join(
        __dirname,
        '..',
        'docs',
        'user_related_apis_versioned',
        '1.0.0',
        'delete-note-by-id.api.mdx',
      ),
    ),
    'APIsVersionedSidebar',
  );
});

test('normalizes Rub el Hizb alias labels in versioned sidebars', () => {
  const items = [
    {
      type: 'category',
      label: 'Translations',
      items: [
        {
          type: 'doc',
          id: 'content_apis_versioned/4.0.0/list-rub-el-hizb-translations',
          label: 'Get translations for specific Rub el Hizb (alias: /by_rub)',
        },
        {
          type: 'doc',
          id: 'content_apis_versioned/4.0.0/list-rub-el-hizb-translations-rub',
          label: 'Get translations for specific Rub el Hizb',
        },
      ],
    },
  ];

  assert.deepEqual(normalizeRubElHizbSidebarLabels(items), [
    {
      type: 'category',
      label: 'Translations',
      items: [
        {
          type: 'doc',
          id: 'content_apis_versioned/4.0.0/list-rub-el-hizb-translations',
          label: 'Get translations for specific Rub el Hizb',
        },
        {
          type: 'doc',
          id: 'content_apis_versioned/4.0.0/list-rub-el-hizb-translations-rub',
          label: 'Get translations for specific Rub el Hizb (alias: /by_rub)',
        },
      ],
    },
  ]);
});

test('records both slash variants when auth aliases are normalized', () => {
  assert.deepEqual(
    createRedirectsForReplacement(
      'user_related_apis_prelive/auth-post-v-1-reading-sessions',
      'user_related_apis_prelive/add-or-update-user-reading-session',
    ),
    [
      {
        source: '/docs/user_related_apis_prelive/auth-post-v-1-reading-sessions',
        target:
          '/docs/user_related_apis_prelive/add-or-update-user-reading-session/',
      },
      {
        source: '/docs/user_related_apis_prelive/auth-post-v-1-reading-sessions/',
        target:
          '/docs/user_related_apis_prelive/add-or-update-user-reading-session/',
      },
    ],
  );
});
