import React from 'react';
import sources from '@site/src/data/sources.json';

type Src = { title: string; url?: string; path?: string; license: string; commit?: string; author?: string };
const registry = sources as Record<string, Src>;

export default function Excerpt(props: {
  src: string;
  title?: string;
  path?: string;
  children?: React.ReactNode;
}): React.ReactElement {
  const s = registry[props.src];
  if (!s) throw new Error(`Excerpt: unknown source id ${props.src}`);
  return (
    <blockquote className="excerpt">
      <div className="excerpt__head">
        발췌: {s.url ? <a href={s.url}>{props.title ?? s.title}</a> : (props.title ?? s.title)}
        {props.path ? ` · ${props.path}` : ''} · {s.title} · 라이선스 {s.license}
        {s.commit ? ` · 커밋 ${s.commit}` : ''}
      </div>
      {props.children}
    </blockquote>
  );
}
