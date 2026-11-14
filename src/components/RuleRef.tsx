import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from '@docusaurus/Link';

const GAP = 6;
const MARGIN = 8;
const CLOSE_DELAY = 150;

type Pos = { top: number; left: number; width: number; above: boolean };

const isTouch = () => window.matchMedia('(hover: none)').matches;

function RuleText({ text }: { text: string }): React.ReactElement {
  return <>{text.split('`').map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : part))}</>;
}

function place(anchor: HTMLElement): Pos {
  const r = anchor.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const width = Math.min(380, vw - MARGIN * 2);
  const left = Math.max(MARGIN, Math.min(r.left, vw - width - MARGIN));
  const above = r.bottom + 200 > window.innerHeight && r.top > 200;
  return { top: above ? r.top - GAP : r.bottom + GAP, left, width, above };
}

export default function RuleRef({ id, title, to }: { id: string; title: string; to: string }): React.ReactElement {
  const anchor = useRef<HTMLAnchorElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [pos, setPos] = useState<Pos | null>(null);

  const open = useCallback(() => {
    window.clearTimeout(timer.current);
    if (anchor.current) setPos(place(anchor.current));
  }, []);
  const close = useCallback(() => setPos(null), []);
  const closeSoon = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(close, CLOSE_DELAY);
  }, [close]);

  useEffect(() => {
    if (!pos) return undefined;
    const outside = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!anchor.current?.contains(t) && !pop.current?.contains(t)) close();
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', esc);
    window.addEventListener('scroll', close, { passive: true, capture: true });
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', esc);
      window.removeEventListener('scroll', close, { capture: true });
      window.removeEventListener('resize', close);
    };
  }, [pos, close]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const openOnHover = () => {
    if (!isTouch()) open();
  };

  const onClick = (e: React.MouseEvent) => {
    if (pos || !isTouch()) return;
    e.preventDefault();
    open();
  };

  return (
    <>
      <span onMouseEnter={openOnHover} onMouseLeave={closeSoon}>
        <Link
          ref={anchor}
          to={to}
          className="rule-ref"
          aria-describedby={pos ? `rule-pop-${id}` : undefined}
          onFocus={openOnHover}
          onBlur={closeSoon}
          onClick={onClick}
        >
          {id}
        </Link>
      </span>
      {pos &&
        createPortal(
          <div
            ref={pop}
            id={`rule-pop-${id}`}
            role="tooltip"
            className={`rule-pop${pos.above ? ' rule-pop--above' : ''}`}
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            onMouseEnter={open}
            onMouseLeave={closeSoon}
          >
            <Link to={to} className="rule-pop__id" onClick={close}>
              {id}
            </Link>
            <div className="rule-pop__title">
              <RuleText text={title} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
