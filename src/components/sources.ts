import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import sources from '@site/src/data/sources.json';

export type Src = {
  title: string;
  url?: string;
  path?: string;
  license: string;
  commit?: string;
  author?: string;
  accessed?: string;
  title_en?: string;
  license_en?: string;
  author_en?: string;
  commit_en?: string;
};

const registry = sources as Record<string, Src>;

export function localize(s: Src, locale: string): Src {
  if (locale !== 'en') return s;
  return {
    ...s,
    title: s.title_en ?? s.title,
    license: s.license_en ?? s.license,
    author: s.author_en ?? s.author,
    commit: s.commit_en ?? s.commit,
  };
}

export function useLocalizedSources(): (id: string) => Src {
  const { i18n } = useDocusaurusContext();
  return (id) => {
    const s = registry[id];
    if (!s) throw new Error(`unknown source id ${id}`);
    return localize(s, i18n.currentLocale);
  };
}
