'use client';

import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={cn('skeleton', variants[variant], className)}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined),
      }}
    />
  );
}

// Preset Skeletons
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-secondary-100">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" className="w-1/2 h-4 mb-2" />
          <Skeleton variant="text" className="w-1/3 h-3" />
        </div>
      </div>
      <Skeleton variant="rectangular" className="w-full h-24 mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" className="w-20 h-8" />
        <Skeleton variant="rectangular" className="w-20 h-8" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-secondary-100 overflow-hidden">
      <div className="p-4 border-b border-secondary-100">
        <Skeleton variant="text" className="w-1/4 h-5" />
      </div>
      <div className="divide-y divide-secondary-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Skeleton variant="rectangular" className="w-12 h-12" />
            <div className="flex-1">
              <Skeleton variant="text" className="w-1/3 h-4 mb-2" />
              <Skeleton variant="text" className="w-1/4 h-3" />
            </div>
            <Skeleton variant="rectangular" className="w-24 h-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonFoodCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-secondary-100">
      <Skeleton variant="rectangular" className="w-full h-40" />
      <div className="p-4">
        <Skeleton variant="text" className="w-2/3 h-5 mb-2" />
        <Skeleton variant="text" className="w-full h-3 mb-1" />
        <Skeleton variant="text" className="w-3/4 h-3 mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-20 h-5" />
          <Skeleton variant="rectangular" className="w-24 h-9" />
        </div>
      </div>
    </div>
  );
}
