// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Quran Foundation API Docs',
  tagline: 'Documentation Portal for QuranFoundation',
  // Set the production url of your site here
  url: 'https://api-docs.quran.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
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
        },
      },
    ],
  ],

  themes: ["docusaurus-theme-openapi-docs"],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {name: 'keywords', content: 'quran API, quran foundation APIs'}
      ],
      docs: {
        sidebar: {
          hideable: true,
        },
      },
      // Replace with your project's social card
      // image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Quran Foundation API Docs',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
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
                label: "QuranReflect",
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
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
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
                to: 'https://donate.quran.com',
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
        // TODO: here
        // additionalLanguages: ["ruby", "csharp", "php", "java", "powershell"],
        // languageTabs: [
        //   {
        //     highlight: "bash",
        //     language: "curl",
        //     logoClass: "bash",
        //   },
        //   {
        //     highlight: "python",
        //     language: "python",
        //     logoClass: "python",
        //     variant: "requests",
        //   },
        //   {
        //     highlight: "go",
        //     language: "go",
        //     logoClass: "go",
        //   },
        //   {
        //     highlight: "javascript",
        //     language: "nodejs",
        //     logoClass: "nodejs",
        //     variant: "axios",
        //   },
        //   {
        //     highlight: "ruby",
        //     language: "ruby",
        //     logoClass: "ruby",
        //   },
        //   {
        //     highlight: "csharp",
        //     language: "csharp",
        //     logoClass: "csharp",
        //     variant: "httpclient",
        //   },
        //   {
        //     highlight: "php",
        //     language: "php",
        //     logoClass: "php",
        //   },
        //   {
        //     highlight: "java",
        //     language: "java",
        //     logoClass: "java",
        //     variant: "unirest",
        //   },
        //   {
        //     highlight: "powershell",
        //     language: "powershell",
        //     logoClass: "powershell",
        //   },
        // ],
      },
    }),
};

module.exports = config;
