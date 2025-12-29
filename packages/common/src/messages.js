// Persian (Farsi) Messages - پیام‌های فارسی

const messages = {
  // Success Messages
  success: {
    general: 'عملیات با موفقیت انجام شد',
    created: 'با موفقیت ایجاد شد',
    updated: 'با موفقیت به‌روزرسانی شد',
    deleted: 'با موفقیت حذف شد',
    fetched: 'اطلاعات با موفقیت دریافت شد'
  },

  // Auth Messages
  auth: {
    loginSuccess: 'ورود با موفقیت انجام شد',
    logoutSuccess: 'خروج با موفقیت انجام شد',
    registerSuccess: 'ثبت‌نام با موفقیت انجام شد',
    passwordChanged: 'رمز عبور با موفقیت تغییر کرد',
    passwordResetSent: 'لینک بازیابی رمز عبور ارسال شد',
    otpSent: 'کد تأیید ارسال شد',
    otpVerified: 'کد تأیید با موفقیت تأیید شد',
    tokenRefreshed: 'توکن با موفقیت تمدید شد',
    invalidCredentials: 'نام کاربری یا رمز عبور اشتباه است',
    tokenExpired: 'توکن منقضی شده است. لطفاً دوباره وارد شوید',
    tokenInvalid: 'توکن نامعتبر است',
    refreshTokenExpired: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید',
    accountDisabled: 'حساب کاربری شما غیرفعال شده است',
    accountLocked: 'حساب کاربری شما قفل شده است',
    passwordWeak: 'رمز عبور ضعیف است. لطفاً رمز عبور قوی‌تری انتخاب کنید',
    otpInvalid: 'کد تأیید نامعتبر است',
    otpExpired: 'کد تأیید منقضی شده است',
    unauthorized: 'برای دسترسی به این بخش باید وارد شوید',
    forbidden: 'شما اجازه دسترسی به این بخش را ندارید'
  },

  // User Messages
  user: {
    created: 'کاربر با موفقیت ایجاد شد',
    updated: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد',
    deleted: 'کاربر با موفقیت حذف شد',
    notFound: 'کاربر یافت نشد',
    alreadyExists: 'کاربر با این مشخصات قبلاً ثبت شده است',
    emailExists: 'این ایمیل قبلاً ثبت شده است',
    phoneExists: 'این شماره تلفن قبلاً ثبت شده است',
    invalidStatus: 'وضعیت کاربر نامعتبر است',
    profileUpdated: 'پروفایل با موفقیت به‌روزرسانی شد',
    avatarUpdated: 'تصویر پروفایل با موفقیت به‌روزرسانی شد'
  },

  // Company Messages
  company: {
    created: 'شرکت با موفقیت ایجاد شد',
    updated: 'اطلاعات شرکت با موفقیت به‌روزرسانی شد',
    deleted: 'شرکت با موفقیت حذف شد',
    notFound: 'شرکت یافت نشد',
    alreadyExists: 'شرکت با این مشخصات قبلاً ثبت شده است',
    invalidStatus: 'وضعیت شرکت نامعتبر است',
    subscriptionExpired: 'اشتراک شرکت منقضی شده است',
    employeeAdded: 'کارمند با موفقیت به شرکت اضافه شد',
    employeeRemoved: 'کارمند با موفقیت از شرکت حذف شد'
  },

  // Menu Messages
  menu: {
    created: 'منو با موفقیت ایجاد شد',
    updated: 'منو با موفقیت به‌روزرسانی شد',
    deleted: 'منو با موفقیت حذف شد',
    notFound: 'منو یافت نشد',
    itemNotFound: 'آیتم منو یافت نشد',
    categoryNotFound: 'دسته‌بندی یافت نشد',
    notAvailable: 'این منو در حال حاضر در دسترس نیست',
    outOfStock: 'این آیتم موجود نیست',
    itemAdded: 'آیتم با موفقیت به منو اضافه شد',
    itemRemoved: 'آیتم با موفقیت از منو حذف شد'
  },

  // Order Messages
  order: {
    created: 'سفارش با موفقیت ثبت شد',
    updated: 'سفارش با موفقیت به‌روزرسانی شد',
    cancelled: 'سفارش با موفقیت لغو شد',
    notFound: 'سفارش یافت نشد',
    alreadyCancelled: 'این سفارش قبلاً لغو شده است',
    cannotModify: 'امکان تغییر این سفارش وجود ندارد',
    deadlinePassed: 'مهلت ثبت سفارش به پایان رسیده است',
    invalidStatus: 'وضعیت سفارش نامعتبر است',
    minimumNotMet: 'حداقل مبلغ سفارش رعایت نشده است',
    confirmed: 'سفارش تأیید شد',
    preparing: 'سفارش در حال آماده‌سازی است',
    ready: 'سفارش آماده تحویل است',
    delivered: 'سفارش تحویل داده شد'
  },

  // Payment Messages
  payment: {
    success: 'پرداخت با موفقیت انجام شد',
    failed: 'پرداخت ناموفق بود',
    notFound: 'تراکنش یافت نشد',
    insufficientBalance: 'موجودی کافی نیست',
    invalidMethod: 'روش پرداخت نامعتبر است',
    alreadyProcessed: 'این پرداخت قبلاً پردازش شده است',
    refunded: 'مبلغ با موفقیت بازگردانده شد',
    pending: 'پرداخت در انتظار تأیید است'
  },

  // Wallet Messages
  wallet: {
    created: 'کیف پول با موفقیت ایجاد شد',
    notFound: 'کیف پول یافت نشد',
    alreadyExists: 'کیف پول قبلاً ایجاد شده است',
    insufficientBalance: 'موجودی کیف پول کافی نیست',
    invalidTransaction: 'تراکنش نامعتبر است',
    withdrawalLimitExceeded: 'سقف برداشت روزانه تکمیل شده است',
    credited: 'مبلغ با موفقیت به کیف پول اضافه شد',
    debited: 'مبلغ با موفقیت از کیف پول کسر شد',
    balanceUpdated: 'موجودی کیف پول به‌روزرسانی شد'
  },

  // Invoice Messages
  invoice: {
    created: 'فاکتور با موفقیت ایجاد شد',
    notFound: 'فاکتور یافت نشد',
    alreadyPaid: 'این فاکتور قبلاً پرداخت شده است',
    cancelled: 'فاکتور لغو شده است',
    sent: 'فاکتور با موفقیت ارسال شد',
    paid: 'فاکتور با موفقیت پرداخت شد'
  },

  // File Messages
  file: {
    uploaded: 'فایل با موفقیت آپلود شد',
    deleted: 'فایل با موفقیت حذف شد',
    notFound: 'فایل یافت نشد',
    tooLarge: 'حجم فایل بیش از حد مجاز است',
    invalidType: 'نوع فایل مجاز نیست',
    uploadFailed: 'آپلود فایل ناموفق بود'
  },

  // Notification Messages
  notification: {
    sent: 'اعلان با موفقیت ارسال شد',
    failed: 'ارسال اعلان ناموفق بود',
    read: 'اعلان خوانده شد',
    deleted: 'اعلان حذف شد'
  },

  // Validation Messages
  validation: {
    required: 'این فیلد الزامی است',
    invalidEmail: 'ایمیل نامعتبر است',
    invalidPhone: 'شماره تلفن نامعتبر است',
    invalidFormat: 'فرمت نامعتبر است',
    minLength: 'حداقل طول مجاز رعایت نشده است',
    maxLength: 'حداکثر طول مجاز رعایت نشده است',
    invalidDate: 'تاریخ نامعتبر است',
    invalidNumber: 'عدد نامعتبر است',
    invalidValue: 'مقدار نامعتبر است'
  },

  // General Error Messages
  errors: {
    internal: 'خطای داخلی سرور. لطفاً بعداً تلاش کنید',
    notFound: 'موردی یافت نشد',
    badRequest: 'درخواست نامعتبر است',
    conflict: 'تداخل در داده‌ها وجود دارد',
    rateLimitExceeded: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید',
    serviceUnavailable: 'سرویس در حال حاضر در دسترس نیست'
  }
};

module.exports = messages;
