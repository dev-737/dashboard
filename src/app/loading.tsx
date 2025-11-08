import { InterChatSpinner } from '@/components/ui/InterChatSpinner';
import { ShimmeringText } from '@/components/ui/shadcn-io/shimmering-text';

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <InterChatSpinner size={128} />
                <p className="text-lg text-muted-foreground"></p>
                <ShimmeringText text='Loading...' duration={2} wave={false}/>
            </div>~
        </div>
    );
}
