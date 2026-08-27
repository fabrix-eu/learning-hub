import { Factory, Map, Recycle, Star, TrendingUp, Users } from 'lucide-react';
import type { Accent } from '../lib/types';
import { ACCENT_CHIP } from '../lib/taxonomy';

const ICONS = {
  'trending-up': TrendingUp,
  recycle: Recycle,
  factory: Factory,
  users: Users,
  map: Map,
  star: Star,
} as const;

/** The soft-tinted icon chip that carries category identity across the hub. */
export function CategoryIcon({
  icon,
  accent,
  size = 'md',
}: {
  icon: string | null;
  accent: Accent;
  size?: 'sm' | 'md';
}) {
  const Icon = ICONS[(icon ?? 'star') as keyof typeof ICONS] ?? Star;
  const box = size === 'sm' ? 'size-8 rounded-lg' : 'size-9 rounded-[10px]';
  return (
    <span className={`${box} ${ACCENT_CHIP[accent]} flex flex-none items-center justify-center`}>
      <Icon className={size === 'sm' ? 'size-4' : 'size-[18px]'} strokeWidth={1.7} />
    </span>
  );
}
