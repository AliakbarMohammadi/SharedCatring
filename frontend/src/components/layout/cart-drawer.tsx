"use client";

import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotal } =
    useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed left-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">سبد خرید</h2>
          <button
            onClick={closeCart}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
            <p className="text-gray-500">سبد خرید شما خالی است</p>
            <Button onClick={closeCart}>مشاهده منو</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-4 rounded-lg border border-gray-200 p-3"
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.foodName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">
                          🍽️
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h3 className="font-medium text-gray-900">
                        {item.foodName}
                      </h3>
                      <p className="text-sm text-orange-500">
                        {formatPrice(item.unitPrice)}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.foodId, item.quantity - 1)
                            }
                            className="rounded-lg border border-gray-300 p-1 hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.foodId, item.quantity + 1)
                            }
                            className="rounded-lg border border-gray-300 p-1 hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.foodId)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-600">جمع کل:</span>
                <span className="text-lg font-bold text-orange-500">
                  {formatPrice(getTotal())}
                </span>
              </div>
              <Link href="/checkout" onClick={closeCart}>
                <Button className="w-full" size="lg">
                  تکمیل سفارش
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
