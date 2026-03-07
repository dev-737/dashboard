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
  const giftStatus = await getGiftCodeStatus(codeId);

  const isValid = giftStatus.status === 'valid';
  const tierName = isValid ? formatTierName(giftStatus.tier) : 'Premium';
  const isFree = isValid && giftStatus.isFree;

  // Colors based on status
  const bgGradient = isValid
    ? 'linear-gradient(135deg, #0a0e1a 0%, #1a1040 50%, #0a0e1a 100%)'
    : 'linear-gradient(135deg, #1a0a0a 0%, #2a1010 50%, #1a0a0a 100%)';

  const accentColor = isValid ? '#7B61FF' : '#ef4444';

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: bgGradient,
        position: 'relative',
      }}
    >
      {/* Glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '-200px',
          left: '-100px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'rgba(123, 97, 255, 0.15)',
          filter: 'blur(100px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-200px',
          right: '-100px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'rgba(78, 86, 255, 0.15)',
          filter: 'blur(100px)',
        }}
      />

      {/* Content card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
          borderRadius: '32px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          boxShadow: '0 25px 50px -12px rgba(123, 97, 255, 0.25)',
        }}
      >
        {/* Gift icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}1a)`,
            marginBottom: '32px',
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Gift icon"
          >
            <title>Gift</title>
            <path d="M20 12v10H4V12" />
            <path d="M2 7h20v5H2z" />
            <path d="M12 22V7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        </div>

        {/* Title */}
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
              background: 'linear-gradient(90deg, #4E56FF, #7B61FF, #a78bff)',
              backgroundClip: 'text',
              color: 'transparent',
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
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="currentColor"
          role="img"
          aria-label="InterChat logo"
        >
          <title>InterChat</title>
          <circle cx="12" cy="12" r="10" />
        </svg>
        InterChat
      </div>
    </div>,
    {
      ...size,
    }
  );
}
