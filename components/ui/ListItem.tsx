'use client';

import React from 'react';
import {
  Check,
  Circle,
  AlertCircle,
  ArrowUp,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIconComponent } from '@/lib/utils/icon-utils';
import Badge from './Badge';

export interface ListItemProps {
  id: string;
  title: string;
  action?: string | null;
  category: string;
  categoryIcon?: string | null;
  done: boolean;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | null;
  imageUrl?: string | null;
  onClick: (id: string) => void;
  onToggleDone: (id: string, done: boolean) => void;
  className?: string;
  selectionMode?: boolean;
  selected?: boolean;
  onSelectionChange?: (id: string) => void;
}

const ListItem: React.FC<ListItemProps> = ({
  id,
  title,
  action,
  category,
  categoryIcon,
  done,
  description,
  priority,
  imageUrl,
  onClick,
  onToggleDone,
  className,
  selectionMode = false,
  selected = false,
  onSelectionChange,
}) => {
  // Priority configuration
  const priorityConfig = {
    high: {
      icon: AlertCircle,
      badge: 'badge-danger',
      label: 'High',
      borderColor: 'border-l-4 border-l-danger-500 dark:border-l-danger-400',
    },
    medium: {
      icon: ArrowUp,
      badge: 'badge-accent',
      label: 'Medium',
      borderColor: 'border-l-4 border-l-accent-500 dark:border-l-accent-400',
    },
    low: {
      icon: Circle,
      badge: 'bg-success-100 text-success-600',
      label: 'Low',
      borderColor: 'border-l-4 border-l-success-300 dark:border-l-success-600',
    },
  };

  const priorityStyle = priority ? priorityConfig[priority] : null;
  const PriorityIcon = priorityStyle?.icon;

  return (
    <div
      onClick={(e) => {
        if (selectionMode && onSelectionChange) {
          e.stopPropagation();
          onSelectionChange(id);
        } else {
          onClick(id);
        }
      }}
      className={cn(
        'group relative rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer dark:border-neutral-800 dark:bg-neutral-900',
        done && 'opacity-70',
        priorityStyle?.borderColor,
        selected && 'ring-2 ring-primary-500 border-primary-500',
        className
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (selectionMode && onSelectionChange) {
            onSelectionChange(id);
          } else {
            onClick(id);
          }
        }
      }}
    >
      {/* Selection checkbox */}
      {selectionMode && (
        <div className="absolute top-3 left-3 z-10 flex items-center justify-center p-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              e.stopPropagation();
              onSelectionChange?.(id);
            }}
            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-0 focus:ring-offset-0 dark:border-neutral-600 cursor-pointer"
            aria-label={`Select ${title}`}
          />
        </div>
      )}

      {/* Top section: Category icon, priority badge, and done toggle */}
      <div className={cn('mb-3 flex items-start justify-between gap-2', selectionMode && 'pl-8')}>
        <div className="flex flex-wrap items-center gap-2">
          {(() => {
            const CategoryIcon = getIconComponent(categoryIcon);
            const IconComponent = CategoryIcon || Package;
            return (
              <div className="flex items-center gap-1.5 rounded-md bg-primary-50 px-2 py-1 dark:bg-primary-900/20">
                <IconComponent className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                  {category}
                </span>
              </div>
            );
          })()}
          {priority && priorityStyle && (
            <Badge
              text={priorityStyle.label}
              variant={
                priority === 'high'
                  ? 'danger'
                  : priority === 'medium'
                    ? 'accent'
                    : 'neutral'
              }
              icon={PriorityIcon}
            />
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleDone(id, !done);
          }}
          className={cn(
            'flex-0 rounded-full p-1 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            done
              ? 'text-success-600 hover:text-success-700'
              : 'text-neutral-400 hover:text-neutral-600'
          )}
          aria-label={done ? 'Mark as not done' : 'Mark as done'}
        >
          {done ? (
            <Check className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Circle className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Image and Content Layout */}
      <div className={cn('flex gap-3', imageUrl && 'flex-row')}>
        {/* Image */}
        {imageUrl && (
          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title with optional action */}
          <h3
            className={cn(
              'mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100'
            )}
          >
            {action && (
              <span className="mr-1.5 text-sm font-normal text-accent-600 dark:text-accent-400">
                {action}
              </span>
            )}
            <span className={cn(done && 'line-through')}>{title}</span>
          </h3>

          {/* Description (if exists) */}
          {description && (
            <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

ListItem.displayName = 'ListItem';

export default ListItem;
