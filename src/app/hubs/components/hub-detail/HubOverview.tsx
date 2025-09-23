import type React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface HubOverviewProps {
  description: string | null;
}

const HubOverview: React.FC<HubOverviewProps> = ({ description }) => {
  return (
    <div className="prose prose-invert max-w-none prose-img:rounded-lg prose-a:text-primary prose-headings:text-white prose-p:text-gray-300 prose-img:shadow-lg hover:prose-a:text-primary-alt">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
      >
        {description || 'No description provided.'}
      </ReactMarkdown>
    </div>
  );
};

export default HubOverview;
