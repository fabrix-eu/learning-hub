import type { ReactNode } from 'react';

const TONES = {
  // slate on slate-soft is 3.3:1 — the label is the content here, so it takes ink2.
  neutral: 'bg-slate-soft text-ink2',
  outline: 'border border-line2 text-ink2 bg-card',
  violet: 'bg-violet-soft text-violet-ink',
} as const;

export function Chip({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: keyof typeof TONES | string;
  className?: string;
}) {
  const style = tone in TONES ? TONES[tone as keyof typeof TONES] : tone;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-fx-sm px-3 py-1.5 text-[12.5px] leading-none font-bold whitespace-nowrap ${style} ${className}`}
    >
      {children}
    </span>
  );
}
