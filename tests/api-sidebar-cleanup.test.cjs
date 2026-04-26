const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  filterMissingSidebarItems,
  normalizeRubElHizbDocLabels,
  normalizeRubElHizbSidebarLabels,
} = require(path.join(__dirname, '..', 'scripts', 'set-api-displayed-sidebars.js'));

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
