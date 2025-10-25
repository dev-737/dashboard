import { InterChatSpinner } from '@/components/ui/InterChatSpinner';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <InterChatSpinner size={128} />
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
