'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <span className="text-4xl">🍽️</span>
            <div>
              <h1 className="text-2xl font-bold text-secondary-800">سیستم کترینگ</h1>
              <p className="text-sm text-secondary-500">سفارش غذای سازمانی</p>
            </div>
          </Link>

          {children}
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center p-12">
        <div className="text-center text-white max-w-lg">
          <div className="text-8xl mb-8">🍱</div>
          <h2 className="text-3xl font-bold mb-4">غذای سالم، کار بهتر</h2>
          <p className="text-lg text-primary-100 leading-relaxed">
            با سیستم کترینگ سازمانی، سفارش غذای روزانه را به سادگی انجام دهید.
            منوی متنوع، تحویل به موقع، و مدیریت یارانه سازمانی.
          </p>
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold">۱۰۰+</div>
              <div className="text-primary-200 text-sm">شرکت فعال</div>
            </div>
            <div className="w-px h-12 bg-primary-400" />
            <div className="text-center">
              <div className="text-4xl font-bold">۵۰۰۰+</div>
              <div className="text-primary-200 text-sm">کاربر راضی</div>
            </div>
            <div className="w-px h-12 bg-primary-400" />
            <div className="text-center">
              <div className="text-4xl font-bold">۵۰+</div>
              <div className="text-primary-200 text-sm">غذای متنوع</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
