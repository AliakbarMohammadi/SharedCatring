'use client';

/**
 * Order Card Component
 * کامپوننت کارت سفارش
 */

import Link from 'next/link';
import { Calendar, Clock, ChevronLeft } from 'lucide-react';
import { formatPrice, formatPersianDate } from '@/utils/format';
import { Order } from '@/services/order.service';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const itemsPreview = order.items.slice(0, 3);
  const remainingItems = order.items.length - 3;

  return (
    <Link
      href={`/orders/${order.id}`}
      onClick={onClick}
      className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900">#{order.orderNumber}</span>
          <OrderStatusBadge status={order.status} size="sm" />
        </div>
        <ChevronLeft className="h-5 w-5 text-gray-400" />
      </div>

      {/* Items Preview */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          {itemsPreview.map((item, index) => (
            <span key={item.id}>
              {item.foodName} ({item.quantity})
              {index < itemsPreview.length - 1 && '، '}
            </span>
          ))}
          {remainingItems > 0 && (
            <span className="text-gray-400"> و {remainingItems} مورد دیگر</span>
          )}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatPersianDate(order.createdAt)}
          </span>
          {order.deliveryDate && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              تحویل: {formatPersianDate(order.deliveryDate)}
            </span>
          )}
        </div>
        <span className="font-bold text-primary-600">
          {formatPrice(order.userPayable || order.totalAmount)}
        </span>
      </div>
    </Link>
  );
}

export default OrderCard;
