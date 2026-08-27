import type { ReactNode } from 'react';

const TONES = {
  neutral: 'bg-slate-soft text-slate',
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
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] leading-none font-medium whitespace-nowrap ${style} ${className}`}
    >
      {children}
    </span>
  );
}
