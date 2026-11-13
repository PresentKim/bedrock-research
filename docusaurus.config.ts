import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Bedrock 개발 위키',
  tagline: '마인크래프트 배드락 JSON UI, 애드온, Script API, 서버 종합 정리',
  favicon: 'img/favicon.ico',
  url: process.env.SITE_URL ?? 'https://example.invalid',
  baseUrl: process.env.BASE_URL ?? '/',
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',
  markdown: { hooks: { onBrokenMarkdownLinks: 'throw' } },
  i18n: { defaultLocale: 'ko', locales: ['ko'] },
  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        pages: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['ko', 'en'],
        docsRouteBasePath: '/',
        indexBlog: false,
      },
    ],
  ],
  themeConfig: {
    navbar: { title: 'Bedrock 개발 위키', items: [] },
    footer: { style: 'dark', copyright: '출처와 라이선스는 각 페이지 하단 표에 적는다.' },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['json', 'bash', 'diff', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
