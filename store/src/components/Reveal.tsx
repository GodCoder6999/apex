import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

// Scroll-reveal wrapper (mirrors the design's [data-reveal] behaviour).
export function Reveal({ children, delay = 0, style, className = '' }: { children: ReactNode; delay?: number; style?: CSSProperties; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { setTimeout(() => el.classList.add('in'), delay); io.unobserve(el); } });
    }, { threshold: 0.06, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    const safe = setTimeout(() => el.classList.add('in'), 1300 + delay);
    return () => { io.disconnect(); clearTimeout(safe); };
  }, [delay]);
  return <div ref={ref} className={`reveal ${className}`} style={style}>{children}</div>;
}
