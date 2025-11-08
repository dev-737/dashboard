'use client';

import { ArrowLeft, ArrowRight, Upload } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MediaUploadStepProps {
  iconUrl: string | null;
  setIconUrl: (url: string | null) => void;
  bannerUrl: string | null;
  setBannerUrl: (url: string | null) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function MediaUploadStep({
  iconUrl,
  setIconUrl,
  bannerUrl,
  setBannerUrl,
  onNext,
  onPrev,
}: MediaUploadStepProps) {
  const [iconPreview, setIconPreview] = useState<string | null>(iconUrl);
  const [bannerPreview, setBannerPreview] = useState<string | null>(bannerUrl);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setIconPreview(result);
        setIconUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBannerPreview(result);
        setBannerUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <CardHeader className="pb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600">
          <Upload className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Add Hub Media</CardTitle>
        <CardDescription className="text-base">
          Upload an icon and banner to make your hub stand out (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Icon Upload */}
        <div className="space-y-3">
          <Label className="font-medium text-base">Hub Icon</Label>
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 flex-shrink-0 rounded-2xl border-4 border-gray-700/50 bg-gray-800/50 overflow-hidden">
              {iconPreview ? (
                <Image
                  src={iconPreview}
                  alt="Icon preview"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-500">
                  <Upload className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                className="border-gray-700/50 bg-gray-800/50"
              />
              <p className="mt-2 text-xs text-gray-400">
                Recommended: 512x512px, PNG or JPG
              </p>
            </div>
          </div>
        </div>

        {/* Banner Upload */}
        <div className="space-y-3">
          <Label className="font-medium text-base">Hub Banner</Label>
          <div className="space-y-2">
            <div className="h-32 w-full rounded-lg border border-gray-700/50 bg-gray-800/50 overflow-hidden">
              {bannerPreview ? (
                <Image
                  src={bannerPreview}
                  alt="Banner preview"
                  width={400}
                  height={128}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-500">
                  <Upload className="h-8 w-8" />
                </div>
              )}
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="border-gray-700/50 bg-gray-800/50"
            />
            <p className="text-xs text-gray-400">
              Recommended: 1200x400px, PNG or JPG
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="border-gray-700/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            onClick={onNext}
            className="border-none bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 hover:from-indigo-600/80 hover:to-purple-600/80"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </>
  );
}
