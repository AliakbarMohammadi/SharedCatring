'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, Star, Clock, TrendingUp, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { menuService } from '@/services/menu.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, toPersianDigits } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch today's menu
  const { data: dailyMenu, isLoading: dailyMenuLoading } = useQuery({
    queryKey: ['menu', 'daily'],
    queryFn: () => menuService.getDailyMenu(),
  });

  // Fetch popular items
  const { data: popularItems, isLoading: popularLoading } = useQuery({
    queryKey: ['menu', 'popular'],
    queryFn: () => menuService.getPopularFoods(8),
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['menu', 'categories'],
    queryFn: menuService.getCategories,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'catering_admin') {
      router.replace('/admin');
      return null;
    } else if (user.role === 'company_admin') {
      router.replace('/company');
      return null;
    } else {
      router.replace('/menu');
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-surface-100">
      {/* Header */}
      <header className="bg-white border-b border-secondary-100 sticky top-0 z-30 backdrop-blur-md bg-white/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🍽️</span>
            <div>
              <h1 className="text-lg font-bold text-secondary-800">سیستم کترینگ</h1>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="md" leftIcon={<LogIn className="w-4 h-4" />}>
                ورود
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary" size="md" leftIcon={<UserPlus className="w-4 h-4" />}>
                ثبت‌نام
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              غذای سالم، کار بهتر
            </h2>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              سفارش آسان غذای روزانه با منوی متنوع و تحویل به موقع
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="جستجوی غذا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pr-6 pl-32 rounded-xl text-secondary-800 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <button
                  type="submit"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  جستجو
                </button>
              </div>
            </form>

            {/* Stats */}
            <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-3xl font-bold">{toPersianDigits('100+')}</div>
                <div className="text-primary-200 text-sm">شرکت فعال</div>
              </div>
              <div className="w-px h-12 bg-primary-400 hidden sm:block" />
              <div className="text-center">
                <div className="text-3xl font-bold">{toPersianDigits('5000+')}</div>
                <div className="text-primary-200 text-sm">کاربر راضی</div>
              </div>
              <div className="w-px h-12 bg-primary-400 hidden sm:block" />
              <div className="text-center">
                <div className="text-3xl font-bold">{toPersianDigits('50+')}</div>
                <div className="text-primary-200 text-sm">غذای متنوع</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Menu */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-secondary-800 mb-1">منوی امروز</h3>
              <p className="text-secondary-500">غذاهای تازه و آماده سفارش</p>
            </div>
            <Link href="/menu">
              <Button variant="ghost" size="md" rightIcon={<ChevronLeft className="w-4 h-4" />}>
                مشاهده همه
              </Button>
            </Link>
          </div>

          {dailyMenuLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
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
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max lg:grid lg:grid-cols-4 lg:min-w-0">
                {dailyMenu?.items?.slice(0, 4).map((item) => {
                  const food = item.food;
                  const foodId = food._id || food.id;
                  const price = food.pricing?.basePrice || food.effectivePrice || food.price;
                  
                  return (
                    <Link key={foodId} href={`/menu/${foodId}`} className="w-64 lg:w-auto">
                      <Card variant="elevated" padding="none" className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-48 bg-secondary-100">
                          {food.image ? (
                            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-secondary-800 mb-1">{food.name}</h4>
                          {food.description && (
                            <p className="text-sm text-secondary-500 line-clamp-2 mb-3">{food.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-primary-600 font-bold">{formatPrice(price)}</span>
                            {food.preparationTime && (
                              <span className="text-xs text-secondary-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {toPersianDigits(food.preparationTime)} دقیقه
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Popular Items */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-secondary-800 mb-1 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-500" />
                غذاهای پرطرفدار
              </h3>
              <p className="text-secondary-500">محبوب‌ترین انتخاب‌های کاربران</p>
            </div>
            <Link href="/menu?popular=true">
              <Button variant="ghost" size="md" rightIcon={<ChevronLeft className="w-4 h-4" />}>
                مشاهده همه
              </Button>
            </Link>
          </div>

          {popularLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} variant="elevated" padding="none">
                  <Skeleton variant="rectangular" className="w-full h-48" />
                  <div className="p-4">
                    <Skeleton variant="text" className="w-3/4 h-5 mb-2" />
                    <Skeleton variant="text" className="w-1/2 h-6" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularItems?.slice(0, 8).map((food) => {
                const foodId = food._id || food.id;
                const price = food.pricing?.basePrice || food.effectivePrice || food.price;
                
                return (
                  <Link key={foodId} href={`/menu/${foodId}`}>
                    <Card variant="elevated" padding="none" className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48 bg-secondary-100">
                        {food.image ? (
                          <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
                        )}
                        {food.rating && (
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                            <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
                            <span className="text-sm font-bold">{toPersianDigits(food.rating.toFixed(1))}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-secondary-800 mb-2">{food.name}</h4>
                        <span className="text-primary-600 font-bold">{formatPrice(price)}</span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-secondary-800 mb-1">دسته‌بندی‌ها</h3>
            <p className="text-secondary-500">انتخاب بر اساس نوع غذا</p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories?.map((category) => {
                const categoryId = category._id || category.id;
                return (
                  <Link key={categoryId} href={`/menu?category=${categoryId}`}>
                    <Card 
                      variant="elevated" 
                      padding="md" 
                      className="text-center hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="text-4xl mb-2">
                        {category.image || '🍽️'}
                      </div>
                      <h4 className="font-bold text-secondary-800">{category.name}</h4>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-secondary-300">© {toPersianDigits('1403')} سیستم کترینگ سازمانی. تمامی حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  );
}
