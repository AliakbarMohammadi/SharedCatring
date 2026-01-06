"use client";

import { create } from "zustand";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  addToast: (message, type = "info") => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => get().removeToast(id), 5000);
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));

export function toast(message: string, type?: ToastType) {
  useToastStore.getState().addToast(message, type);
}

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  const typeStyles: Record<ToastType, string> = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg",
            typeStyles[t.type]
          )}
        >
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="hover:opacity-80">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
