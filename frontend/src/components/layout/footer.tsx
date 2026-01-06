import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <span className="text-xl font-bold text-gray-900">کترینگ</span>
            </div>
            <p className="text-sm text-gray-600">
              سامانه جامع سفارش غذا برای سازمان‌ها و افراد
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-gray-900">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/menu" className="hover:text-orange-500">
                  منو غذا
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-orange-500">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-orange-500">
                  تماس با ما
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-orange-500">
                  سوالات متداول
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-gray-900">خدمات</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>سفارش شخصی</li>
              <li>سفارش سازمانی</li>
              <li>رزرو هفتگی</li>
              <li>کیف پول</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-gray-900">تماس با ما</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>۰۲۱-۸۸۸۸۹۹۹۹</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@catering.ir</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>تهران، خیابان ولیعصر</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p>© ۱۴۰۴ کترینگ. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
