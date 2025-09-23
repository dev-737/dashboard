'use client';

import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import type {
  BeginnerFriendlyError,
  ErrorSolution,
} from '@/lib/error-messages';
import { cn } from '@/lib/utils';

interface BeginnerFriendlyErrorProps {
  error: BeginnerFriendlyError;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
  compact?: boolean;
}

interface SolutionCardProps {
  solution: ErrorSolution;
  isExpanded: boolean;
  onToggle: () => void;
  onTryFix?: () => void;
}

function SolutionCard({
  solution,
  isExpanded,
  onToggle,
  onTryFix,
}: SolutionCardProps) {
  const difficultyColors = {
    easy: 'bg-green-500/10 text-green-400 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <Card className="border-gray-700/50 bg-gray-800/30">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer pb-3 transition-colors hover:bg-gray-700/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                <div>
                  <CardTitle className="font-medium text-sm text-white">
                    {solution.title}
                  </CardTitle>
                  <CardDescription className="mt-1 text-gray-400 text-xs">
                    {solution.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    difficultyColors[solution.difficulty]
                  )}
                >
                  {solution.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Clock className="h-3 w-3" />
                  {solution.estimatedTime}
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-900/50 p-3">
                <h4 className="mb-2 flex items-center gap-2 font-medium text-sm text-white">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Step-by-step solution:
                </h4>
                <ol className="space-y-2">
                  {solution.steps.map((step, index) => (
                    <li
                      key={`step-${step.slice(0, 30)}-${index + 1}`}
                      className="flex gap-3 text-gray-300 text-sm"
                    >
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 font-medium text-primary text-xs">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-2">
                {onTryFix && (
                  <Button onClick={onTryFix} size="sm" className="flex-1">
                    Try This Fix
                  </Button>
                )}
                {solution.helpLink && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link
                      href={solution.helpLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Learn More
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function BeginnerFriendlyErrorDisplay({
  error,
  onRetry,
  isRetrying = false,
  className,
  compact = false,
}: BeginnerFriendlyErrorProps) {
  const [expandedSolution, setExpandedSolution] = useState<string | null>(
    error.solutions.length > 0 ? error.solutions[0].id : null
  );
  const [showAllSolutions, setShowAllSolutions] = useState(false);

  const severityStyles = {
    info: 'border-blue-500/30 bg-blue-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    error: 'border-red-500/30 bg-red-500/5',
    critical: 'border-red-600/50 bg-red-600/10',
  };

  const IconComponent = error.icon;
  const visibleSolutions = showAllSolutions
    ? error.solutions
    : error.solutions.slice(0, 2);

  if (compact) {
    return (
      <Alert
        className={cn(
          'border-gray-700/50',
          severityStyles[error.severity],
          className
        )}
      >
        <IconComponent className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <span className="font-medium">{error.title}:</span>{' '}
          {error.description}
          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              size="sm"
              variant="outline"
              className="ml-2"
            >
              {isRetrying ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                'Try Again'
              )}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card
      className={cn(
        'border-gray-700/50 bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm',
        severityStyles[error.severity],
        className
      )}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <IconComponent className="h-8 w-8 text-current" />
          </div>
          <div className="flex-1">
            <CardTitle className="mb-2 text-white text-xl">
              {error.title}
            </CardTitle>
            <CardDescription className="text-base text-gray-300">
              {error.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Actions */}
        {(onRetry || error.quickFix) && (
          <div className="flex gap-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                className="flex-1"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Trying Again...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </>
                )}
              </Button>
            )}
            {error.quickFix && (
              <Button
                onClick={error.quickFix.action}
                variant="outline"
                className="flex-1"
              >
                {error.quickFix.label}
              </Button>
            )}
          </div>
        )}

        {/* Solutions */}
        {error.solutions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-400" />
              <h3 className="font-medium text-lg text-white">
                How to Fix This
              </h3>
            </div>

            <div className="space-y-3">
              {visibleSolutions.map((solution) => (
                <SolutionCard
                  key={solution.id}
                  solution={solution}
                  isExpanded={expandedSolution === solution.id}
                  onToggle={() =>
                    setExpandedSolution(
                      expandedSolution === solution.id ? null : solution.id
                    )
                  }
                />
              ))}
            </div>

            {error.solutions.length > 2 && !showAllSolutions && (
              <Button
                onClick={() => setShowAllSolutions(true)}
                variant="ghost"
                size="sm"
                className="w-full text-gray-400 hover:text-white"
              >
                Show {error.solutions.length - 2} more solutions
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Prevention Tips */}
        {error.preventionTips && error.preventionTips.length > 0 && (
          <>
            <Separator className="bg-gray-700/50" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                <h3 className="font-medium text-lg text-white">
                  Prevention Tips
                </h3>
              </div>
              <ul className="space-y-2">
                {error.preventionTips.map((tip, index) => (
                  <li
                    key={`tip-${tip.slice(0, 30)}-${index + 1}`}
                    className="flex gap-3 text-gray-300 text-sm"
                  >
                    <span className="mt-1 text-yellow-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Related Help */}
        {error.relatedHelp && error.relatedHelp.length > 0 && (
          <>
            <Separator className="bg-gray-700/50" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-green-400" />
                <h3 className="font-medium text-lg text-white">
                  Need More Help?
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {error.relatedHelp.map((help, index) => (
                  <Button
                    key={`help-${help.title?.slice(0, 20) || help.link.slice(0, 20)}-${index + 1}`}
                    asChild
                    variant="outline"
                    size="sm"
                  >
                    <Link
                      href={help.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      {help.title}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
