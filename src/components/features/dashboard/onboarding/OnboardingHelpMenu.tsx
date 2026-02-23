'use client';

import {
  HelpCircleIcon,
  LinkSquare02Icon,
  Message01Icon,
  Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useGuidedTour } from './GuidedTourProvider';

export function OnboardingHelpMenu() {
  const { startTour } = useGuidedTour();

  const helpItems = [
    {
      label: 'Interactive Guide',
      description: 'Step-by-step guided tour with highlights',
      icon: Target01Icon,
      action: startTour,
      color: 'text-orange-400',
    },
    // FIXME: Re-enable changelog link when changelog is ready
    // {
    //   label: 'Documentation',
    //   description: 'Read our comprehensive guides',
    //   icon: BookOpen,
    //   href: 'https://docs.interchat.dev',
    //   external: true,
    //   color: 'text-blue-400',
    // },
    {
      label: 'Support Server',
      description: 'Get help from our community',
      icon: Message01Icon,
      href: 'https://discord.gg/cgYgC6YZyX',
      external: true,
      color: 'text-green-400',
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-gray-400 hover:text-white"
        >
          <HugeiconsIcon
            strokeWidth={3}
            icon={HelpCircleIcon}
            className="h-5 w-5"
          />
          <span className="sr-only">Help menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 border-gray-800 bg-gray-900 text-white"
      >
        <DropdownMenuLabel className="text-gray-300">
          Help & Support
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-800" />

        {helpItems.map((item) => {
          const _Icon = item.icon;

          if (item.href) {
            return (
              <DropdownMenuItem key={item.label} asChild>
                <a
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-gray-800 focus:bg-gray-800"
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    className={`h-4 w-4 ${item.color}`}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">{item.label}</div>
                    <div className="text-gray-400 text-xs">
                      {item.description}
                    </div>
                  </div>
                  {item.external && (
                    <HugeiconsIcon
                      icon={LinkSquare02Icon}
                      className="h-3 w-3 text-gray-500"
                    />
                  )}
                </a>
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem
              key={item.label}
              onClick={item.action}
              className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-gray-800 focus:bg-gray-800"
            >
              <HugeiconsIcon
                icon={item.icon}
                className={`h-4 w-4 ${item.color}`}
              />
              <div className="flex-1">
                <div className="font-medium text-white">{item.label}</div>
                <div className="text-gray-400 text-xs">{item.description}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
