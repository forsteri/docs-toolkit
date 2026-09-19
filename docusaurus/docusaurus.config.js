import {themes as prismThemes} from 'prism-react-renderer';
import neutralMermaid from '../diagrams/themes/neutral.json' with {type: 'json'};

const {theme: neutralMermaidTheme, ...neutralMermaidOptions} = neutralMermaid;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'docs-toolkit',
  tagline: '書き方・見せ方・作り方を一か所にまとめたドキュメントツールキット',
  // GitHub Pages（https://forsteri.github.io/docs-toolkit/）で公開する前提。別の場所へ置く場合は url / baseUrl を変更する
  url: 'https://forsteri.github.io',
  baseUrl: '/docs-toolkit/',
  onBrokenLinks: 'throw',

  future: {
    v4: true,
  },

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
  ],
  stylesheets: [
    'https://fonts.googleapis.com/css2?family=BIZ+UDGothic:wght@400;700&family=JetBrains+Mono:wght@400;500;700&family=LINE+Seed+JP:wght@400;700&display=swap',
  ],

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  clientModules: ['./src/mermaid-icons.js'],

  plugins: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en', 'ja'],
        docsRouteBasePath: '/',
      },
    ],
  ],

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
          admonitions: {
            keywords: ['decision', 'pending', 'assumption'],
            extendDefaults: true,
          },
        },
        blog: false,
        pages: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'docs-toolkit',
      style: 'dark',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'ドキュメント',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `docs-toolkit v0.1.0 · ${new Date().getFullYear()}`,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['hcl'],
    },
    mermaid: {
      theme: {light: neutralMermaidTheme, dark: 'dark'},
      options: neutralMermaidOptions,
    },
  },
};

export default config;
