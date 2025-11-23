import { GridPattern } from '../../components/magicui/GridPattern';

export function StaticHeroBackground() {
  return (
    <>
      {/* Static gradient overlay - no client-side JavaScript needed */}
      <div className="absolute inset-0 top-[-64px] bg-linear-to-b from-transparent to-purple-900/10" />

      {/* Grid pattern - simplified and static */}
      <GridPattern
        width={80}
        height={80}
        className="z-0 fill-transparent stroke-primary/10"
        strokeDasharray="6 6"
      />
    </>
  );
}
