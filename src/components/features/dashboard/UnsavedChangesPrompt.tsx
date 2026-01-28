'use client';

import { AlertTriangle, Loader2, RotateCcw, Save } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';

interface UnsavedChangesPromptProps {
  readonly isVisible: boolean;
  readonly onSave: (e: React.FormEvent) => Promise<void> | void;
  readonly onReset: () => void;
  readonly isSubmitting?: boolean;
  readonly saveLabel?: string;
  readonly resetLabel?: string;
  readonly message?: string;
}

export function UnsavedChangesPrompt({
  isVisible,
  onSave,
  onReset,
  isSubmitting = false,
  saveLabel = 'Save Changes',
  resetLabel = 'Reset',
  message = 'Careful - you have unsaved changes!',
}: UnsavedChangesPromptProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
            duration: 0.2,
          }}
          className="fixed right-4 bottom-4 left-4 z-[9999] mx-auto max-w-2xl md:right-auto md:bottom-6 md:left-1/2 md:-translate-x-1/2"
        >
          <div className="flex w-full flex-col items-start gap-3 rounded-2xl border border-gray-700/50 bg-gray-800/95 px-4 py-3 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center">
            {/* Icon and Message */}
            <div className="flex min-w-0 shrink items-center gap-2.5">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                className="shrink-0"
              >
                <AlertTriangle className="h-4 w-4 text-orange-400" />
              </motion.div>

              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="min-w-0 truncate font-medium text-sm text-white"
              >
                {message}
              </motion.span>
            </div>

            {/* Divider - hidden on mobile */}
            <div className="hidden h-5 w-px shrink-0 bg-gray-600 sm:block" />

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex w-full shrink-0 items-center gap-2 sm:w-auto sm:min-w-fit"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                disabled={isSubmitting}
                className="flex h-auto flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 font-medium text-gray-300 text-xs transition-colors duration-150 hover:bg-gray-700 hover:text-white sm:flex-none"
              >
                <RotateCcw className="h-3 w-3 shrink-0" />
                <span className="hidden sm:inline">{resetLabel}</span>
                <span className="sm:hidden">Reset</span>
              </Button>

              <Button
                size="sm"
                onClick={(e) => onSave(e)}
                disabled={isSubmitting}
                className="flex h-auto flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-orange-600 px-3 py-2 font-medium text-white text-xs transition-colors duration-150 hover:bg-orange-700 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Save</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 shrink-0" />
                    <span className="hidden sm:inline">{saveLabel}</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
