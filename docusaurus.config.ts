import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'node:path';
import remarkDoubleTildeOnly from './src/plugins/remark-double-tilde-only.mjs';
import remarkRuleRefs from './src/plugins/remark-rule-refs.mjs';
import { loadRules } from './scripts/rules.mjs';

const isEn = process.env.DOCUSAURUS_CURRENT_LOCALE === 'en';

const ruleLocales = [
  path.resolve(__dirname, 'docs'),
  path.resolve(__dirname, 'i18n/en/docusaurus-plugin-content-docs/current'),
].map((root) => ({ root, rules: loadRules(root) }));

const config: Config = {
  title: isEn ? 'Bedrock Development Wiki' : 'Bedrock 개발 위키',
  tagline: isEn
    ? 'Minecraft Bedrock JSON UI, add-ons, Script API and servers in one place'
    : '마인크래프트 배드락 JSON UI, 애드온, Script API, 서버 종합 정리',
  favicon: 'img/favicon.ico',
  url: process.env.SITE_URL ?? 'https://example.invalid',
  baseUrl: process.env.BASE_URL ?? '/',
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',
  markdown: { hooks: { onBrokenMarkdownLinks: 'throw' } },
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    localeConfigs: { ko: { label: '한국어' }, en: { label: 'English' } },
  },
  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkDoubleTildeOnly, [remarkRuleRefs, { locales: ruleLocales }]],
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
    navbar: { title: 'Bedrock 개발 위키', items: [{ type: 'localeDropdown', position: 'right', className: 'navbar-locale' }] },
    footer: { style: 'dark', copyright: '출처와 라이선스는 각 페이지 하단 표에 적는다.' },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['json', 'bash', 'diff', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
