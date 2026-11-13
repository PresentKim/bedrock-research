import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import type { WrapperProps } from '@docusaurus/types';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import sources from '@site/src/data/sources.json';

type Src = { title: string; url?: string; path?: string; license: string; commit?: string; author?: string; accessed?: string };
const registry = sources as Record<string, Src>;

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): React.ReactElement {
  const { frontMatter } = useDoc();
  const ids = ((frontMatter as { sources?: string[] }).sources ?? []) as string[];
  return (
    <>
      {ids.length > 0 && (
        <table className="sources-table">
          <caption>출처</caption>
          <thead>
            <tr><th>id</th><th>출처</th><th>라이선스</th><th>커밋</th><th>접근일</th></tr>
          </thead>
          <tbody>
            {ids.map((id) => {
              const s = registry[id];
              if (!s) throw new Error(`unknown source id ${id}`);
              return (
                <tr key={id}>
                  <td><code>{id}</code></td>
                  <td>{s.url ? <a href={s.url}>{s.title}</a> : `${s.title} (${s.path})`}</td>
                  <td>{s.license}</td>
                  <td>{s.commit ?? ''}</td>
                  <td>{s.accessed ?? ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <Footer {...props} />
    </>
  );
}
