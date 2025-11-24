'use client';

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Lightbulb,
  MousePointer,
  Target,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'none';
  actionText?: string;
  highlightPadding?: number;
}

interface GuidedTourProps {
  isActive: boolean;
  steps: TourStep[];
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

interface TooltipPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function GuidedTour({
  isActive,
  steps,
  currentStep,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  canGoNext,
  canGoPrevious,
}: GuidedTourProps) {
  const highlightMaskId = useId();
  const [tooltipPosition, setTooltipPosition] =
    useState<TooltipPosition | null>(null);
  const [highlightPosition, setHighlightPosition] =
    useState<TooltipPosition | null>(null);

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const updatePositions = () => {
      const targetElement = document.querySelector(
        currentStepData.targetSelector
      );
      if (!targetElement) {
        console.warn(
          `Target element not found: ${currentStepData.targetSelector}`
        );
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      const padding = currentStepData.highlightPadding || 8;

      // Set highlight position (around the target element)
      setHighlightPosition({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Calculate tooltip position based on the specified position
      const tooltipWidth = 320;
      const tooltipHeight = 200; // Approximate height
      let tooltipTop = rect.top;
      let tooltipLeft = rect.left;

      switch (currentStepData.position) {
        case 'top':
          tooltipTop = rect.top - tooltipHeight - 16;
          tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          tooltipTop = rect.bottom + 16;
          tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2;
          tooltipLeft = rect.left - tooltipWidth - 16;
          break;
        case 'right':
          tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2;
          tooltipLeft = rect.right + 16;
          break;
        case 'center':
          tooltipTop = window.innerHeight / 2 - tooltipHeight / 2;
          tooltipLeft = window.innerWidth / 2 - tooltipWidth / 2;
          break;
      }

      // Ensure tooltip stays within viewport
      tooltipTop = Math.max(
        16,
        Math.min(tooltipTop, window.innerHeight - tooltipHeight - 16)
      );
      tooltipLeft = Math.max(
        16,
        Math.min(tooltipLeft, window.innerWidth - tooltipWidth - 16)
      );

      setTooltipPosition({
        top: tooltipTop,
        left: tooltipLeft,
        width: tooltipWidth,
        height: tooltipHeight,
      });
    };

    // Initial position calculation
    updatePositions();

    // Update positions on scroll and resize
    const handleUpdate = () => updatePositions();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isActive, currentStepData]);

  const handleTargetClick = (event: React.MouseEvent) => {
    if (currentStepData.action === 'click') {
      // Allow the click to pass through to the actual element
      event.stopPropagation();
      const targetElement = document.querySelector(
        currentStepData.targetSelector
      ) as HTMLElement;
      if (targetElement) {
        // Simulate a real click on the target element
        targetElement.click();
        // Auto-advance to next step after a short delay
        setTimeout(() => {
          onNext();
        }, 500);
      }
    }
  };

  if (!isActive || !currentStepData || !tooltipPosition || !highlightPosition) {
    return null;
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return createPortal(
    <div className="fixed inset-0 z-[10000]">
      {/* Dark overlay with cutout for highlighted element - pointer events enabled for overlay but not for cutout */}
      <div className="pointer-events-auto absolute inset-0 bg-black/60">
        <svg className="pointer-events-none h-full w-full">
          <title>Guided tour highlight overlay</title>
          <defs>
            <mask id={highlightMaskId}>
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={highlightPosition.left}
                y={highlightPosition.top}
                width={highlightPosition.width}
                height={highlightPosition.height}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="black"
            fillOpacity="0.6"
            mask={`url(#${highlightMaskId})`}
          />
        </svg>

        {/* Invisible clickable area over the highlighted element */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: highlightPosition.top,
            left: highlightPosition.left,
            width: highlightPosition.width,
            height: highlightPosition.height,
          }}
        />
      </div>

      {/* Highlight border around target element */}
      <button
        type="button"
        tabIndex={currentStepData.action !== 'click' ? 0 : -1}
        className={`absolute rounded-lg border-2 border-purple-400 shadow-lg ${currentStepData.action === 'click'
            ? 'pointer-events-none'
            : 'pointer-events-auto'
          }`}
        style={{
          top: highlightPosition.top,
          left: highlightPosition.left,
          width: highlightPosition.width,
          height: highlightPosition.height,
          boxShadow:
            '0 0 0 4px rgba(147, 51, 234, 0.2), 0 0 20px rgba(147, 51, 234, 0.3)',
        }}
        onClick={
          currentStepData.action !== 'click' ? handleTargetClick : undefined
        }
        onKeyDown={(e) => {
          if (
            currentStepData.action !== 'click' &&
            (e.key === 'Enter' || e.key === ' ')
          ) {
            e.preventDefault();
            const syntheticMouseEvent = e as unknown as React.MouseEvent;
            handleTargetClick?.(syntheticMouseEvent);
          }
        }}
      >
        {currentStepData.action === 'click' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex items-center gap-2 rounded-full bg-purple-500 px-3 py-1 font-medium text-sm text-white"
            >
              <MousePointer className="h-4 w-4" />
              {currentStepData.actionText || 'Click here'}
            </motion.div>
          </div>
        )}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-auto absolute"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            width: tooltipPosition.width,
          }}
        >
          <Card className="border border-gray-700/50 bg-gray-900/95 shadow-2xl backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-purple-500/30 bg-purple-900/30 p-2">
                    <Target className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="font-semibold text-lg text-white">
                      {currentStepData.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      Step {currentStep + 1} of {steps.length}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSkip}
                  className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-gray-800">
                <div
                  className="h-2 rounded-full bg-linear-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {currentStepData.description}
              </p>

              {currentStepData.action && (
                <div className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-900/20 p-3">
                  <Lightbulb className="h-4 w-4 shrink-0 text-purple-400" />
                  <span className="text-purple-300 text-sm">
                    {currentStepData.action === 'click'
                      ? 'Click the highlighted element to continue'
                      : currentStepData.action === 'hover'
                        ? 'Hover over the highlighted element'
                        : 'Observe the highlighted element'}
                  </span>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-gray-400 text-sm hover:text-white"
                >
                  Skip Tour
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={onPrevious}
                    disabled={!canGoPrevious}
                    size="sm"
                    className="text-gray-400 hover:text-white disabled:opacity-50"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>

                  <Button
                    onClick={canGoNext ? onNext : onComplete}
                    size="sm"
                    className="bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                  >
                    {canGoNext ? (
                      <>
                        Next
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Finish
                        <Eye className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
