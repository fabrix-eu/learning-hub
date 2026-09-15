import type { Partner } from '../lib/types';
import { BlurImage } from './BlurImage';

const BOX = {
  sm: 'h-12 w-32',
  lg: 'h-20 w-48',
};

/**
 * Seventeen European organisations, seventeen logo shapes — some very wide,
 * some square, some with their own white background. A fixed neutral box with
 * `object-contain` is what keeps a page of them from reading as a sticker
 * sheet. Renders nothing when the partner has no logo, which is still most.
 * The logo fades in; no blurred preview, which on a logo only reads as a smudge.
 */
export function PartnerLogo({ partner, size = 'sm' }: { partner: Partner; size?: keyof typeof BOX }) {
  if (!partner.logo) return null;

  return (
    <span className={`flex ${BOX[size]} flex-none items-center justify-center rounded-fx-sm border border-line bg-white p-1.5`}>
      <BlurImage
        id={partner.logo}
        transform={{ width: '400', height: '200', fit: 'inside', quality: '85' }}
        blur={false}
        alt={partner.name}
        frameClassName="flex h-full w-full items-center justify-center"
        className="max-h-full max-w-full object-contain"
      />
    </span>
  );
}
