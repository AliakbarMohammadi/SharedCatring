'use client';

/**
 * Cart Item Component
 * کامپوننت آیتم سبد خرید
 */

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Trash2, X } from 'lucide-react';
import { formatPrice } from '@/utils/format';
import { CartItem as CartItemType, useCartStore } from '@/stores/cart.store';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const [imageError, setImageError] = useState(false);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove();
      return;
    }
    updateQuantity(item.foodId, newQuantity);
    onQuantityChange?.(newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.foodId);
    onRemove?.();
  };

  const totalPrice = item.unitPrice * item.quantity;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100">
      {/* Image */}
      <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        {item.image && !imageError ? (
          <Image
            src={item.image}
            alt={item.foodName}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            🍽️
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{item.foodName}</h3>
        <p className="text-sm text-gray-500">
          {formatPrice(item.unitPrice)} × {item.quantity}
        </p>
        {item.notes && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            یادداشت: {item.notes}
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center font-medium text-gray-900">
          {item.quantity}
        </span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Total Price */}
      <div className="text-left min-w-[100px]">
        <p className="font-bold text-gray-900">{formatPrice(totalPrice)}</p>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        title="حذف از سبد"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

export default CartItem;
