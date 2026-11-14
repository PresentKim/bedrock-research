import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import type { WrapperProps } from '@docusaurus/types';
import Translate from '@docusaurus/Translate';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { useLocalizedSources } from '@site/src/components/sources';

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): React.ReactElement {
  const { frontMatter } = useDoc();
  const lookup = useLocalizedSources();
  const ids = ((frontMatter as { sources?: string[] }).sources ?? []) as string[];
  return (
    <>
      {ids.length > 0 && (
        <table className="sources-table">
          <caption><Translate id="sources.caption">출처</Translate></caption>
          <thead>
            <tr>
              <th>id</th>
              <th><Translate id="sources.source">출처</Translate></th>
              <th><Translate id="sources.license">라이선스</Translate></th>
              <th><Translate id="sources.commit">커밋</Translate></th>
              <th><Translate id="sources.accessed">접근일</Translate></th>
            </tr>
          </thead>
          <tbody>
            {ids.map((id) => {
              const s = lookup(id);
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
