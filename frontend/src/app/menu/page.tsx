'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Grid3X3, List, Plus, Minus, ShoppingCart } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { menuService, Category, FoodItem } from '@/services/menu.service';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice, toPersianDigits } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { items: cartItems, addItem, updateQuantity } = useCartStore();

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['menu', 'categories'],
    queryFn: menuService.getCategories,
  });

  // Fetch foods
  const { data: foodsData, isLoading: foodsLoading } = useQuery({
    queryKey: ['menu', 'foods', { categoryId: selectedCategory, search: searchQuery }],
    queryFn: () =>
      menuService.getFoods({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
        available: true,
      }),
  });

  const foods = foodsData?.data || [];

  const getCartQuantity = (foodId: string) => {
    const item = cartItems.find((i) => i.foodId === foodId);
    return item?.quantity || 0;
  };

  const handleAddToCart = (food: FoodItem) => {
    addItem({
      foodId: food.id,
      foodName: food.name,
      unitPrice: food.price,
      image: food.image,
    });
    toast.success(`${food.name} به سبد خرید اضافه شد`);
  };

  const handleUpdateQuantity = (foodId: string, delta: number) => {
    const currentQty = getCartQuantity(foodId);
    updateQuantity(foodId, currentQty + delta);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">منوی غذا</h1>
        <p className="text-secondary-500">غذای مورد علاقه خود را انتخاب کنید</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="جستجوی غذا..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            rightIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="md"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-5 h-5" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="md"
            onClick={() => setViewMode('list')}
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          <Button
            variant={selectedCategory === null ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            همه
          </Button>
          {categoriesLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" className="w-20 h-9 rounded-lg" />
            ))
          ) : (
            categories?.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))
          )}
        </div>
      </div>

      {/* Foods Grid/List */}
      {foodsLoading ? (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'
        )}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} variant="elevated" padding="none">
              <Skeleton variant="rectangular" className="w-full h-48" />
              <div className="p-4">
                <Skeleton variant="text" className="w-3/4 h-5 mb-2" />
                <Skeleton variant="text" className="w-full h-4 mb-4" />
                <Skeleton variant="text" className="w-1/2 h-6" />
              </div>
            </Card>
          ))}
        </div>
      ) : foods.length === 0 ? (
        <EmptyState
          icon={<Filter className="w-12 h-12" />}
          title="غذایی یافت نشد"
          description="با تغییر فیلترها یا جستجو، غذای مورد نظر خود را پیدا کنید"
          action={
            <Button variant="primary" onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}>
              پاک کردن فیلترها
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {foods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              cartQuantity={getCartQuantity(food.id)}
              onAdd={() => handleAddToCart(food)}
              onUpdateQuantity={(delta) => handleUpdateQuantity(food.id, delta)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {foods.map((food) => (
            <FoodListItem
              key={food.id}
              food={food}
              cartQuantity={getCartQuantity(food.id)}
              onAdd={() => handleAddToCart(food)}
              onUpdateQuantity={(delta) => handleUpdateQuantity(food.id, delta)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

// Food Card Component
function FoodCard({
  food,
  cartQuantity,
  onAdd,
  onUpdateQuantity,
}: {
  food: FoodItem;
  cartQuantity: number;
  onAdd: () => void;
  onUpdateQuantity: (delta: number) => void;
}) {
  return (
    <Card variant="elevated" padding="none" className="overflow-hidden group">
      <Link href={`/menu/${food.id}`}>
        <div className="relative h-48 bg-secondary-100 overflow-hidden">
          {food.image ? (
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
          )}
          {food.isPopular && (
            <Badge variant="warning" size="sm" className="absolute top-2 right-2">
              پرطرفدار
            </Badge>
          )}
          {!food.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold">ناموجود</span>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/menu/${food.id}`}>
          <h3 className="font-bold text-secondary-800 mb-1 hover:text-primary-600 transition-colors">
            {food.name}
          </h3>
        </Link>
        {food.description && (
          <p className="text-sm text-secondary-500 line-clamp-2 mb-3">{food.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-primary-600 font-bold">{formatPrice(food.price)}</span>
          {cartQuantity > 0 ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateQuantity(-1)}
                className="w-8 h-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-bold">{toPersianDigits(cartQuantity)}</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onUpdateQuantity(1)}
                className="w-8 h-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onAdd}
              disabled={!food.isAvailable}
              rightIcon={<Plus className="w-4 h-4" />}
            >
              افزودن
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Food List Item Component
function FoodListItem({
  food,
  cartQuantity,
  onAdd,
  onUpdateQuantity,
}: {
  food: FoodItem;
  cartQuantity: number;
  onAdd: () => void;
  onUpdateQuantity: (delta: number) => void;
}) {
  return (
    <Card variant="elevated" padding="md">
      <div className="flex gap-4">
        <Link href={`/menu/${food.id}`} className="flex-shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-secondary-100 rounded-lg overflow-hidden">
            {food.image ? (
              <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link href={`/menu/${food.id}`}>
              <h3 className="font-bold text-secondary-800 hover:text-primary-600 transition-colors">
                {food.name}
              </h3>
            </Link>
            {food.isPopular && (
              <Badge variant="warning" size="sm">پرطرفدار</Badge>
            )}
          </div>
          {food.description && (
            <p className="text-sm text-secondary-500 line-clamp-2 mb-3">{food.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-primary-600 font-bold text-lg">{formatPrice(food.price)}</span>
            {cartQuantity > 0 ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onUpdateQuantity(-1)} className="w-8 h-8 p-0">
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-bold">{toPersianDigits(cartQuantity)}</span>
                <Button variant="primary" size="sm" onClick={() => onUpdateQuantity(1)} className="w-8 h-8 p-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button variant="primary" size="sm" onClick={onAdd} disabled={!food.isAvailable} rightIcon={<Plus className="w-4 h-4" />}>
                افزودن
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
