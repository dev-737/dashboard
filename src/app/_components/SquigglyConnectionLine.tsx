import { motion } from 'motion/react';

interface SquigglyConnectionLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay?: number;
}

export function SquigglyConnectionLine({
  startX,
  startY,
  endX,
  endY,
  delay = 0,
}: SquigglyConnectionLineProps) {
  const dx = endX - startX;
  const dy = endY - startY;

  const controlPoint1X = startX + dx * 0.35;
  const controlPoint1Y = startY + dy * 0.15 - 3;
  const controlPoint2X = startX + dx * 0.65;
  const controlPoint2Y = endY - dy * 0.15 + 3;

  const path = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
  const pathId = `path-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ zIndex: 5 }}
    >
      <defs>
        <linearGradient
          id={`gradient-${pathId}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#9172d8" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#6b5fb8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
        </linearGradient>
        <filter id={`glow-${pathId}`}>
          <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <motion.path
        id={pathId}
        d={path}
        fill="none"
        stroke={`url(#gradient-${pathId})`}
        strokeWidth="0.7"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeDasharray="2 1"
        filter={`url(#glow-${pathId})`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 1, delay, ease: 'easeInOut' },
          opacity: { duration: 0.3, delay },
        }}
      />

      <motion.circle
        r="0.6"
        fill={`url(#gradient-${pathId})`}
        filter={`url(#glow-${pathId})`}
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 1, 0.8, 0],
        }}
        transition={{
          duration: 1,
          delay,
          ease: 'easeInOut',
        }}
      >
        <animateMotion dur="1s" begin={`${delay}s`} fill="freeze">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </motion.circle>
    </svg>
  );
}
