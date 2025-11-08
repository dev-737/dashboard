'use client';

import {
  Copy,
  ImageIcon,
  Info,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  type MessageWithAuthor,
  useInfiniteMessages,
} from '@/hooks/use-infinite-messages';
import { useMessageById } from '@/hooks/use-message-by-id';
import { useMessageSearch } from '@/hooks/use-message-search';
import { cn } from '@/lib/utils';

// Utility function for relative time formatting
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);

  // Reset time to midnight for date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );

  const timeStr = messageDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (messageDay.getTime() === today.getTime()) {
    return `Today at ${timeStr}`;
  }
  if (messageDay.getTime() === yesterday.getTime()) {
    return `Yesterday at ${timeStr}`;
  }

  // Format as MM/DD/YYYY, HH:MM AM/PM
  const dateStr = messageDate.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
  return `${dateStr}, ${timeStr}`;
}

// Skeleton loader for messages
function MessageSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map((key) => (
        <div
          key={key}
          className="rounded-xl border border-gray-700/30 bg-gray-800/20 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-gray-700/50" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 rounded bg-gray-700/50" />
                <div className="h-3 w-20 rounded bg-gray-700/30" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded bg-gray-700/30" />
                <div className="h-3 w-3/4 rounded bg-gray-700/30" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-lg">
        <MessageSquare className="h-10 w-10 text-gray-500" />
      </div>
      <h3 className="mb-2 font-semibold text-gray-300 text-lg">
        No messages yet
      </h3>
      <p className="max-w-sm text-gray-500 text-sm">
        Messages from this hub will appear here once users start chatting
      </p>
    </motion.div>
  );
}

