// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "QuranFoundation API Documentation Portal",
  tagline: "Build Quran-related apps in no time!",
  // Set the production url of your site here
  url: "https://api-docs.quran.foundation",
  baseUrl: "/",
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
        },
        gtag: {
          trackingID: "G-8986R74P88",
          anonymizeIP: true,
        },
      }),
    ],
  ],

  plugins: [
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
                baseUrl: "/docs/oauth2_apis_versioned/1.0.0/oauth2_apis", // Leading slash is important
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
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      // Replace with your project's social card
      // image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: "QuranFoundation API Docs portal",
        items: [
          {
            type: "doc",
            docId: "quickstart/index", // Points to your /docs/quickstart/index.md
            position: "left",
            label: "🚀 Quick Start",
          },
          {
            type: "doc",
            docId: "updates/index",
            position: "left",
            label: "📢 Updates",
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
            type: "doc",
            docId: "sdk/index",
            position: "left",
            label: "SDK",
          },
          {
            sidebarId: "APIsSidebar",
            type: "dropdown",
            label: "APIs",
            position: "left",
            items: [
              {
                label: "Content APIs",
                to: "docs/category/content-apis",
              },
              {
                label: "SDK Docs",
                to: "docs/sdk",
              },
              {
                label: "User-related APIs",
                to: "docs/category/user-related-apis",
              },
              {
                label: "OAuth2 APIs",
                to: "docs/category/oauth2_apis",
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
                to: "/docs/category/content-apis",
              },
              {
                label: "SDK Docs",
                to: "/docs/sdk",
              },
              {
                label: "User-related APIs",
                to: "docs/category/user-related-apis",
              },
              {
                label: "OAuth2 APIs",
                to: "docs/category/oauth2_apis",
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
                label: "Updates",
                to: "/docs/updates",
              },
              {
                label: "GitHub",
                href: "https://github.com/quran",
              },
            ],
          },
          {
            title: "Legal",
            items: [
              {
                label: "Developer Terms of Service",
                to: "/legal/developer-terms",
              },
              {
                label: "Developer Privacy Policy Requirements",
                to: "/legal/developer-privacy",
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

