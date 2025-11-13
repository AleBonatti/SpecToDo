'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'primary' | 'accent' | 'success' | 'neutral';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'neutral',
  trend,
  className,
}) => {
  const variants = {
    primary: {
      bg: 'bg-primary-50 dark:bg-primary-950/30',
      iconBg: 'bg-primary-100 dark:bg-primary-900/50',
      iconColor: 'text-primary-600 dark:text-primary-400',
      textColor: 'text-primary-900 dark:text-primary-300',
    },
    accent: {
      bg: 'bg-accent-50 dark:bg-accent-950/30',
      iconBg: 'bg-accent-100 dark:bg-accent-900/50',
      iconColor: 'text-accent-600 dark:text-accent-400',
      textColor: 'text-accent-900 dark:text-accent-300',
    },
    success: {
      bg: 'bg-success-50 dark:bg-success-950/30',
      iconBg: 'bg-success-100 dark:bg-success-900/50',
      iconColor: 'text-success-600 dark:text-success-400',
      textColor: 'text-success-900 dark:text-success-300',
    },
    neutral: {
      bg: 'bg-white dark:bg-neutral-900',
      iconBg: 'bg-neutral-100 dark:bg-neutral-800',
      iconColor: 'text-neutral-600 dark:text-neutral-400',
      textColor: 'text-neutral-900 dark:text-neutral-100',
    },
  };

  const variantStyles = variants[variant];

  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800',
        variantStyles.bg,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p
              className={cn(
                'text-3xl font-bold',
                variantStyles.textColor
              )}
            >
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-danger-600 dark:text-danger-400'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            'rounded-lg p-3',
            variantStyles.iconBg
          )}
        >
          <Icon className={cn('h-6 w-6', variantStyles.iconColor)} />
        </div>
      </div>
    </div>
  );
};

StatCard.displayName = 'StatCard';

export default StatCard;
