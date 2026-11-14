import React from 'react';
import Translate from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import addons from '@site/src/data/addons.json';

type Addon = { version: string; file: string; size: number; name: string; items: string[] };
const registry = addons as Record<string, Addon>;

export default function AddonDownload({ id }: { id: string }): React.ReactElement {
  const a = registry[id];
  if (!a) throw new Error(`AddonDownload: unknown add-on ${id}`);
  const href = useBaseUrl(`/downloads/${a.file}`);
  return (
    <div className="addon-download">
      <a className="button button--primary" href={href} download={a.file}>
        <Translate id="addon.download">다운로드</Translate>: {a.file}
      </a>
      <div className="addon-download__meta">
        {a.name} v{a.version} · {(a.size / 1024).toFixed(1)} KB ·{' '}
        <Translate id="addon.item">테스트 아이템</Translate> {a.items.map((it) => <code key={it}>{it}</code>)}
      </div>
    </div>
  );
}
