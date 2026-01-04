'use client';

/**
 * Cart Summary Component
 * کامپوننت خلاصه سبد خرید
 */

import { formatPrice } from '@/utils/format';

interface CartSummaryProps {
  subtotal: number;
  subsidyAmount?: number;
  deliveryFee?: number;
  discount?: number;
  isEmployee?: boolean;
  onCheckout?: () => void;
  isLoading?: boolean;
}

export function CartSummary({
  subtotal,
  subsidyAmount = 0,
  deliveryFee = 0,
  discount = 0,
  isEmployee = false,
  onCheckout,
  isLoading = false,
}: CartSummaryProps) {
  const totalPayable = subtotal - subsidyAmount - discount + deliveryFee;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-4">خلاصه سفارش</h3>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-gray-600">
          <span>جمع کل</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {/* Subsidy (for employees) */}
        {isEmployee && subsidyAmount > 0 && (
          <div className="flex items-center justify-between text-green-600">
            <span>یارانه شرکت</span>
            <span>- {formatPrice(subsidyAmount)}</span>
          </div>
        )}

        {/* Discount */}
        {discount > 0 && (
          <div className="flex items-center justify-between text-green-600">
            <span>تخفیف</span>
            <span>- {formatPrice(discount)}</span>
          </div>
        )}

        {/* Delivery Fee */}
        {deliveryFee > 0 && (
          <div className="flex items-center justify-between text-gray-600">
            <span>هزینه ارسال</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">قابل پرداخت</span>
            <span className="font-bold text-lg text-primary-600">
              {formatPrice(totalPayable)}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {onCheckout && (
        <button
          onClick={onCheckout}
          disabled={isLoading || subtotal === 0}
          className="w-full mt-6 py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'در حال پردازش...' : 'ادامه و پرداخت'}
        </button>
      )}
    </div>
  );
}

export default CartSummary;
