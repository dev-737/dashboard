'use client';

import {
  Calendar,
  Heart,
  Info,
  Search,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HubDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-200">
      {/* Header with Search Bar */}
      <header className="sticky top-0 z-40 w-full border-gray-800 border-b bg-gray-950/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center">
              <Skeleton className="h-5 w-32" />
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Banner Section */}
        <div className="relative h-[280px] w-full overflow-hidden md:h-[350px]">
          <Skeleton className="absolute inset-0" />
        </div>

        {/* Page Content */}
        <div className="container mx-auto max-w-7xl px-4 pb-16">
          {/* Header Card (Overlaps Banner) */}
          <div className="-mt-24 md:-mt-32 relative mb-12">
            <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-6 shadow-xl backdrop-blur-lg md:p-8">
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                {/* Hub Icon */}
                <Skeleton className="h-28 w-28 shrink-0 rounded-2xl md:h-36 md:w-36" />

                {/* Hub Info */}
                <div className="min-w-0 flex-1">
                  <Skeleton className="mb-4 h-10 w-3/4" />
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {/* Server Count */}
                    <Skeleton className="h-8 w-32 rounded-full" />
                    {/* Creation Date */}
                    <Skeleton className="h-8 w-40 rounded-full" />
                    {/* Tags */}
                    <Skeleton className="h-8 w-36 rounded-full" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex shrink-0 gap-3 self-start md:mt-0 md:self-center">
                  <Skeleton className="h-10 w-32 rounded-full" />
                  <Skeleton className="h-10 w-28 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid (Tabs/Reviews + Sidebar) */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column (Tabs and Reviews) */}
            <div className="space-y-8 lg:col-span-2">
              {/* Tabs Section */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-6 shadow-lg backdrop-blur-md md:p-8">
                {/* Tab List */}
                <div className="mb-6">
                  <Skeleton className="h-10 w-64 rounded-lg" />
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>

              {/* Review Section */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-6 shadow-lg backdrop-blur-md md:p-8">
                <div className="mb-6 flex items-center">
                  <div className="mr-3 rounded-lg border border-primary/30 bg-primary/10 p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <Skeleton className="h-8 w-48" />
                </div>

                {/* Review Form */}
                <div className="mb-8 rounded-lg border border-gray-800 bg-gray-800/30 p-4">
                  <Skeleton className="mb-4 h-6 w-40" />
                  <Skeleton className="mb-4 h-24 w-full rounded-md" />
                  <div className="flex justify-end">
                    <Skeleton className="h-10 w-24 rounded-md" />
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {Array(2)
                    .fill(0)
                    .map(() => (
                      <div
                        key={`review-${crypto.randomUUID()}`}
                        className="rounded-lg border border-gray-800 bg-gray-800/30 p-4"
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="mb-1 h-5 w-32" />
                            <div className="flex">
                              {Array(5)
                                .fill(0)
                                .map(() => (
                                  <Star
                                    key={`star-${crypto.randomUUID()}`}
                                    className="h-4 w-4 text-yellow-500"
                                  />
                                ))}
                            </div>
                          </div>
                        </div>
                        <Skeleton className="mb-2 h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6 lg:col-span-1">
              {/* Hub Details Card */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-6 shadow-lg backdrop-blur-md">
                <div className="mb-5 flex items-center">
                  <Info className="mr-2 h-5 w-5 text-primary" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-3">
                  {/* Created Date */}
                  <div className="flex items-center justify-between rounded-md border border-gray-700/50 bg-black/20 p-3">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-primary/80" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                  {/* Connected Servers */}
                  <div className="flex items-center justify-between rounded-md border border-gray-700/50 bg-black/20 p-3">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Users className="mr-2 h-4 w-4 text-primary/80" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                  {/* Upvotes */}
                  <div className="flex items-center justify-between rounded-md border border-gray-700/50 bg-black/20 p-3">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Heart className="mr-2 h-4 w-4 text-rose-500/80" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              </div>

              {/* Moderators Card */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-6 shadow-lg backdrop-blur-md">
                <div className="mb-5 flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-primary" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-3">
                  {Array(3)
                    .fill(0)
                    .map(() => (
                      <div
                        key={`moderator-${crypto.randomUUID()}`}
                        className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-gray-800/50"
                      >
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="mb-1 h-5 w-32" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
