'use client';

import { Info, ScrollText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';
import RulesSection from './RulesSection';

export default function MainContent({ hub }: { hub: SimplifiedHub }) {
  const { description } = hub;

  return (
    <div className="space-y-6 lg:col-span-2">
      <Tabs defaultValue="about" className="w-full">
        <div className="no-scrollbar relative mb-4 overflow-x-auto">
          <TabsList className="w-full min-w-max border border-gray-800 bg-gray-900/50">
            <TabsTrigger
              value="about"
              className="shrink-0 px-3 py-2 text-xs data-[state=active]:bg-gray-800 sm:px-4 sm:text-sm"
            >
              <Info className="mr-1 h-3 w-3 shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="truncate">About</span>
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="shrink-0 px-3 py-2 text-xs data-[state=active]:bg-gray-800 sm:px-4 sm:text-sm"
            >
              <ScrollText className="mr-1 h-3 w-3 shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="truncate">Rules</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="about" className="mt-6">
          <Card className="border-gray-800 bg-[#0f1117]">
            <div className="p-6">
              <h3 className="mb-4 font-semibold text-xl">About this hub</h3>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {description}
                </ReactMarkdown>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <RulesSection hub={hub} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
