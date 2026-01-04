'use client';

/**
 * Order Status Badge Component
 * کامپوننت نشان وضعیت سفارش
 */

import { orderStatusLabels, orderStatusColors } from '@/utils/format';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'delivered' 
  | 'cancelled'
  | 'completed'
  | 'rejected';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

const statusColorClasses: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const label = orderStatusLabels[status] || status;
  const colorClass = statusColorClasses[status] || 'bg-gray-100 text-gray-800';
  const sizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClass}`}>
      {label}
    </span>
  );
}

export default OrderStatusBadge;
