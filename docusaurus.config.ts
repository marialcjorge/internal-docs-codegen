import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'CodeGen Docs',
  tagline: 'Documentação Completa do CodeGen',
  url: 'https://stack-spot.github.io',
  baseUrl: '/internal-docs-codegen/',

  favicon: 'img/favicon codegen.png',

  future: {
    v4: true,
  },

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          id: 'contributors',
          path: 'docs/contributors',
          routeBasePath: 'contributors',
          sidebarPath: require.resolve('./sidebars-contributors.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'users',
        path: 'docs/users',
        routeBasePath: 'users',
        sidebarPath: require.resolve('./sidebars-users.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'about',
        path: 'docs/about',
        routeBasePath: 'about',
        sidebarPath: require.resolve('./sidebars-about.js'),
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'CodeGen',
      logo: {
        alt: 'CodeGen Logo',
        src: 'img/logo codegen.png',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro/overview',
          docsPluginId: 'contributors',
          position: 'left',
          label: 'Para Contribuidores',
        },
        {
          type: 'doc',
          docId: 'getting-started', // ✅ users tem: getting-started, installation, faq, cli-commands
          docsPluginId: 'users',
          position: 'left',
          label: 'Para Usuários',
        },
        {
          type: 'doc',
          docId: 'project', // ✅ about tem: project, roadmap, team
          docsPluginId: 'about',
          position: 'left',
          label: 'Quem Somos',
        },
      ],
    },

    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Zup Labs`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;