import { ImageResponse } from 'next/og';
import { getGiftCodeStatus } from '@/app/premium/actions';

export const runtime = 'nodejs';
export const alt = 'InterChat Premium Gift';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

function formatTierName(tier: string): string {
  return `Inter${tier.charAt(0)}${tier.slice(1).toLowerCase()}`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: codeId } = await params;

  let giftStatus:
    | { status: 'valid'; tier: string; isFree: boolean }
    | { status: 'claimed' }
    | { status: 'not_found' };
  try {
    giftStatus = await getGiftCodeStatus(codeId);
  } catch {
    giftStatus = { status: 'not_found' };
  }

  const isValid = giftStatus.status === 'valid';
  const tierName =
    giftStatus.status === 'valid' ? formatTierName(giftStatus.tier) : 'Premium';
  const isFree = giftStatus.status === 'valid' && giftStatus.isFree;

  const accentColor = isValid ? '#7B61FF' : '#ef4444';
  const bgColor = isValid ? '#0a0e1a' : '#1a0a0a';

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        position: 'relative',
      }}
    >
      {/* Content card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
          borderRadius: '32px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Gift icon container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            backgroundColor: isValid
              ? 'rgba(123, 97, 255, 0.2)'
              : 'rgba(239, 68, 68, 0.2)',
            marginBottom: '32px',
          }}
        >
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: SVG in OG image doesn't need title for accessibility */}
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 12v10H4V12" />
            <path d="M2 7h20v5H2z" />
            <path d="M12 22V7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        </div>

        {/* Status text */}
        <div
          style={{
            display: 'flex',
            fontSize: '28px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '16px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          {isValid
            ? "You've received a gift!"
            : giftStatus.status === 'claimed'
              ? 'Already Claimed'
              : 'Gift Not Found'}
        </div>

        {/* Tier name */}
        {isValid && (
          <div
            style={{
              display: 'flex',
              fontSize: '72px',
              fontWeight: 'bold',
              color: accentColor,
              marginBottom: '24px',
            }}
          >
            {tierName}
          </div>
        )}

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center',
          }}
        >
          {isValid
            ? isFree
              ? 'Claim your free premium subscription'
              : 'Claim your discounted premium subscription'
            : 'This gift code is no longer available'}
        </div>
      </div>

      {/* InterChat branding */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '20px',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
          }}
        />
        <span>InterChat</span>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
