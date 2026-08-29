import { assetUrl } from '../lib/directus';
import type { Partner } from '../lib/types';

const BOX = {
  sm: 'h-12 w-32',
  lg: 'h-20 w-48',
};

/**
 * Seventeen European organisations, seventeen logo shapes — some very wide,
 * some square, some with their own white background. A fixed neutral box with
 * `object-contain` is what keeps a page of them from reading as a sticker
 * sheet. Renders nothing when the partner has no logo, which is still most.
 */
export function PartnerLogo({ partner, size = 'sm' }: { partner: Partner; size?: keyof typeof BOX }) {
  const src = assetUrl(partner.logo, { width: '400', height: '200', fit: 'inside', format: 'webp', quality: '85' });
  if (!src) return null;

  return (
    <span className={`flex ${BOX[size]} flex-none items-center justify-center rounded-fx-sm border border-line bg-white p-1.5`}>
      <img src={src} alt={partner.name} loading="lazy" className="max-h-full max-w-full object-contain" />
    </span>
  );
}
