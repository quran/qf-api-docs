// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const enableGtag = process.env.NODE_ENV === "production";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Quran Foundation Documentation Portal",
  tagline: "Our API documentation is clear, concise, easy to understand and will help you create innovative and engaging Quran-related apps.",
  // Set the production url of your site here
  url: "https://api-docs.quran.foundation",
  baseUrl: "/",
  trailingSlash: true,
  // Load a tiny client script to suppress noisy ResizeObserver errors in dev
  scripts: [
    { src: "/js/ignore-resizeobserver-error.js", async: true },
  ],
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  markdown: {
    mermaid: true,
  },
  customFields: {
    scopeRequestApiBaseUrl:
      process.env.SCOPE_REQUEST_API_BASE_URL || "https://qf-form-handler.fly.dev",
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          docLayoutComponent: "@theme/DocPage",
          docItemComponent: "@theme/ApiItem", // Derived from docusaurus-theme-openapi
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        sitemap: {
          changefreq: "monthly",
          priority: 0.5,
          filename: "sitemap.xml",
          ignorePatterns: ["/search", "/request-scopes"],
        },
        ...(enableGtag
          ? {
              gtag: {
                trackingID: "G-8986R74P88",
                anonymizeIP: true,
              },
            }
          : {}),
      }),
    ],
  ],

  plugins: [
    "./plugins/llms-txt-plugin.js",
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "openapi",
        docsPluginId: "classic",
        config: {
          user_related_apis_versioned: {
            specPath: "openAPI/user-related-apis/v1.json",
            outputDir: "docs/user_related_apis_versioned", // No trailing slash
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            version: "1.0.0", // Current version
            label: "v1.0.0", // Current version label
            baseUrl: "/docs/user_related_apis_versioned/1.0.0", // Leading slash is important
            versions: {
              "1.0.0": {
                specPath: "openAPI/user-related-apis/v1.json",
                outputDir: "docs/user_related_apis_versioned/1.0.0", // No trailing slash
                label: "v1.0.0",
                baseUrl:
                  "/docs/user_related_apis_versioned/1.0.0/user-related-apis", // Leading slash is important
              },
            },
          },
          user_related_apis_prelive: {
            specPath: "openAPI/user-related-apis/pre-live/v1.json",
            outputDir: "docs/user_related_apis_prelive",
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
          },
          content_apis_versioned: {
            specPath: "openAPI/content/v4.json",
            outputDir: "docs/content_apis_versioned", // No trailing slash
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            version: "4.0.0", // Current version
            label: "v4.0.0", // Current version label
            baseUrl: "/docs/content_apis_versioned/4.0.0", // Leading slash is important
            versions: {
              "4.0.0": {
                specPath: "openAPI/content/v4.json",
                outputDir: "docs/content_apis_versioned/4.0.0", // No trailing slash
                label: "v4.0.0",
                baseUrl: "/docs/content_apis_versioned/4.0.0/content-apis", // Leading slash is important
              },
            },
          },
          oauth2_apis_versioned: {
            specPath: "openAPI/oauth2-apis/v1.json",
            outputDir: "docs/oauth2_apis_versioned", // No trailing slash
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            version: "1.0.0", // Current version
            label: "v1.0.0", // Current version label
            baseUrl: "/docs/oauth2_apis_versioned/1.0.0", // Leading slash is important
            versions: {
              "1.0.0": {
                specPath: "openAPI/oauth2-apis/v1.json",
                outputDir: "docs/oauth2_apis_versioned/1.0.0", // No trailing slash
                label: "v1.0.0",
                baseUrl: "/docs/oauth2_apis_versioned/1.0.0/oauth-2-apis", // Must match the generated intro doc slug
              },
            },
          },
          search_apis_versioned: {
            specPath: "openAPI/search/v1.json",
            outputDir: "docs/search_apis_versioned", // No trailing slash
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            version: "1.0.0", // Current version
            label: "v1.0.0", // Current version label
            baseUrl: "/docs/search_apis_versioned/1.0.0", // Leading slash is important
            versions: {
              "1.0.0": {
                specPath: "openAPI/search/v1.json",
                outputDir: "docs/search_apis_versioned/1.0.0", // No trailing slash
                label: "v1.0.0",
                baseUrl:
                  "/docs/search_apis_versioned/1.0.0/quran-foundation-search-api", // Must match the generated intro doc slug
              },
            },
          },
        },
      },
    ],
  ],

  themes: ["docusaurus-theme-openapi-docs", "@docusaurus/theme-mermaid"],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        appId: "9C4DXYS7OF",
        apiKey: "261759ead04074b931793780067f2c24",
        indexName: "api-quran",
        contextualSearch: true,
        searchPagePath: "search",
      },
      metadata: [
        {
          name: "keywords",
          content:
            "quran API, quran foundation APIs, Muslim developer, Muslim Apps, Quran app",
        },
      ],
      docs: {
        sidebar: {
          hideable: false,
          autoCollapseCategories: false,
        },
      },
      // Replace with your project's social card
      // image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: "Quran Foundation API Docs",
        items: [
          {
            type: "doc",
            docId: "developer-journey",
            position: "left",
            label: "Start Here",
          },
          {
            type: "doc",
            docId: "tutorials/oidc/user-apis-quickstart",
            position: "left",
            label: "User Quickstart",
          },
          {
            type: "doc",
            docId: "updates/index",
            position: "left",
            label: "Updates",
          },

          {
            type: "docSidebar",
            sidebarId: "tutorialsSidebar",
            position: "left",
            label: "Tutorials",
          },
          {
            to: "/docs/tutorials/faq",
            label: "FAQ",
            position: "left",
          },
          {
            type: "dropdown",
            label: "SDKs",
            position: "left",
            items: [
              {
                label: "Overview",
                to: "docs/sdk",
                activeBaseRegex: "^/docs/sdk/?$",
              },
              {
                label: "JavaScript SDK",
                to: "docs/sdk/javascript",
              },
            ],
          },
          {
            sidebarId: "APIsSidebar",
            type: "dropdown",
            label: "APIs",
            position: "left",
            items: [
              {
                label: "Content APIs",
                to: "/docs/content_apis_versioned/4.0.0/content-apis/",
              },
              {
                label: "Search APIs",
                to: "/docs/search_apis_versioned/1.0.0/quran-foundation-search-api/",
              },
              {
                label: "User-related APIs",
                to: "/docs/user_related_apis_versioned/1.0.0/user-related-apis/",
              },
              {
                label: "User-related APIs (Pre-live)",
                to: "docs/category/user-related-apis-pre-live",
              },
              {
                label: "OAuth2 APIs",
                to: "/docs/oauth2_apis_versioned/1.0.0/oauth-2-apis/",
              },
            ],
          },
          {
            type: "docSidebar",
            sidebarId: "scopesSidebar",
            position: "left",
            label: "OAuth2 Scopes",
          },
          {
            to: "/request-access",
            label: "Request Access",
            position: "right",
            className: "navbar__item--request-access",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "API Docs",
            items: [
              {
                label: "Content APIs",
                to: "/docs/content_apis_versioned/4.0.0/content-apis/",
              },
              {
                label: "OAuth2 / OIDC APIs",
                to: "/docs/oauth2_apis_versioned/1.0.0/oauth-2-apis/",
              },
              {
                label: "User-related APIs",
                to: "/docs/user_related_apis_versioned/1.0.0/user-related-apis/",
              },
              {
                label: "User-related APIs (Pre-live)",
                to: "/docs/category/user-related-apis-pre-live",
              },
              {
                label: "Search APIs",
                to: "/docs/search_apis_versioned/1.0.0/quran-foundation-search-api/",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.gg/SpEeJ5bWEQ",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Donate",
                to: "https://donate.quran.foundation",
              },
              {
                label: "GitHub",
                href: "https://github.com/quran",
              },
            ],
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
