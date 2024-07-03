// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Quran Foundation's Documentation Portal",
  tagline: 'Build Quran-related apps in no time!',
  // Set the production url of your site here
  url: 'https://api-docs.quran.foundation',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          docLayoutComponent: "@theme/DocPage",
          docItemComponent: "@theme/ApiItem", // Derived from docusaurus-theme-openapi
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          changefreq: 'monthly',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
        gtag: {
          trackingID: 'G-8986R74P88',
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
          quranreflect_versioned: {
            specPath: "openAPI/quranreflect/v1.json",
            outputDir: "docs/quranreflect_versioned", // No trailing slash
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            version: "1.0.0", // Current version
            label: "v1.0.0", // Current version label
            baseUrl: "/docs/quranreflect_versioned/1.0.0", // Leading slash is important
            versions: {
              "1.0.0": {
                specPath: "openAPI/quranreflect/v1.json",
                outputDir: "docs/quranreflect_versioned/1.0.0", // No trailing slash
                label: "v1.0.0",
                baseUrl: "/docs/quranreflect_versioned/1.0.0/quranreflect-v-1-api", // Leading slash is important
              },
            },
          },
          auth_versioned: {
            specPath: "openAPI/auth/v1.json",
            outputDir: "docs/auth_versioned", // No trailing slash
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            version: "1.0.0", // Current version
            label: "v1.0.0", // Current version label
            baseUrl: "/docs/auth_versioned/1.0.0", // Leading slash is important
            versions: {
              "1.0.0": {
                specPath: "openAPI/auth/v1.json",
                outputDir: "docs/auth_versioned/1.0.0", // No trailing slash
                label: "v1.0.0",
                baseUrl: "/docs/auth_versioned/1.0.0/quran-com-auth-v-1-api", // Leading slash is important
              },
            },
          },
          'quran.com_versioned': {
            specPath: "openAPI/quran.com/v4.json",
            outputDir: "docs/quran.com_versioned", // No trailing slash
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
            version: "4.0.0", // Current version
            label: "v4.0.0", // Current version label
            baseUrl: "/docs/quran.com_versioned/4.0.0", // Leading slash is important
            versions: {
              "4.0.0": {
                specPath: "openAPI/quran.com/v4.json",
                outputDir: "docs/quran.com_versioned/4.0.0", // No trailing slash
                label: "v4.0.0",
                baseUrl: "/docs/quran.com_versioned/4.0.0/quran-com-api", // Leading slash is important
              },
            },
          },
        },
      },
    ],
  ],

  themes: ["docusaurus-theme-openapi-docs"],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        appId: '9C4DXYS7OF',
        apiKey: '261759ead04074b931793780067f2c24',
        indexName: 'api-quran',
        contextualSearch: true,
        searchPagePath: 'search',
      },
      metadata: [
        {
          name: 'keywords',
          content: 'quran API, quran foundation APIs, Muslim developer, Muslim Apps, Quran app'
        }
      ],
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true
        },
      },
      // Replace with your project's social card
      // image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Quran Foundation API Docs',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialsSidebar',
            position: 'left',
            label: 'Tutorials',
          },
          {
            sidebarId: 'APIsSidebar',
            type: "dropdown",
            label: "APIs",
            position: "left",
            items: [
              {
                label: "Quran.Foundation Content APIs",
                to: "docs/category/quran.foundation-content-api",
              },
              {
                label: "User-context APIs",
                to: "docs/category/auth-api",
              },
              {
                label: "QuranReflect APIs",
                to: "docs/category/quranreflect-api",
              },
            ],
          },
          {
            href: 'https://github.com/quran',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'API Docs',
            items: [
              {
                label: 'Quran.foundation',
                to: '/docs/category/quran.foundation-content-api',
              },
              {
                label: 'Auth',
                to: 'docs/category/auth-api',
              },
              {
                label: 'QuranReflect',
                to: 'docs/category/quranreflect-api',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/SpEeJ5bWEQ',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Donate',
                to: 'https://donate.quran.foundation',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/quran',
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
