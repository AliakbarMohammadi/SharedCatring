"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  ChefHat,
  Clock,
  Building2,
  Wallet,
  ArrowLeft,
  Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { FoodItem } from "@/types";
import { useCartStore } from "@/stores/cart-store";

export default function HomePage() {
  const { addItem, openCart } = useCartStore();

  const { data: featuredItems } = useQuery({
    queryKey: ["featured-items"],
    queryFn: async () => {
      const res = await apiClient.get("/menu/items/featured");
      return res.data.data as FoodItem[];
    },
  });

  const { data: todayMenu } = useQuery({
    queryKey: ["today-menu"],
    queryFn: async () => {
      const res = await apiClient.get("/menu/daily");
      return res.data.data;
    },
  });

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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-bl from-orange-50 to-white py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4">🎉 تخفیف ویژه اولین سفارش</Badge>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                غذای خوشمزه، تحویل سریع
                <span className="text-orange-500"> به شرکت شما</span>
              </h1>
              <p className="mb-8 text-lg text-gray-600">
                سامانه جامع سفارش غذا برای سازمان‌ها و افراد. با امکان رزرو
                هفتگی، کیف پول و یارانه سازمانی.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/menu">
                  <Button size="lg">
                    مشاهده منو
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" size="lg">
                    ثبت‌نام رایگان
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              چرا کترینگ؟
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: ChefHat,
                  title: "غذای تازه",
                  description: "تهیه شده با مواد اولیه تازه و باکیفیت",
                },
                {
                  icon: Clock,
                  title: "تحویل به موقع",
                  description: "تحویل سر ساعت به محل کار شما",
                },
                {
                  icon: Building2,
                  title: "سفارش سازمانی",
                  description: "مدیریت آسان سفارش‌های شرکتی",
                },
                {
                  icon: Wallet,
                  title: "کیف پول",
                  description: "پرداخت آسان با کیف پول و یارانه",
                },
              ].map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
                      <feature.icon className="h-7 w-7 text-orange-500" />
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Items Section */}
        {featuredItems && featuredItems.length > 0 && (
          <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  غذاهای پیشنهادی
                </h2>
                <Link
                  href="/menu"
                  className="flex items-center text-orange-500 hover:text-orange-600"
                >
                  مشاهده همه
                  <ArrowLeft className="mr-1 h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredItems.slice(0, 4).map((item) => (
                  <Card key={item.id} className="overflow-hidden">
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
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-1 font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="mb-3 text-sm text-gray-500 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-500">
                          {formatPrice(item.pricing.basePrice)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                        >
                          افزودن
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-orange-500 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              آماده سفارش غذای امروز هستید؟
            </h2>
            <p className="mb-8 text-orange-100">
              همین الان ثبت‌نام کنید و از تخفیف ویژه بهره‌مند شوید
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-white text-orange-500 hover:bg-orange-50"
              >
                شروع کنید
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
