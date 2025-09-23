import {
  CalendarClock,
  CalendarDays,
  Clock,
  Hourglass,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type DurationType =
  | '10m'
  | '1h'
  | '3h'
  | '6h'
  | '12h'
  | '1d'
  | '7d'
  | '30d'
  | '90d'
  | '365d'
  | 'permanent';

interface DurationOption {
  value: DurationType;
  label: string;
}

interface DurationSelectorProps {
  value: DurationType;
  onChange: (value: DurationType) => void;
  options?: DurationOption[];
  description?: string;
}

const DEFAULT_OPTIONS: DurationOption[] = [
  { value: '10m', label: '10 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '3h', label: '3 Hours' },
  { value: '6h', label: '6 Hours' },
  { value: '12h', label: '12 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '365d', label: '1 Year' },
  { value: 'permanent', label: 'Permanent' },
];

export function DurationSelector({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  description = 'Select how long the blacklist should last',
}: DurationSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-medium text-sm">Duration</Label>
        <span className="text-gray-400 text-xs">{description}</span>
      </div>
      <RadioGroup
        value={value}
        onValueChange={(value) => onChange(value as DurationType)}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
      >
        {options.map((option) => {
          const isPermanent = option.value === 'permanent';
          const isSelected = value === option.value;

          // Determine which icon to show based on the duration
          const getIcon = () => {
            if (isPermanent) return <InfinityIcon className="h-3.5 w-3.5" />;
            if (option.value.endsWith('m'))
              return <Clock className="h-3.5 w-3.5" />;
            if (option.value.endsWith('h'))
              return <Hourglass className="h-3.5 w-3.5" />;
            if (option.value === '1d' || option.value === '7d')
              return <CalendarDays className="h-3.5 w-3.5" />;
            return <CalendarClock className="h-3.5 w-3.5" />;
          };

          return (
            <Label
              key={option.value}
              htmlFor={option.value}
              className={`flex items-center justify-between rounded-lg border p-3 transition-all duration-200 hover:border-gray-700 ${
                isSelected
                  ? isPermanent
                    ? 'border-red-500/50 bg-red-500/10 text-red-400'
                    : 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
                  : 'border-gray-800/50 bg-gray-900/50'
              } cursor-pointer`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${isSelected ? (isPermanent ? 'border-red-500' : 'border-indigo-500') : 'border-gray-600'}`}
                >
                  {isSelected && (
                    <div
                      className={`h-2 w-2 rounded-full ${isPermanent ? 'bg-red-500' : 'bg-indigo-500'}`}
                    />
                  )}
                </div>
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="sr-only"
                />
                <span>{option.label}</span>
              </div>
              <div
                className={`text-gray-400 ${isSelected ? (isPermanent ? 'text-red-400' : 'text-indigo-400') : ''}`}
              >
                {getIcon()}
              </div>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
