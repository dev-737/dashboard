'use client';

import { ScrollText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';

export default function RulesSection({ hub }: { hub: SimplifiedHub }) {
  return (
    <Card className="overflow-hidden rounded-xl border-fd-border bg-fd-card shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-900">
      <div className="p-8">
        <div className="prose dark:prose-invert mb-8 max-w-none">
          <h2 className="mb-4 flex items-center gap-2 border-fd-border border-b pb-3 font-semibold text-2xl">
            <ScrollText className="h-6 w-6 text-primary" />
            Hub Rules
          </h2>

          {hub.rules && hub.rules.length > 0 ? (
            <div className="divide-y divide-fd-border">
              {hub.rules.map((rule, index) => (
                <div
                  key={`rule-${rule.slice(0, 20)}-${index + 1}`}
                  className="flex gap-4 py-3 transition-colors hover:bg-primary/5"
                >
                  <span className="w-6 flex-shrink-0 text-right font-medium text-primary">
                    {index + 1}.
                  </span>
                  <div className="text-gray-600 text-sm dark:text-gray-300">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Disable block-level elements
                        h1: 'span',
                        h2: 'span',
                        h3: 'span',
                        h4: 'span',
                        h5: 'span',
                        h6: 'span',
                        // Convert paragraphs to spans with line break preservation
                        p: ({ children }) => (
                          <span className="whitespace-pre-wrap">
                            {children}
                          </span>
                        ),
                        // Style inline elements
                        strong: ({ children }) => (
                          <strong className="font-bold">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        u: ({ children }) => (
                          <u className="underline">{children}</u>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-primary/10 px-1 py-0.5">
                            {children}
                          </code>
                        ),
                        // Disable block elements we don't want
                        pre: 'span',
                        // Make links open in new tab
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary transition-colors hover:text-primary/90"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {rule}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 text-sm dark:text-gray-400">
              <ScrollText className="h-4 w-4" />
              No specific rules have been set for this hub yet.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
