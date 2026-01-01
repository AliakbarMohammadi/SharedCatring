'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, Plus, Minus, Clock, Flame, Star, ShoppingCart } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { menuService } from '@/services/menu.service';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice, toPersianDigits } from '@/lib/utils/format';
import toast from 'react-hot-toast';

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const foodId = params.id as string;

  const { items: cartItems, addItem, updateQuantity } = useCartStore();

  const { data: food, isLoading, error } = useQuery({
    queryKey: ['menu', 'food', foodId],
    queryFn: () => menuService.getFoodById(foodId),
    enabled: !!foodId,
  });

  const cartItem = cartItems.find((i) => i.foodId === foodId);
  const cartQuantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!food) return;
    addItem({
      foodId: food.id,
      foodName: food.name,
      unitPrice: food.price,
      image: food.image,
    });
    toast.success(`${food.name} به سبد خرید اضافه شد`);
  };

  const handleUpdateQuantity = (delta: number) => {
    updateQuantity(foodId, cartQuantity + delta);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Skeleton variant="rectangular" className="w-full h-64 sm:h-96 rounded-2xl mb-6" />
          <Skeleton variant="text" className="w-1/2 h-8 mb-4" />
          <Skeleton variant="text" className="w-full h-4 mb-2" />
          <Skeleton variant="text" className="w-3/4 h-4 mb-6" />
          <Skeleton variant="rectangular" className="w-full h-20 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !food) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-secondary-500 mb-4">غذای مورد نظر یافت نشد</p>
          <Button variant="primary" onClick={() => router.push('/menu')}>
            بازگشت به منو
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          بازگشت
        </Button>

        {/* Food Image */}
        <div className="relative h-64 sm:h-96 bg-secondary-100 rounded-2xl overflow-hidden mb-6">
          {food.image ? (
            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">🍽️</div>
          )}
          {food.isPopular && (
            <Badge variant="warning" size="md" className="absolute top-4 right-4">
              پرطرفدار
            </Badge>
          )}
        </div>

        {/* Food Info */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-800 mb-2">
                {food.name}
              </h1>
              {food.categoryName && (
                <Badge variant="secondary" size="sm">{food.categoryName}</Badge>
              )}
            </div>
            <div className="text-left">
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                {formatPrice(food.price)}
              </p>
            </div>
          </div>

          {food.description && (
            <p className="text-secondary-600 leading-relaxed mb-6">{food.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            {food.preparationTime && (
              <div className="flex items-center gap-2 text-secondary-500">
                <Clock className="w-5 h-5" />
                <span>{toPersianDigits(food.preparationTime)} دقیقه</span>
              </div>
            )}
            {food.calories && (
              <div className="flex items-center gap-2 text-secondary-500">
                <Flame className="w-5 h-5" />
                <span>{toPersianDigits(food.calories)} کالری</span>
              </div>
            )}
            {food.rating && (
              <div className="flex items-center gap-2 text-secondary-500">
                <Star className="w-5 h-5 text-warning-500 fill-warning-500" />
                <span>{toPersianDigits(food.rating.toFixed(1))}</span>
                {food.reviewCount && (
                  <span className="text-secondary-400">
                    ({toPersianDigits(food.reviewCount)} نظر)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Ingredients */}
          {food.ingredients && food.ingredients.length > 0 && (
            <Card variant="outlined" padding="md" className="mb-6">
              <h3 className="font-bold text-secondary-800 mb-3">مواد تشکیل‌دهنده</h3>
              <div className="flex flex-wrap gap-2">
                {food.ingredients.map((ingredient, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Add to Cart */}
        <Card variant="elevated" padding="lg" className="sticky bottom-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-secondary-500 mb-1">قیمت نهایی</p>
              <p className="text-xl font-bold text-primary-600">
                {formatPrice(food.price * Math.max(cartQuantity, 1))}
              </p>
            </div>
            {cartQuantity > 0 ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleUpdateQuantity(-1)}
                  className="w-12 h-12 p-0"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="w-12 text-center text-xl font-bold">
                  {toPersianDigits(cartQuantity)}
                </span>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleUpdateQuantity(1)}
                  className="w-12 h-12 p-0"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={!food.isAvailable}
                rightIcon={<ShoppingCart className="w-5 h-5" />}
              >
                {food.isAvailable ? 'افزودن به سبد خرید' : 'ناموجود'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
