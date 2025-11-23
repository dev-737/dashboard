'use client';

import { Check, ExternalLink, Info } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface UpgradePromptProps {
  trigger?: React.ReactNode;
  feature?: string;
  children?: React.ReactNode;
}

export function UpgradePrompt({
  trigger,
  feature = 'this feature',
  children,
}: UpgradePromptProps) {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button
      variant="outline"
      className="cursor-pointer border-blue-500/30 bg-linear-to-r from-blue-600/20 to-blue-700/20 text-blue-400 hover:from-blue-600/30 hover:to-blue-700/30"
    >
      <Info className="mr-2 h-4 w-4" />
      Learn More
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="border-gray-800 bg-gray-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Info className="h-5 w-5 text-blue-500" />
            Feature Information
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {feature} is currently not available.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-gray-800 bg-gray-950/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Info className="h-5 w-5 text-blue-500" />
              Feature Status
            </CardTitle>
            <CardDescription className="text-gray-400">
              This feature is currently under development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Check className="h-4 w-4 flex-shrink-0 text-blue-400" />
              Feature is being developed
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Check className="h-4 w-4 flex-shrink-0 text-blue-400" />
              Will be available in future updates
            </div>
          </CardContent>
        </Card>

        {children && (
          <div className="rounded-lg bg-gray-800/50 p-3 text-gray-400 text-sm">
            {children}
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Got it
          </Button>
          <Button
            asChild
            className="border-none bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
          >
            <a
              href="https://discord.gg/interchat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              Join Discord
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface InlineUpgradePromptProps {
  feature?: string;
  className?: string;
}

export function InlineUpgradePrompt({
  feature = 'this feature',
  className,
}: InlineUpgradePromptProps) {
  return (
    <Card
      className={`border-blue-500/30 bg-linear-to-r from-blue-900/20 to-blue-900/20 shadow-blue-500/5 shadow-lg ${className}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
          <div className="flex-1 space-y-2">
            <h4 className="font-medium text-blue-400">ℹ️ Feature Information</h4>
            <p className="text-gray-300 text-sm">
              {feature} is currently under development.
            </p>
            <UpgradePrompt feature={feature}>
              <p>
                This feature will be available in future updates. Join our
                Discord for updates!
              </p>
            </UpgradePrompt>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
