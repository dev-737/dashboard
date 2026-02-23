import { GlobeIcon } from '@hugeicons/core-free-icons';
import Image from 'next/image';

interface InterChatSpinnerProps {
  size?: number;
}

export function InterChatSpinner({ size = 80 }: InterChatSpinnerProps) {
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/assets/images/logos/GlobeInside.svg"
          alt="InterChat GlobeIcon"
          width={size * 0.6}
          height={size * 0.6}
          className="select-none"
          priority
        />
      </div>

      <div className="absolute inset-0 flex animate-spin items-center justify-center">
        <Image
          src="/assets/images/logos/Ring.svg"
          alt="InterChat Ring"
          width={size}
          height={size}
          className="select-none"
          priority
        />
      </div>
    </div>
  );
}
