"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import apiClient from "@/lib/api-client";
import { FoodItem, Category } from "@/types";
import { Search, Star, Clock, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const { addItem, openCart } = useCartStore();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get("/menu/categories/tree");
      return res.data.data as Category[];
    },
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["menu-items", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory ? { categoryId: selectedCategory } : {};
      const res = await apiClient.get("/menu/items", { params });
      return res.data.data as FoodItem[];
    },
  });

  const filteredItems = items?.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (item: FoodItem) => {
    addItem({
      foodId: item.id,
      foodName: item.name,
      quantity: 1,
      unitPrice: item.pricing.basePrice,
      imageUrl: item.imageUrl,
    });
    openCart();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">منو غذا</h1>
            <p className="text-gray-600">
              از میان غذاهای متنوع ما انتخاب کنید
            </p>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar - Categories */}
            <aside className="w-full lg:w-64">
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-4 font-semibold text-gray-900">
                    دسته‌بندی‌ها
                  </h3>
                  {categoriesLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-10 animate-pulse rounded-lg bg-gray-200"
                        />
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className={cn(
                            "w-full rounded-lg px-3 py-2 text-right text-sm transition-colors",
                            !selectedCategory
                              ? "bg-orange-50 text-orange-600"
                              : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          همه غذاها
                        </button>
                      </li>
                      {categories?.map((cat) => (
                        <li key={cat.id}>
                          <button
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                              "w-full rounded-lg px-3 py-2 text-right text-sm transition-colors",
                              selectedCategory === cat.id
                                ? "bg-orange-50 text-orange-600"
                                : "text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            {cat.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="جستجوی غذا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              {/* Items Grid */}
              {itemsLoading ? (
                <PageLoader />
              ) : filteredItems?.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  غذایی یافت نشد
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredItems?.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="relative h-48 bg-gray-100">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-6xl">
                            🍽️
                          </div>
                        )}
                        {item.isFeatured && (
                          <Badge className="absolute right-2 top-2">
                            <Star className="ml-1 h-3 w-3" />
                            پیشنهادی
                          </Badge>
                        )}
                        {!item.isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Badge variant="destructive">ناموجود</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="mb-1 font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="mb-3 text-sm text-gray-500 line-clamp-2">
                          {item.description}
                        </p>
                        {item.preparationTime && (
                          <div className="mb-3 flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {item.preparationTime} دقیقه
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-orange-500">
                            {formatPrice(item.pricing.basePrice)}
                          </span>
                          <Button
                            size="sm"
                            disabled={!item.isAvailable}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                          >
                            <Plus className="ml-1 h-4 w-4" />
                            افزودن
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Food Detail Modal */}
      {selectedItem && (
        <FoodDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <Footer />
    </div>
  );
}

function FoodDetailModal({
  item,
  onClose,
  onAddToCart,
}: {
  item: FoodItem;
  onClose: () => void;
  onAddToCart: (item: FoodItem) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCartStore();

  const handleAdd = () => {
    addItem({
      foodId: item.id,
      foodName: item.name,
      quantity,
      unitPrice: item.pricing.basePrice,
      imageUrl: item.imageUrl,
    });
    openCart();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-lg p-2 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 h-48 overflow-hidden rounded-lg bg-gray-100">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">
              🍽️
            </div>
          )}
        </div>

        <h2 className="mb-2 text-xl font-bold text-gray-900">{item.name}</h2>
        <p className="mb-4 text-gray-600">{item.description}</p>

        {item.nutrition && (
          <div className="mb-4 grid grid-cols-4 gap-2 rounded-lg bg-gray-50 p-3">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {item.nutrition.calories}
              </div>
              <div className="text-xs text-gray-500">کالری</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {item.nutrition.protein}g
              </div>
              <div className="text-xs text-gray-500">پروتئین</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {item.nutrition.carbs}g
              </div>
              <div className="text-xs text-gray-500">کربوهیدرات</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {item.nutrition.fat}g
              </div>
              <div className="text-xs text-gray-500">چربی</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
            >
              +
            </button>
          </div>
          <Button onClick={handleAdd} disabled={!item.isAvailable}>
            افزودن - {formatPrice(item.pricing.basePrice * quantity)}
          </Button>
        </div>
      </div>
    </>
  );
}
