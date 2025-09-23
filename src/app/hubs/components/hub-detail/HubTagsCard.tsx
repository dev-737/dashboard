import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HubTagsCardProps {
  tags: string[];
  handleTagClick: (tag: string) => void;
}

export default function HubTagsCard({
  tags,
  handleTagClick,
}: HubTagsCardProps) {
  return (
    <>
      {/* Tags Section */}
      {tags.length > 0 && (
        <div className="overflow-hidden rounded-xl border-none bg-gray-300 text-card shadow-lg dark:bg-gray-900 dark:text-card-foreground">
          <div className="p-6">
            <h2 className="mb-3 flex items-center gap-2 border-fd-border border-b pb-2 font-semibold text-foreground text-xl">
              <Tag className="h-5 w-5 text-primary" />
              Tags
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer border-primary/20 bg-primary/20 text-primary transition-colors hover:bg-primary/20 dark:bg-primary/10"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
