import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface BasicInfoSectionProps {
  name: string;
  setName: (name: string) => void;
  isPrivate: boolean;
  setIsPrivate: (isPrivate: boolean) => void;
  description: string;
  setDescription: (description: string) => void;
  nameId: string;
  privateId: string;
  descriptionId: string;
}

export function BasicInfoSection({
  name,
  setName,
  isPrivate,
  setIsPrivate,
  description,
  setDescription,
  nameId,
  privateId,
  descriptionId,
}: BasicInfoSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor={nameId} className="font-medium text-base">
            Hub Name
          </Label>
          <Input
            id={nameId}
            placeholder="Enter hub name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            maxLength={32}
            className="border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50"
          />
          <p className="text-gray-400 text-xs">
            Choose a unique name between 3-32 characters.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Switch
              id={privateId}
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
            <Label htmlFor={privateId} className="font-medium text-base">
              Private Hub
            </Label>
          </div>
          <p className="text-gray-400 text-xs">
            Private hubs are only visible to invited members and won&apos;t
            appear in public listings.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor={descriptionId} className="font-medium text-base">
          Description
        </Label>
        <Textarea
          id={descriptionId}
          placeholder="Describe your hub..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={10}
          maxLength={500}
          className="min-h-[100px] resize-none border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50"
        />
        <div className="flex justify-between text-gray-400 text-xs">
          <p>Tell users what your hub is about and what they can expect.</p>
          <span>{description.length}/500</span>
        </div>
      </div>
    </>
  );
}
