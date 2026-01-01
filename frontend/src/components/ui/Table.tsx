'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-right', className)}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn('bg-secondary-50 border-b border-secondary-100', className)}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-secondary-100 last:border-0 transition-colors',
        onClick && 'cursor-pointer hover:bg-secondary-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-sm font-medium text-secondary-600 whitespace-nowrap',
        className
      )}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <td className={cn('px-4 py-3 text-secondary-800', className)}>
      {children}
    </td>
  );
}

// Empty state for tables
interface TableEmptyProps {
  colSpan: number;
  icon?: ReactNode;
  title: string;
  description?: string;
}

export function TableEmpty({ colSpan, icon, title, description }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center">
        {icon && <div className="text-secondary-300 mb-3 flex justify-center">{icon}</div>}
        <p className="text-secondary-600 font-medium">{title}</p>
        {description && <p className="text-secondary-400 text-sm mt-1">{description}</p>}
      </td>
    </tr>
  );
}

// Loading skeleton for tables
interface TableSkeletonProps {
  rows?: number;
  cols: number;
}

export function TableSkeleton({ rows = 5, cols }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-secondary-100">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <div className="h-4 bg-secondary-100 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
