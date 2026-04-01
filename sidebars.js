/**
 * Creating a sidebar enables you to:
 * - create an ordered group of docs
 * - render a sidebar for each doc of that group
 * - provide next/previous navigation
 *
 * The sidebars can be generated from the filesystem, or explicitly defined
 * here.
 */
const fs = require("fs");
const path = require("path");
const contentAPIsVersions = require("./docs/content_apis_versioned/versions.json");
const userRelatedAPIsVersions = require("./docs/user_related_apis_versioned/versions.json");
const oauth2APIsVersions = require("./docs/oauth2_apis_versioned/versions.json");
const searchAPIsVersions = require("./docs/search_apis_versioned/versions.json");

const safeRequire = (relativePath, fallback) => {
  const fullPath = path.join(__dirname, relativePath);
  if (!fs.existsSync(fullPath)) {
    return fallback;
  }

  return require(fullPath);
};

const cloneSidebarItems = (items) => JSON.parse(JSON.stringify(items));

const makeReadingSessionsVsActivityDaysSidebarItem = (docId) => ({
  type: "category",
  label: "Reading Sessions vs Activity Days (quick decision/clarifier)",
  link: {
    type: "doc",
    id: docId,
  },
  items: [],
});

const reorderUserRelatedApisSidebarItems = (items, vsGuideDocId) => {
  const isCategoryWithLabel = (item, label) =>
    item &&
    typeof item === "object" &&
    item.type === "category" &&
    item.label === label;

  const readingSessions = items.find((item) =>
    isCategoryWithLabel(item, "Reading Sessions"),
  );
  const activityDays = items.find((item) =>
    isCategoryWithLabel(item, "Activity Days"),
  );

  if (!readingSessions || !activityDays) {
    return items;
  }

  const vsGuideSidebarItem =
    makeReadingSessionsVsActivityDaysSidebarItem(vsGuideDocId);
  const insertAt = items.indexOf(readingSessions);
  const isVsGuide = (item) =>
    isCategoryWithLabel(item, vsGuideSidebarItem.label);

  const before = items
    .slice(0, insertAt)
    .filter((item) => item !== activityDays && !isVsGuide(item));
  const after = items
    .slice(insertAt + 1)
    .filter(
      (item) =>
        item !== activityDays &&
        item !== readingSessions &&
        !isVsGuide(item),
    );

  return [
    ...before,
    readingSessions,
    vsGuideSidebarItem,
    activityDays,
    ...after,
  ];
};

const stripIntroDoc = (items, introDocId) =>
  items.filter(
    (item) =>
      !(
        item &&
        typeof item === "object" &&
        item.type === "doc" &&
        item.id === introDocId
      ),
  );

const makeApiDocSidebarItem = (id, label, className) => ({
  type: "doc",
  id,
  label,
  className,
});

const makeApiCategorySidebarItem = (label, items) => ({
  type: "category",
  label,
  items,
});

const insertDocsIntoCategory = (
  items,
  categoryLabel,
  docsToInsert,
  afterDocId,
) =>
  items.map((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      item.type !== "category" ||
      item.label !== categoryLabel
    ) {
      return item;
    }

    const categoryItems = [...item.items];
    let insertAt = afterDocId
      ? categoryItems.findIndex(
          (categoryItem) =>
            categoryItem &&
            typeof categoryItem === "object" &&
            categoryItem.type === "doc" &&
            categoryItem.id === afterDocId,
        ) + 1
      : categoryItems.length;

    if (insertAt <= 0) {
      insertAt = categoryItems.length;
    }

    for (const docItem of docsToInsert) {
      const alreadyExists = categoryItems.some(
        (categoryItem) =>
          categoryItem &&
          typeof categoryItem === "object" &&
          categoryItem.type === "doc" &&
          categoryItem.id === docItem.id,
      );

      if (alreadyExists) {
        continue;
      }

      categoryItems.splice(insertAt, 0, docItem);
      insertAt += 1;
    }

    return {
      ...item,
      items: categoryItems,
    };
  });

const ensureDocsInCategory = (items, categoryLabel, docsToEnsure, afterDocId) => {
  const hasCategory = items.some(
    (item) =>
      item &&
      typeof item === "object" &&
      item.type === "category" &&
      item.label === categoryLabel,
  );

  if (hasCategory) {
    return insertDocsIntoCategory(
      items,
      categoryLabel,
      docsToEnsure,
      afterDocId,
    );
  }

  return [
    ...items,
    makeApiCategorySidebarItem(
      categoryLabel,
      docsToEnsure.filter(
        (docItem, index, allItems) =>
          allItems.findIndex((candidate) => candidate.id === docItem.id) ===
          index,
      ),
    ),
  ];
};

