'use client';

import {
  Cancel01Icon,
  Image01Icon,
  InformationCircleIcon,
  Loading03Icon,
  RefreshIcon,
  Upload01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import Image from 'next/image';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUploadThing } from '@/lib/uploadthing-utils';
import { cn } from '@/lib/utils';

interface HubBannerUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  hubId: string;
  currentBannerUrl?: string;
  hubName?: string;
  onBannerUpdate?: (bannerUrl: string | null) => void;
}

export function HubBannerUploadModal({
  isOpen,
  onClose,
  hubId,
  currentBannerUrl,
  hubName,
  onBannerUpdate,
}: HubBannerUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentBannerUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // UploadThing hook
  const { startUpload } = useUploadThing('hubBannerUploader', {
    onClientUploadComplete: (res) => {
      const uploadedFile = res?.[0];
      if (uploadedFile) {
        // Clean up old preview URL
        if (previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(uploadedFile.ufsUrl);
        setSelectedFile(null);
        setHasChanges(false);

        // Provide optimistic update to parent component
        if (onBannerUpdate) {
          onBannerUpdate(uploadedFile.ufsUrl);
        }

        toast.success('Banner Updated', {
          description: 'Your hub banner has been successfully updated.',
        });

        onClose();
      }
      setIsUploading(false);
    },
    onUploadError: (error) => {
      console.error('Upload01Icon error:', error);

      // Revert optimistic update on error
      if (onBannerUpdate && currentBannerUrl) {
        onBannerUpdate(currentBannerUrl);
      }

      toast.error('Upload01Icon Failed', {
        description: error.message || 'Failed to upload banner',
      });
      setIsUploading(false);
    },
  });

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid File Type', {
          description: 'Please select an image file (PNG, JPG, GIF, etc.)',
        });
        return;
      }

      // Validate file size (4MB limit)
      if (file.size > 4 * 1024 * 1024) {
        toast.error('File Too Large', {
          description: 'Please select an image smaller than 4MB',
        });
        return;
      }

      setSelectedFile(file);
      setHasChanges(true);

      // Create preview URL
      const url = URL.createObjectURL(file);
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(url);
    },
    [previewUrl]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Upload01Icon banner using UploadThing
  const handleUploadBanner = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    // Provide optimistic update immediately
    const optimisticUrl = previewUrl;
    if (optimisticUrl && onBannerUpdate) {
      onBannerUpdate(optimisticUrl);
    }

    try {
      await startUpload([selectedFile], { hubId });
    } catch (error) {
      console.error('Error starting upload:', error);

      // Revert optimistic update on error
      if (onBannerUpdate && currentBannerUrl) {
        onBannerUpdate(currentBannerUrl);
      }

      toast.error('Upload01Icon Failed', {
        description:
          error instanceof Error ? error.message : 'Failed to start upload',
      });
      setIsUploading(false);
    }
  };

  // Reset to original state
  const handleReset = () => {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(currentBannerUrl || null);
    setSelectedFile(null);
    setHasChanges(false);
  };

  // Remove banner
  const handleRemoveBanner = async () => {
    // This would need an API endpoint to remove the banner
    // For now, we'll just clear the preview
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setHasChanges(true);
  };

  // Handle modal close
  const handleClose = () => {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setHasChanges(false);
    setPreviewUrl(currentBannerUrl || null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="border-gray-800 bg-gray-900 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Update Hub Banner</DialogTitle>
          <DialogDescription className="text-gray-400">
            Upload01Icon a new banner for {hubName || 'your hub'}. Recommended
            size: 1920x1080px or similar aspect ratio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current/Preview Banner */}
          <div className="relative">
            <div className="aspect-video overflow-hidden rounded-lg border-2 border-gray-700/50 bg-gray-800 shadow-lg">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={hubName || 'Hub banner'}
                  width={640}
                  height={360}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center">
                    <HugeiconsIcon
                      icon={Image01Icon}
                      className="mx-auto mb-2 h-12 w-12 text-gray-500"
                    />
                    <p className="text-gray-500 text-sm">No banner set</p>
                  </div>
                </div>
              )}
            </div>
            {previewUrl && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
                onClick={handleRemoveBanner}
                disabled={isUploading}
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Upload01Icon Area */}
          <section
            aria-label="File drop area"
            className={cn(
              'rounded-lg border-2 border-dashed p-6 text-center transition-colors',
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-gray-600 hover:border-gray-500'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-700/50">
                <HugeiconsIcon
                  icon={Upload01Icon}
                  className="h-6 w-6 text-gray-400"
                />
              </div>

              <div>
                <p className="mb-1 font-medium text-sm text-white">
                  {isDragging ? 'Drop your image here' : 'Upload01Icon Banner'}
                </p>
                <p className="mb-3 text-gray-400 text-xs">
                  Drag and drop or click to browse
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-gray-600 px-3 text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
              </div>
            </div>
          </section>

          {/* File InformationCircleIcon */}
          {selectedFile && (
            <div className="rounded-lg bg-gray-800/50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-500/20">
                  <HugeiconsIcon
                    icon={Upload01Icon}
                    className="h-4 w-4 text-indigo-400"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </Button>

          {hasChanges && (
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={isUploading}
              className="text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <HugeiconsIcon icon={RefreshIcon} className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}

          <Button
            onClick={handleUploadBanner}
            disabled={!selectedFile || isUploading}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {isUploading ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Uploading...
              </>
            ) : (
              <>
                <HugeiconsIcon icon={Upload01Icon} className="mr-2 h-4 w-4" />
                Upload01Icon Banner
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
