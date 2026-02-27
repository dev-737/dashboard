import { InterChatSpinner } from '@/components/ui/InterChatSpinner';
import { ShimmeringText } from '@/components/ui/shimmering-text';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-main">
      <div className="flex flex-col items-center gap-4">
        <InterChatSpinner size={128} />
        <ShimmeringText text="Loading..." duration={2} />
      </div>
    </div>
  );
}
