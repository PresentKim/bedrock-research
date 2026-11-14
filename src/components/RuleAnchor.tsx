import React from 'react';
import useBrokenLinks from '@docusaurus/useBrokenLinks';

export default function RuleAnchor({ id, children }: { id: string; children?: React.ReactNode }): React.ReactElement {
  useBrokenLinks().collectAnchor(id);
  return (
    <span id={id} className="rule-anchor">
      {children}
    </span>
  );
}