const extendUserRelatedApisSidebarItems = (items, baseDocIdPrefix) => {
  const withUsersEndpoints = insertDocsIntoCategory(
    items,
    "Users",
    [
      makeApiDocSidebarItem(
        `${baseDocIdPrefix}/users-controller-get-featured-users`,
        "Get featured users for follow recommendation",
        "api-method get",
      ),
      makeApiDocSidebarItem(
        `${baseDocIdPrefix}/users-controller-follow-featured-users`,
        "Follow all featured users",
        "api-method post",
      ),
    ],
    `${baseDocIdPrefix}/users-controller-search`,
  );

  return insertDocsIntoCategory(
    withUsersEndpoints,
    "Posts",
    [
      makeApiDocSidebarItem(
        `${baseDocIdPrefix}/posts-controller-get-related-posts`,
        "Get related posts",
        "api-method get",
      ),
    ],
    `${baseDocIdPrefix}/posts-controller-find-one`,
  );
};

const extendContentApisSidebarItems = (items, baseDocIdPrefix) =>
  ensureDocsInCategory(
    items,
    "Quran Reflect Posts",
    [
      makeApiDocSidebarItem(
        `${baseDocIdPrefix}/posts-controller-feed`,
        "Get posts feed",
        "api-method get",
      ),
      makeApiDocSidebarItem(
        `${baseDocIdPrefix}/posts-controller-find-one`,
        "Get post by ID",
        "api-method get",
      ),
      makeApiDocSidebarItem(
        `${baseDocIdPrefix}/posts-controller-get-user-post`,
        "Get user posts",
        "api-method get",
      ),
      makeApiDocSidebarItem(
        `${baseDocIdPrefix}/posts-controller-get-comments`,
        "Get post comments",
        "api-method get",
      ),
      makeApiDocSidebarItem(
        `${baseDocIdPrefix}/posts-controller-get-all-comment`,
        "Get all post comments",
        "api-method get",
      ),
    ],
    null,
  );

const buildContentApisLatestItems = () =>
  extendContentApisSidebarItems(
    cloneSidebarItems(require("./docs/content_apis_versioned/sidebar.js")),
    "content_apis_versioned",
  );
const buildContentApisVersionedItems = () =>
  extendContentApisSidebarItems(
    cloneSidebarItems(require("./docs/content_apis_versioned/4.0.0/sidebar.js")),
    "content_apis_versioned/4.0.0",
  );

const buildUserRelatedApisLatestItems = () =>
  reorderUserRelatedApisSidebarItems(
    extendUserRelatedApisSidebarItems(
      cloneSidebarItems(require("./docs/user_related_apis_versioned/sidebar.js")),
      "user_related_apis_versioned",
    ),
    "user-related-apis/reading-sessions-vs-activity-days",
  );
const buildUserRelatedApisVersionedItems = () =>
  reorderUserRelatedApisSidebarItems(
    extendUserRelatedApisSidebarItems(
      cloneSidebarItems(
        require("./docs/user_related_apis_versioned/1.0.0/sidebar.js"),
      ),
      "user_related_apis_versioned/1.0.0",
    ),
    "user-related-apis/1.0.0/reading-sessions-vs-activity-days",
  );
const buildUserRelatedApisPreLiveItems = () =>
  cloneSidebarItems(safeRequire("./docs/user_related_apis_prelive/sidebar.js", []));

const buildOAuth2ApisLatestItems = () =>
  cloneSidebarItems(require("./docs/oauth2_apis_versioned/sidebar.js"));
const buildOAuth2ApisVersionedItems = () =>
  cloneSidebarItems(require("./docs/oauth2_apis_versioned/1.0.0/sidebar.js"));

const buildSearchApisLatestItems = () =>
  cloneSidebarItems(require("./docs/search_apis_versioned/sidebar.js"));
const buildSearchApisVersionedItems = () =>
  cloneSidebarItems(require("./docs/search_apis_versioned/1.0.0/sidebar.js"));

const contentApisLatestConfig = {
  label: "Content APIs",
  introDocId: "content_apis_versioned/content-apis",
  versionLabel: "v4.0.0",
  versions: contentAPIsVersions,
  generatedIndexTitle: "Content APIs (latest)",
  generatedIndexDescription: "Content APIs",
  generatedIndexSlug: "/category/content-apis",
  itemsBuilder: buildContentApisLatestItems,
};

