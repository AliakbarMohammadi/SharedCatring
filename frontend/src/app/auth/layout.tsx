import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2">
            <span className="text-3xl">🍽️</span>
            <span className="text-2xl font-bold text-gray-900">کترینگ</span>
          </Link>
          {children}
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600">
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <h2 className="mb-4 text-4xl font-bold">خوش آمدید</h2>
            <p className="max-w-md text-center text-lg text-orange-100">
              با ثبت‌نام در سامانه کترینگ، از امکانات ویژه سفارش غذا برای خود و
              سازمانتان بهره‌مند شوید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
