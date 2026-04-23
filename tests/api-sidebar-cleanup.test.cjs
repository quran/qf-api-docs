const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  filterMissingSidebarItems,
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