const contentApisVersionedConfig = {
  label: "Content APIs",
  introDocId: "content_apis_versioned/4.0.0/content-apis",
  versionLabel: "v4.0.0",
  versions: contentAPIsVersions,
  generatedIndexTitle: "Quran.Foundation Content API (v4.0.0)",
  generatedIndexDescription: "Content APIs",
  generatedIndexSlug: "/category/content-apis-4.0.0",
  itemsBuilder: buildContentApisVersionedItems,
};

const userRelatedApisLatestConfig = {
  label: "User-related APIs",
  introDocId: "user_related_apis_versioned/user-related-apis",
  versionLabel: "v1.0.0",
  versions: userRelatedAPIsVersions,
  generatedIndexTitle: "User-related (latest)",
  generatedIndexDescription: "User-related APIs",
  generatedIndexSlug: "/category/user-related-apis",
  itemsBuilder: buildUserRelatedApisLatestItems,
};

const userRelatedApisVersionedConfig = {
  label: "User-related APIs",
  introDocId: "user_related_apis_versioned/1.0.0/user-related-apis",
  versionLabel: "v1.0.0",
  versions: userRelatedAPIsVersions,
  generatedIndexTitle: "User-related APIs (v1.0.0)",
  generatedIndexDescription: "User-related APIs",
  generatedIndexSlug: "/category/user-related-apis-1.0.0",
  itemsBuilder: buildUserRelatedApisVersionedItems,
};

const oauth2ApisLatestConfig = {
  label: "OAuth2 APIs",
  introDocId: "oauth2_apis_versioned/oauth-2-apis",
  versionLabel: "v1.0.0",
  versions: oauth2APIsVersions,
  generatedIndexTitle: "OAuth2 APIs (latest)",
  generatedIndexDescription: "OAuth2 APIs",
  generatedIndexSlug: "/category/oauth2_apis",
  itemsBuilder: buildOAuth2ApisLatestItems,
};

const oauth2ApisVersionedConfig = {
  label: "OAuth2 APIs",
  introDocId: "oauth2_apis_versioned/1.0.0/oauth-2-apis",
  versionLabel: "v1.0.0",
  versions: oauth2APIsVersions,
  generatedIndexTitle: "OAuth2 APIs (v1.0.0)",
  generatedIndexDescription: "OAuth2 APIs",
  generatedIndexSlug: "/category/oauth2_apis-1.0.0",
  itemsBuilder: buildOAuth2ApisVersionedItems,
};

const searchApisLatestConfig = {
  label: "Search APIs",
  introDocId: "search_apis_versioned/quran-foundation-search-api",
  versionLabel: "v1.0.0",
  versions: searchAPIsVersions,
  generatedIndexTitle: "Search APIs (latest)",
  generatedIndexDescription: "Search APIs",
  generatedIndexSlug: "/category/search-apis",
  itemsBuilder: buildSearchApisLatestItems,
};

const searchApisVersionedConfig = {
  label: "Search APIs",
  introDocId: "search_apis_versioned/1.0.0/quran-foundation-search-api",
  versionLabel: "v1.0.0",
  versions: searchAPIsVersions,
  generatedIndexTitle: "Search APIs (v1.0.0)",
  generatedIndexDescription: "Search APIs",
  generatedIndexSlug: "/category/search-apis-1.0.0",
  itemsBuilder: buildSearchApisVersionedItems,
};

const latestApiFamilies = [
  contentApisLatestConfig,
  userRelatedApisLatestConfig,
  oauth2ApisLatestConfig,
  searchApisLatestConfig,
];

const versionedApiFamilies = [
  contentApisVersionedConfig,
  userRelatedApisVersionedConfig,
  oauth2ApisVersionedConfig,
  searchApisVersionedConfig,
];

const makeApiFamilySidebar = (config) => [
  {
    type: "category",
    label: config.label,
    link: {
      type: "generated-index",
      title: config.generatedIndexTitle,
      description: config.generatedIndexDescription,
      slug: config.generatedIndexSlug,
    },
    items: config.itemsBuilder(),
  },
];

const makeSharedApiFamilyCategory = (config) => ({
  type: "category",
  label: config.label,
  link: {
    type: "doc",
    id: config.introDocId,
  },
  collapsible: true,
  collapsed: true,
  items: stripIntroDoc(config.itemsBuilder(), config.introDocId),
});

const buildSdkSidebarItems = () => [
  {
    type: "category",
    label: "JS/TS",
    link: {
      type: "doc",
      id: "sdk/javascript/index",
    },
    collapsible: true,
    collapsed: false,
    items: [
      "sdk/javascript/chapters",
      "sdk/javascript/verses",
      "sdk/javascript/audio",
      "sdk/javascript/resources",
      "sdk/javascript/juzs",
      "sdk/javascript/search",
      "sdk/javascript/v1-migration-guide",
    ],
  },
];

