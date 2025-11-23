'use client';

import { Crown, Sparkles, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  variant?: 'default' | 'active' | 'required' | 'gold' | 'sparkly';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export function PremiumBadge({
  variant = 'default',
  size = 'md',
  className,
  animated = false,
}: PremiumBadgeProps) {
  const variants = {
    default: {
      badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      icon: Crown,
      text: 'Premium',
    },
    active: {
      badge: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: Crown,
      text: 'Premium Active',
    },
    required: {
      badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      icon: Star,
      text: 'Premium Required',
    },
    gold: {
      badge:
        'bg-linear-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/40 shadow-lg shadow-yellow-500/10',
      icon: Crown,
      text: 'Premium',
    },
    sparkly: {
      badge:
        'bg-linear-to-r from-purple-500/20 via-pink-500/20 to-yellow-500/20 text-yellow-400 border-yellow-500/40 shadow-lg shadow-yellow-500/10',
      icon: Sparkles,
      text: 'Premium',
    },
  };

  const sizes = {
    sm: {
      badge: 'text-xs px-2 py-1',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'text-sm px-2.5 py-1',
      icon: 'w-4 h-4',
    },
    lg: {
      badge: 'text-base px-3 py-1.5',
      icon: 'w-5 h-5',
    },
  };

  const config = variants[variant];
  const sizeConfig = sizes[size];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        config.badge,
        sizeConfig.badge,
        'inline-flex items-center gap-1.5 font-medium',
        animated && 'animate-pulse',
        className
      )}
    >
      <Icon className={cn(sizeConfig.icon, animated && 'animate-pulse')} />
      {config.text}
    </Badge>
  );
}

interface PremiumIndicatorProps {
  className?: string;
  showText?: boolean;
}

export function PremiumIndicator({
  className,
  showText = true,
}: PremiumIndicatorProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-yellow-400',
        className
      )}
    >
      <Crown className="h-4 w-4 text-yellow-500" />
      {showText && <span className="font-medium text-sm">Premium</span>}
    </div>
  );
}

interface PremiumSparkleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PremiumSparkle({
  className,
  size = 'md',
}: PremiumSparkleProps) {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <Sparkles
      className={cn('animate-pulse text-yellow-400', sizes[size], className)}
    />
  );
}
