'use client';

/**
 * Food Card Component
 * کامپوننت کارت غذا
 */

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Leaf, Flame, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { FoodItem } from '@/services/menu.service';
import { useCartStore } from '@/stores/cart.store';
import toast from 'react-hot-toast';

interface FoodCardProps {
  food: FoodItem;
  onAddToCart?: (food: FoodItem) => void;
}

export function FoodCard({ food, onAddToCart }: FoodCardProps) {
  const [imageError, setImageError] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  
  const foodId = food._id || food.id;
  const cartItem = items.find((item) => item.foodId === foodId);
  const quantityInCart = cartItem?.quantity || 0;
  
  const isUnavailable = !food.isAvailable || (food.remainingQuantity !== undefined && food.remainingQuantity <= 0);
  const price = food.pricing?.basePrice || food.effectivePrice || food.price;
  const effectivePrice = food.effectivePrice || price;
  const hasDiscount = food.effectivePrice && food.effectivePrice < price;

  const handleAddToCart = () => {
    if (isUnavailable) return;
    
    addItem({
      foodId,
      foodName: food.name,
      unitPrice: effectivePrice,
      image: food.image,
    });
    
    toast.success(`${food.name} به سبد خرید اضافه شد`);
    onAddToCart?.(food);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md ${isUnavailable ? 'opacity-60' : ''}`}>
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {food.image && !imageError ? (
          <Image
            src={food.image}
            alt={food.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {food.attributes?.isVegetarian && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Leaf className="h-3 w-3" />
              گیاهی
            </span>
          )}
          {food.attributes?.isSpicy && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Flame className="h-3 w-3" />
              تند
            </span>
          )}
        </div>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            تخفیف
          </div>
        )}
        
        {/* Unavailable Overlay */}
        {isUnavailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium">
              ناموجود
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {food.categoryName && (
          <span className="text-xs text-gray-500 mb-1 block">{food.categoryName}</span>
        )}
        
        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{food.name}</h3>
        
        {/* Description */}
        {food.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{food.description}</p>
        )}
        
        {/* Price and Add Button */}
        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary-600">
                  {formatPrice(effectivePrice)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-primary-600">
                {formatPrice(effectivePrice)}
              </span>
            )}
            
            {/* Remaining Quantity */}
            {food.remainingQuantity !== undefined && food.remainingQuantity > 0 && food.remainingQuantity <= 10 && (
              <span className="text-xs text-orange-600 block mt-1">
                فقط {food.remainingQuantity} عدد باقی مانده
              </span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          {quantityInCart > 0 ? (
            <div className="flex items-center gap-2 bg-primary-50 rounded-lg p-1">
              <span className="text-sm font-medium text-primary-700 px-2">
                {quantityInCart} در سبد
              </span>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isUnavailable}
              className="flex items-center gap-1 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              افزودن
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