const buildTutorialsSidebarItems = () => [
  "tutorials/faq",
  {
    type: "category",
    label: "Font & Page Rendering",
    collapsible: true,
    collapsed: false,
    items: [
      "tutorials/fonts/font-rendering",
      "tutorials/fonts/page-layout",
    ],
  },
  {
    type: "category",
    label: "OAuth2 / OpenID Connect",
    collapsible: true,
    collapsed: false,
    items: [
      "tutorials/oidc/getting-started-with-oauth2",
      "tutorials/oidc/openid-connect",
      "tutorials/oidc/example-integration",
      "tutorials/oidc/client-setup",
      {
        type: "category",
        label: "Mobile Apps",
        link: {
          type: "doc",
          id: "tutorials/oidc/mobile-apps/index",
        },
        collapsible: true,
        collapsed: false,
        items: [
          "tutorials/oidc/mobile-apps/react-native",
          "tutorials/oidc/mobile-apps/android",
          "tutorials/oidc/mobile-apps/iOS",
        ],
      },
    ],
  },
  {
    type: "category",
    label: "Offline-first Sync",
    collapsible: true,
    collapsed: false,
    items: [
      "tutorials/sync/getting-started",
      "tutorials/sync/handling-conflicts",
      "tutorials/sync/offline-first-patterns",
    ],
  },
];

const makeSharedDocsSidebar = (apiFamilies) => [
  {
    type: "category",
    label: "QF",
    collapsible: false,
    collapsed: false,
    items: [
      {
        type: "doc",
        id: "tutorials/oidc/user-apis-quickstart",
        label: "User APIs Quickstart",
      },
      {
        type: "doc",
        id: "quickstart/index",
        label: "Content APIs Quickstart",
      },
      {
        type: "category",
        label: "API",
        collapsible: true,
        collapsed: false,
        items: [
          ...apiFamilies.map(makeSharedApiFamilyCategory),
          {
            type: "doc",
            id: "api/field-reference",
            label: "Field Reference",
          },
          {
            type: "doc",
            id: "user_related_apis_versioned/scopes",
            label: "OAuth2 Scopes",
          },
        ],
      },
      {
        type: "category",
        label: "SDKs",
        link: {
          type: "doc",
          id: "sdk/index",
        },
        collapsible: true,
        collapsed: false,
        items: buildSdkSidebarItems(),
      },
      {
        type: "doc",
        id: "updates/index",
        label: "Updates",
      },
      {
        type: "category",
        label: "Tutorials",
        collapsible: true,
        collapsed: false,
        items: buildTutorialsSidebarItems(),
      },
    ],
  },
];

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  gettingStartedSidebar: [
    {
      type: "doc",
      id: "quickstart/index",
      label: "Content APIs Quickstart",
    },
  ],

  updatesSidebar: [
    {
      type: "doc",
      id: "updates/index",
      label: "API Updates",
    },
  ],

  scopesSidebar: [
    {
      type: "doc",
      label: "OAuth2 Scopes",
      id: "user_related_apis_versioned/scopes",
    },
  ],

  tutorialsSidebar: [
    ...buildTutorialsSidebarItems(),
  ],

  APIsSidebar: makeSharedDocsSidebar(latestApiFamilies),
  APIsVersionedSidebar: makeSharedDocsSidebar(versionedApiFamilies),

  "content-apis": makeApiFamilySidebar(contentApisLatestConfig),
  "content-apis-4.0.0": makeApiFamilySidebar(contentApisVersionedConfig),
  "user-related-apis": makeApiFamilySidebar(userRelatedApisLatestConfig),
  "user-related-apis-1.0.0": makeApiFamilySidebar(
    userRelatedApisVersionedConfig,
  ),
  "user-related-apis-pre-live": [
    {
      type: "category",
      label: "User-related APIs (Pre-live)",
      link: {
        type: "generated-index",
        title: "User-related APIs (Pre-live)",
        description: "User-related APIs from the pre-live branch.",
        slug: "/category/user-related-apis-pre-live",
      },
      items: buildUserRelatedApisPreLiveItems(),
    },
  ],
  oauth2_apis: makeApiFamilySidebar(oauth2ApisLatestConfig),
  "oauth2_apis-1.0.0": makeApiFamilySidebar(oauth2ApisVersionedConfig),
  search_apis: makeApiFamilySidebar(searchApisLatestConfig),
  "search_apis-1.0.0": makeApiFamilySidebar(searchApisVersionedConfig),

  apiSidebar: latestApiFamilies.map(makeSharedApiFamilyCategory),
  apiVersionedSidebar: versionedApiFamilies.map(makeSharedApiFamilyCategory),
};

module.exports = sidebars;
