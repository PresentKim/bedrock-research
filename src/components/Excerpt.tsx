import React from 'react';
import Translate from '@docusaurus/Translate';
import { useLocalizedSources } from '@site/src/components/sources';

export default function Excerpt(props: {
  src: string;
  title?: string;
  path?: string;
  children?: React.ReactNode;
}): React.ReactElement {
  const s = useLocalizedSources()(props.src);
  const title = props.title ?? s.title;
  return (
    <blockquote className="excerpt">
      <div className="excerpt__head">
        <Translate id="excerpt.label">발췌</Translate>: {s.url ? <a href={s.url}>{title}</a> : title}
        {props.path ? ` · ${props.path}` : ''} · {s.title} · <Translate id="excerpt.license">라이선스</Translate> {s.license}
        {s.commit ? <> · <Translate id="excerpt.commit">커밋</Translate> {s.commit}</> : ''}
      </div>
      {props.children}
    </blockquote>
  );
}
