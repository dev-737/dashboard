import { GraduationScrollIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type React from 'react';
import ReactMarkdown from 'react-markdown';

interface HubRulesProps {
  rules: string[] | null;
}

const HubRules: React.FC<HubRulesProps> = ({ rules }) => {
  return (
    <>
      {rules?.length ? (
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <div
              key={`rule-${rule.slice(0, 20)}-${index + 1}`}
              className="flex items-start gap-4 rounded-lg border border-gray-800/60 bg-gray-900/50 p-5 transition-colors duration-200 hover:bg-gray-800/30"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-primary to-primary-alt font-semibold text-sm text-white shadow-sm">
                {index + 1}
              </div>
              <div className="prose prose-sm prose-invert prose-p:my-0 max-w-none text-gray-300">
                <ReactMarkdown>{rule}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-10 text-gray-400">
          <HugeiconsIcon
            strokeWidth={2}
            icon={GraduationScrollIcon}
            className="mb-3 h-12 w-12 text-gray-500 opacity-50"
          />
          <p className="text-center text-gray-400">
            No rules specified for this hub.
          </p>
          <p className="mt-1 text-center text-gray-500 text-sm">
            Please follow Discord&apos;s community guidelines.
          </p>
        </div>
      )}
    </>
  );
};

export default HubRules;
