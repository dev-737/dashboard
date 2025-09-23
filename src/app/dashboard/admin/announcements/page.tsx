'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Plus, Trash } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useTRPC } from '@/utils/trpc';

export default function AnnouncementsPage() {
  const trpc = useTRPC();
  const titleId = useId();
  const contentId = useId();
  const thumbnailId = useId();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch announcements
  const { data: announcements = [], isLoading: isLoadingAnnouncements } =
    useQuery(trpc.announcement.getAllForAdmin.queryOptions());

  // Create announcement mutation
  const createMutation = useMutation(
    trpc.announcement.create.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Announcement created',
          description: 'Your announcement has been published',
        });

        // Reset form
        setTitle('');
        setContent('');
        setThumbnailUrl('');

        // Invalidate and refetch announcements
        queryClient.invalidateQueries(
          trpc.announcement.getAllForAdmin.pathFilter()
        );
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    })
  );

  // Delete announcement mutation
  const deleteMutation = useMutation(
    trpc.announcement.delete.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Announcement deleted',
          description: 'The announcement has been removed',
        });

        // Invalidate and refetch announcements
        queryClient.invalidateQueries(
          trpc.announcement.getAllForAdmin.pathFilter()
        );
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    })
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        title,
        content,
        thumbnailUrl: thumbnailUrl || undefined,
      });
    } catch {
      // Error handling is done in the mutation's onError callback
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
    } catch {
      // Error handling is done in the mutation's onError callback
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl tracking-tight">Announcements</h1>
      </div>

      <div className="mb-4 rounded-lg border border-indigo-500/30 bg-indigo-900/20 p-4">
        <p className="text-indigo-300">
          <strong>Note:</strong> Only the developer can create and manage
          announcements.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-gray-800 bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={titleId}>Title</Label>
                <Input
                  id={titleId}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title"
                  required
                  className="border-gray-700 bg-gray-800/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={contentId}>Content</Label>
                <Textarea
                  id={contentId}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Announcement content"
                  required
                  className="min-h-32 border-gray-700 bg-gray-800/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={thumbnailId}>Thumbnail URL (optional)</Label>
                <Input
                  id={thumbnailId}
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="border-gray-700 bg-gray-800/50"
                />
              </div>

              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full border-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-600/80 hover:to-purple-600/80"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Announcement
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingAnnouncements ? (
                <div className="py-8 text-center">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-indigo-500" />
                  <p className="text-gray-400">Loading announcements...</p>
                </div>
              ) : announcements.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-400">No announcements yet</p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-md border border-gray-800 bg-gray-900/50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-white">
                        {announcement.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(announcement.id)}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-1 line-clamp-2 text-gray-300 text-sm">
                      {announcement.content}
                    </p>
                    <p className="mt-2 text-gray-400 text-xs">
                      {formatDistanceToNow(new Date(announcement.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
