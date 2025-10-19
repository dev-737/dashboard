'use client';

import {
  AlertCircle,
  Check,
  Loader2,
  Plus,
  Save,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { TagSelector } from '@/components/features/hubs/TagSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useHubTagManagement, usePopularTags } from '@/hooks/use-tags';
import { cn } from '@/lib/utils';

interface HubTagManagementProps {
  hubId: string;
  currentTags: string[];
  onTagsUpdate?: (tags: string[]) => void;
  className?: string;
}

/**
 * Comprehensive Hub Tag Management Interface
 * Modern design with advanced tag management capabilities for hub administrators
 */
export function HubTagManagement({
  hubId,
  currentTags,
  onTagsUpdate,
  className,
}: HubTagManagementProps) {
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Hooks for tag data and mutations
  const { tags: popularTags, isLoading: isLoadingPopular } = usePopularTags(20);
  // Note: Suggestions disabled for now - would need hub name/description
  // const { tags: suggestedTags, isLoading: isLoadingSuggestions } = useTagSuggestions(hubName, hubDescription);
  const { addTagsMutation, removeTagsMutation } = useHubTagManagement();

  // Track changes
  useEffect(() => {
    const tagsChanged =
      JSON.stringify(selectedTags.sort()) !==
      JSON.stringify(currentTags.sort());
    setHasChanges(tagsChanged);
  }, [selectedTags, currentTags]);

  const handleTagsChange = (newTags: string[]) => {
    setSelectedTags(newTags);
  };

  const handleSaveTags = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      // Determine which tags to add and remove
      const tagsToAdd = selectedTags.filter(
        (tag) => !currentTags.includes(tag)
      );
      const tagsToRemove = currentTags.filter(
        (tag) => !selectedTags.includes(tag)
      );

      // Execute mutations
      if (tagsToRemove.length > 0) {
        await removeTagsMutation.mutateAsync({ hubId, tags: tagsToRemove });
      }

      if (tagsToAdd.length > 0) {
        await addTagsMutation.mutateAsync({ hubId, tags: tagsToAdd });
      }

      // Update parent component
      if (onTagsUpdate) {
        onTagsUpdate(selectedTags);
      }

      toast({
        title: 'Tags Updated',
        description: `Successfully updated hub tags. Added ${tagsToAdd.length}, removed ${tagsToRemove.length}.`,
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Error saving tags:', error);
      toast({
        title: 'Error',
        description: 'Failed to update hub tags. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTags = () => {
    setSelectedTags(currentTags);
    setHasChanges(false);
  };

  const addQuickTag = (tagName: string) => {
    if (!selectedTags.includes(tagName) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Tag Management</h3>
            <p className="text-gray-400 text-sm">
              Manage up to 5 tags to help users discover your hub
            </p>
          </div>
        </div>

        {/* Save/Reset Actions */}
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetTags}
              className="text-gray-400 hover:text-white"
            >
              Reset
            </Button>
          )}
          <Button
            onClick={handleSaveTags}
            disabled={!hasChanges || isSaving}
            className={cn(
              'transition-all duration-300',
              hasChanges
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-600'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : hasChanges ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Tag Management Interface */}
      <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5" />
            Add & Remove Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tag Selector */}
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            placeholder="Search for tags or create new ones..."
            maxTags={5}
            showPopular={true}
          />

          {/* Changes Preview */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-blue-300 text-sm">
                  Pending Changes
                </span>
              </div>
              <div className="space-y-2 text-sm">
                {selectedTags.filter((tag) => !currentTags.includes(tag))
                  .length > 0 && (
                  <div>
                    <span className="text-green-400">Adding: </span>
                    <span className="text-gray-300">
                      {selectedTags
                        .filter((tag) => !currentTags.includes(tag))
                        .join(', ')}
                    </span>
                  </div>
                )}
                {currentTags.filter((tag) => !selectedTags.includes(tag))
                  .length > 0 && (
                  <div>
                    <span className="text-red-400">Removing: </span>
                    <span className="text-gray-300">
                      {currentTags
                        .filter((tag) => !selectedTags.includes(tag))
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Quick Add Sections */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Popular Tags */}
        <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              Popular Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPopular ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {popularTags?.slice(0, 12).map((tag) => (
                  <Button
                    key={tag.name}
                    variant="outline"
                    size="sm"
                    onClick={() => addQuickTag(tag.name)}
                    disabled={
                      selectedTags.includes(tag.name) ||
                      selectedTags.length >= 5
                    }
                    className={cn(
                      'border-gray-600 text-gray-300 text-xs transition-colors hover:bg-gray-700 hover:text-white',
                      selectedTags.includes(tag.name) &&
                        'border-blue-600/50 bg-blue-600/20 text-blue-300'
                    )}
                  >
                    {selectedTags.includes(tag.name) ? (
                      <Check className="mr-1 h-3 w-3" />
                    ) : (
                      <Plus className="mr-1 h-3 w-3" />
                    )}
                    {tag.name}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Tags */}
        <Card className="border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Suggested for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="py-4 text-gray-500 text-sm">
              Tag suggestions will be available in a future update
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Help Text */}
      <div className="rounded-lg border border-gray-700/30 bg-gray-800/20 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
          <div className="space-y-1 text-gray-400 text-sm">
            <p>
              <strong className="text-gray-300">Tag Guidelines:</strong>
            </p>
            <ul className="ml-2 list-inside list-disc space-y-1">
              <li>Use up to 5 relevant tags to help users discover your hub</li>
              <li>
                Choose tags that accurately describe your hub&apos;s content and
                community
              </li>
              <li>
                Popular tags can increase your hub&apos;s visibility in search
                results
              </li>
              <li>
                You can create custom tags if existing ones don&apos;t fit your
                hub
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