export const MessagesClient = () => {
  const params = useParams();
  const hubId = params.hubId as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'content' | 'author' | 'server'>(
    'content'
  );
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const _messageRefs = useRef<Record<string, HTMLElement>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<MessageWithAuthor | null>(
    null
  );
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteMessages(
    hubId,
    50 // Fetch 50 messages per page (reduced from 100)
  );
  const { messages: searchData, isLoading: isSearchLoading } = useMessageSearch(
    hubId,
    searchQuery,
    sortBy,
    isSearching
  );
  const { data: selectedMessageData } = useMessageById(selectedMessageId);

  // sentinelRef will be attached to a small element at the TOP of the list
  // to load older messages when scrolling up
  const { ref: sentinelRef, inView } = useInView({
    root: containerRef.current,
    rootMargin: '100px', // Reduced from 400px - only trigger when close to view
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isLoading, fetchNextPage]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const messages: MessageWithAuthor[] =
    data?.pages.flatMap(
      (page: { messages: MessageWithAuthor[] }) => page.messages
    ) ?? [];

  // Scroll to bottom on initial load only (not when new pages load)
  useEffect(() => {
    if (containerRef.current && messages.length > 0 && !selectedMessageId) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages.length, selectedMessageId]); // Only trigger on initial load

  // Handle jumping to selected message from search
  useEffect(() => {
    if (selectedMessageId && selectedMessageData && containerRef.current) {
      const message = selectedMessageData.message;

      // Find the message element
      const messageElement = containerRef.current.querySelector(
        `[data-message-id="${message.id}"]`
      );

      if (messageElement) {
        // Scroll to message
        messageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        // Add highlight
        messageElement.classList.add(
          'ring-2',
          'ring-purple-500/50',
          'bg-purple-500/20'
        );

        // Remove highlight after animation
        setTimeout(() => {
          messageElement.classList.remove(
            'ring-2',
            'ring-purple-500/50',
            'bg-purple-500/20'
          );
          // Clear the selected message so we can jump to it again if needed
          setSelectedMessageId(null);
        }, 2000);
      }
    }
  }, [selectedMessageData, selectedMessageId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Messages column */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-b from-gray-900/80 to-gray-900/50 shadow-xl backdrop-blur-sm"
          >
            {/* Header with gradient */}
            <div className="border-gray-700/50 border-b bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-xl">Messages</h2>
                    <p className="text-gray-400 text-sm">
                      View and moderate hub messages
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-indigo-500/10 px-3 py-1.5 font-medium text-indigo-400"
                >
                  {messages.length}{' '}
                  {messages.length === 1 ? 'message' : 'messages'}
                </Badge>
              </div>
            </div>

            {/* Messages list */}
            <div
              className="hub-sidebar-scrollbar max-h-[calc(100vh-20rem)] overflow-y-auto p-6"
              ref={containerRef}
            >
              {isLoading && <MessageSkeleton />}

              {messages.length === 0 && !isLoading && <EmptyState />}

              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {/* Sentinel at top to load older messages when scrolling up */}
                  {hasNextPage && (
                    <div ref={sentinelRef} className="flex justify-center py-2">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    </div>
                  )}

                  {messages.map((message: MessageWithAuthor, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      data-message-id={message.id}
                      className={cn(
                        'group relative rounded-xl border p-4 transition-all duration-200',
                        'border-gray-700/30 bg-gray-800/20',
                        'hover:border-indigo-500/30 hover:bg-gray-800/40 hover:shadow-indigo-500/5 hover:shadow-lg'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        {message.authorAvatar &&
                        !imageErrors.has(message.id) ? (
                          <Image
                            src={message.authorAvatar}
                            alt={message.authorUsername}
                            width={40}
                            height={40}
                            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-gray-700/50"
                            onError={() => {
                              setImageErrors((prev) =>
                                new Set(prev).add(message.id)
                              );
                            }}
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-semibold text-sm text-white ring-2 ring-gray-700/50">
                            {message.authorUsername.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-baseline gap-2">
                            <span className="font-semibold text-gray-200 text-sm">
                              {message.authorUsername}
                            </span>
                            {message.createdAt && (
                              <span className="text-gray-500 text-xs">
                                {formatRelativeTime(message.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap break-words text-gray-100 text-sm leading-relaxed">
                            {message.content}
                          </p>

                          {/* Image attachment */}
                          {message.imageUrl && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-3"
                            >
                              <div className="relative max-w-md overflow-hidden rounded-lg border border-gray-700/50 shadow-lg">
                                <Image
                                  src={message.imageUrl}
                                  alt="Message attachment"
                                  width={400}
                                  height={300}
                                  className="h-auto w-full object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLElement;
                                    target.style.display = 'none';
                                    const placeholder =
                                      target.nextElementSibling as HTMLElement;
                                    if (placeholder)
                                      placeholder.style.display = 'flex';
                                  }}
                                />
                                <div
                                  className="hidden items-center justify-center bg-gray-800/50 p-8 text-center"
                                  style={{ minHeight: '200px' }}
                                >
                                  <div>
                                    <ImageIcon className="mx-auto mb-2 h-12 w-12 text-gray-600" />
                                    <p className="text-gray-500 text-sm">
                                      Image failed to load
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Actions menu */}
                        <div className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 rounded-lg bg-gray-900/80 p-0 backdrop-blur-sm hover:bg-gray-800"
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="w-56 rounded-lg border border-gray-700/50 bg-gray-900/95 p-1 shadow-xl backdrop-blur-sm"
                              align="end"
                            >
                              <DropdownMenuItem
                                className="cursor-pointer rounded-md px-3 py-2 text-gray-300 text-sm transition-colors hover:bg-indigo-500/20 hover:text-white focus:bg-indigo-500/20 focus:text-white"
                                onSelect={() => {
                                  navigator.clipboard?.writeText(message.id);
                                  toast({
                                    title: 'Copied',
                                    description:
                                      'Message ID copied to clipboard',
                                  });
                                }}
                              >
                                <Copy className="mr-2 h-4 w-4 text-blue-400" />
                                <span>Copy Message ID</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-md px-3 py-2 text-gray-300 text-sm transition-colors hover:bg-indigo-500/20 hover:text-white focus:bg-indigo-500/20 focus:text-white"
                                onSelect={() => {
                                  setDialogMessage(message);
                                  setDialogOpen(true);
                                }}
                              >
                                <Info className="mr-2 h-4 w-4 text-indigo-400" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 bg-gray-700/50" />
                              <DropdownMenuItem
                                className="cursor-pointer rounded-md px-3 py-2 text-red-400 text-sm transition-colors hover:bg-red-500/20 hover:text-red-300 focus:bg-red-500/20 focus:text-red-300"
                                onSelect={() => {
                                  toast({
                                    title: 'Not implemented',
                                    description: 'Delete is not available',
                                  });
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                                <span>Delete Message</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-md px-3 py-2 text-sm text-yellow-400 transition-colors hover:bg-yellow-500/20 hover:text-yellow-300 focus:bg-yellow-500/20 focus:text-yellow-300"
                                onSelect={() => {
                                  router.push(
                                    `/dashboard/hubs/${hubId}/moderation?messageId=${message.id}`
                                  );
                                }}
                              >
                                <ShieldAlert className="mr-2 h-4 w-4 text-yellow-400" />
                                <span>Moderate Message</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Right sidebar - search */}
        <div className="w-full lg:w-80">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="sticky top-6"
          >
            <div className="overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-b from-gray-900/80 to-gray-900/50 shadow-xl backdrop-blur-sm">
              {/* Search Header */}
              <div className="border-gray-700/50 border-b bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-4">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-semibold text-white">Search Messages</h3>
                </div>
              </div>

              {/* Search Content */}
              <div className="p-4">
                {/* Search input */}
                <div className="relative mb-4">
                  <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      'w-full rounded-lg border py-2 pr-10 pl-9 text-sm transition-all',
                      'border-gray-700/50 bg-gray-800/50 text-white placeholder-gray-500',
                      'focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
                    )}
                  />
                  <AnimatePresence>
                    {searchQuery.length > 0 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute top-2 right-2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-white"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sort selector */}
                <div className="mb-4">
                  <label
                    htmlFor="messages-sort"
                    className="mb-2 block font-medium text-gray-400 text-xs uppercase tracking-wide"
                  >
                    Sort by
                  </label>
                  <select
                    id="messages-sort"
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as 'content' | 'author' | 'server'
                      )
                    }
                    className={cn(
                      'w-full rounded-lg border px-3 py-2 text-sm transition-all',
                      'border-gray-700/50 bg-gray-800/50 text-white',
                      'focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
                    )}
                  >
                    <option value="content">Content</option>
                    <option value="author">Author</option>
                    <option value="server">Server</option>
                  </select>
                </div>

                {/* Search Results */}
                <div className="hub-sidebar-scrollbar max-h-[calc(100vh-26rem)] space-y-2 overflow-y-auto">
                  {isSearchLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12"
                    >
                      <Loader2 className="mb-3 h-8 w-8 animate-spin text-indigo-500" />
                      <p className="text-gray-400 text-sm">Searching...</p>
                    </motion.div>
                  )}

                  {searchData?.length === 0 &&
                    !isSearchLoading &&
                    searchQuery.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                      >
                        <Search className="mb-3 h-12 w-12 text-gray-600" />
                        <p className="text-gray-500 text-sm">
                          No results found
                        </p>
                        <p className="mt-1 text-gray-600 text-xs">
                          Try a different search term
                        </p>
                      </motion.div>
                    )}

                  {searchData?.map((m: MessageWithAuthor) => (
                    <motion.button
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="button"
                      onClick={() => {
                        setSelectedMessageId(m.id);
                        setSearchQuery('');
                      }}
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition-all',
                        'border-transparent bg-gray-800/20',
                        'hover:border-indigo-500/30 hover:bg-gray-800/40'
                      )}
                    >
                      <div className="mb-1.5 font-medium text-gray-400 text-xs">
                        {m.authorUsername}
                      </div>
                      <div className="line-clamp-2 text-gray-100 text-sm leading-snug">
                        {m.content}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Message details dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/95 shadow-2xl backdrop-blur-xl">
          <DialogHeader className="border-gray-700/50 border-b bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 pb-4">
            <DialogTitle className="font-bold text-white text-xl">
              Message Details
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm">
              View detailed information about this message
            </DialogDescription>
          </DialogHeader>

          {dialogMessage ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-6"
            >
              {/* Message ID */}
              <div className="rounded-xl border border-gray-700/30 bg-gray-800/20 p-4 transition-colors hover:bg-gray-800/30">
                <div className="mb-2 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  Message ID
                </div>
                <div className="flex items-center justify-between gap-2">
                  <code className="break-all font-mono text-indigo-400 text-sm">
                    {dialogMessage.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(dialogMessage.id);
                      toast({
                        title: 'Copied',
                        description: 'Message ID copied to clipboard',
                      });
                    }}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Author and Date */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-700/30 bg-gray-800/20 p-4 transition-colors hover:bg-gray-800/30">
                  <div className="mb-2 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                    Author
                  </div>
                  <div className="flex items-center gap-2">
                    {dialogMessage.authorAvatar &&
                    !imageErrors.has(dialogMessage.id) ? (
                      <Image
                        src={dialogMessage.authorAvatar}
                        alt={dialogMessage.authorUsername}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-full object-cover ring-2 ring-gray-700/50"
                        onError={() => {
                          setImageErrors((prev) =>
                            new Set(prev).add(dialogMessage.id)
                          );
                        }}
                      />
                    ) : (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-semibold text-white text-xs ring-2 ring-gray-700/50">
                        {dialogMessage.authorUsername.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="font-medium text-sm text-white">
                      {dialogMessage.authorUsername}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-700/30 bg-gray-800/20 p-4 transition-colors hover:bg-gray-800/30">
                  <div className="mb-2 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                    Created
                  </div>
                  <div className="font-medium text-sm text-white">
                    {formatRelativeTime(dialogMessage.createdAt)}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="rounded-xl border border-gray-700/30 bg-gray-800/20 p-4">
                <div className="mb-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">
                  Content
                </div>
                <div className="whitespace-pre-wrap text-gray-100 text-sm leading-relaxed">
                  {dialogMessage.content}
                </div>

                {/* Image attachment */}
                {dialogMessage.imageUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4"
                  >
                    <div className="relative overflow-hidden rounded-lg border border-gray-700/50 shadow-lg">
                      <Image
                        src={dialogMessage.imageUrl}
                        alt="Message attachment"
                        width={600}
                        height={400}
                        className="h-auto w-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.display = 'none';
                          const placeholder =
                            target.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                      <div
                        className="hidden items-center justify-center bg-gray-800/50 p-12 text-center"
                        style={{ minHeight: '300px' }}
                      >
                        <div>
                          <ImageIcon className="mx-auto mb-3 h-16 w-16 text-gray-600" />
                          <p className="text-gray-500 text-sm">
                            Image failed to load
                          </p>
                          <p className="mt-1 text-gray-600 text-xs">
                            The image may have been deleted or is no longer
                            available
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              No message selected
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
