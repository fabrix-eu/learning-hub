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

/**
 * The soft-tinted icon chip that carries category identity across the hub.
 * `on` is for when the chip sits on a filled violet surface, where the accent
 * tint would disappear: it borrows the surface's own ink instead.
 */
export function CategoryIcon({
  icon,
  accent,
  size = 'md',
  on = false,
}: {
  icon: string | null;
  accent: Accent;
  size?: 'sm' | 'md';
  on?: boolean;
}) {
  const Icon = ICONS[(icon ?? 'star') as keyof typeof ICONS] ?? Star;
  const box = size === 'sm' ? 'size-8 rounded-fx-sm' : 'size-9 rounded-fx-sm';
  const tone = on ? 'bg-white/20 text-white' : ACCENT_CHIP[accent];
  return (
    <span className={`${box} ${tone} flex flex-none items-center justify-center`}>
      <Icon className={size === 'sm' ? 'size-4' : 'size-[18px]'} strokeWidth={2} />
    </span>
  );
}
