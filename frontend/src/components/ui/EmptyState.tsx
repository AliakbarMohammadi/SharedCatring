'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 mb-4 text-secondary-300">{icon}</div>
      )}
      <h3 className="text-lg font-medium text-secondary-700 mb-2">{title}</h3>
      {description && (
        <p className="text-secondary-500 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
