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
          className="fixed bottom-6 left-1/2 z-[9999] px-4"
          style={{
            x: '-50%',
            maxWidth: 'calc(100vw - 2rem)', // Ensure it doesn't exceed viewport width on mobile
          }}
        >
          <div
            className="flex max-w-full flex-col items-start gap-3 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 shadow-xl sm:flex-row sm:items-center"
            style={{
              boxShadow: `
                0 8px 16px -4px rgba(0, 0, 0, 0.4),
                0 4px 6px -2px rgba(0, 0, 0, 0.2)
              `,
            }}
          >
            {/* Icon and Message */}
            <div className="flex flex-shrink-0 items-center gap-2.5">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              >
                <AlertTriangle className="h-4 w-4 text-orange-400" />
              </motion.div>

              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="font-medium text-sm text-white"
              >
                {message}
              </motion.span>
            </div>

            {/* Divider - hidden on mobile */}
            <div className="hidden h-5 w-px bg-gray-600 sm:block" />

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex w-full items-center gap-2 sm:w-auto"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                disabled={isSubmitting}
                className="flex h-auto flex-1 cursor-pointer items-center gap-1.5 px-3 py-1.5 font-medium text-gray-300 text-xs transition-colors duration-150 hover:bg-gray-700 hover:text-white sm:flex-none"
              >
                <RotateCcw className="h-3 w-3" />
                {resetLabel}
              </Button>

              <Button
                size="sm"
                onClick={(e) => onSave(e)}
                disabled={isSubmitting}
                className="flex h-auto flex-1 cursor-pointer items-center gap-1.5 bg-orange-600 px-3 py-1.5 font-medium text-white text-xs transition-colors duration-150 hover:bg-orange-700 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    {saveLabel}
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
