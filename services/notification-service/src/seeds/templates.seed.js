require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const Template = require('../models/template.model');

const templates = [
  // Email Templates
  {
    name: 'order_created',
    type: 'email',
    category: 'order',
    subject: 'سفارش شما ثبت شد - شماره {{orderNumber}}',
    body: `
      <h2>سفارش شما با موفقیت ثبت شد</h2>
      <p>با سلام،</p>
      <p>سفارش شما با مشخصات زیر ثبت شده است:</p>
      <div class="highlight">
        <p><strong>شماره سفارش:</strong> {{orderNumber}}</p>
        <p><strong>مبلغ کل:</strong> {{totalAmount}} تومان</p>
        <p><strong>تاریخ تحویل:</strong> {{deliveryDate}}</p>
      </div>
      <p>می‌توانید وضعیت سفارش خود را از طریق اپلیکیشن پیگیری کنید.</p>
      <p>با تشکر،<br>تیم کترینگ</p>
    `,
    variables: ['orderNumber', 'totalAmount', 'deliveryDate'],
    isActive: true,
    description: 'ایمیل تایید ثبت سفارش'
  },
  {
    name: 'order_confirmed',
    type: 'email',
    category: 'order',
    subject: 'سفارش {{orderNumber}} تایید شد',
    body: `
      <h2>سفارش شما تایید شد</h2>
      <p>سفارش شماره {{orderNumber}} تایید شد و در حال آماده‌سازی است.</p>
      <p>زمان تحویل: {{deliveryDate}}</p>
    `,
    variables: ['orderNumber', 'deliveryDate'],
    isActive: true,
    description: 'ایمیل تایید سفارش'
  },
  {
    name: 'company_approved',
    type: 'email',
    category: 'company',
    subject: 'شرکت {{companyName}} تایید شد',
    body: `
      <h2>تبریک! شرکت شما تایید شد</h2>
      <p>با سلام،</p>
      <p>شرکت <strong>{{companyName}}</strong> با موفقیت در سیستم کترینگ تایید شد.</p>
      <p>اکنون می‌توانید از تمامی امکانات سازمانی استفاده کنید:</p>
      <ul>
        <li>مدیریت کارمندان</li>
        <li>تخصیص یارانه غذا</li>
        <li>گزارش‌گیری سفارشات</li>
        <li>فاکتور تجمیعی</li>
      </ul>
      <a href="#" class="btn">ورود به پنل مدیریت</a>
    `,
    variables: ['companyName'],
    isActive: true,
    description: 'ایمیل تایید شرکت'
  },
  {
    name: 'payment_success',
    type: 'email',
    category: 'payment',
    subject: 'پرداخت موفق - {{trackingCode}}',
    body: `
      <h2>پرداخت شما با موفقیت انجام شد</h2>
      <div class="highlight">
        <p><strong>کد پیگیری:</strong> {{trackingCode}}</p>
        <p><strong>مبلغ:</strong> {{amount}} تومان</p>
        <p><strong>تاریخ:</strong> {{date}}</p>
      </div>
    `,
    variables: ['trackingCode', 'amount', 'date'],
    isActive: true,
    description: 'ایمیل تایید پرداخت'
  },
  {
    name: 'wallet_low_balance',
    type: 'email',
    category: 'wallet',
    subject: 'هشدار: موجودی کیف پول کم است',
    body: `
      <h2>⚠️ موجودی کیف پول شما کم است</h2>
      <p>موجودی فعلی کیف پول شما: <strong>{{balance}} تومان</strong></p>
      <p>برای ادامه استفاده از خدمات، لطفاً کیف پول خود را شارژ کنید.</p>
      <a href="#" class="btn">شارژ کیف پول</a>
    `,
    variables: ['balance'],
    isActive: true,
    description: 'ایمیل هشدار موجودی کم'
  },

  // SMS Templates
  {
    name: 'order_created_sms',
    type: 'sms',
    category: 'order',
    body: 'سیستم کترینگ\nسفارش {{orderNumber}} ثبت شد.\nمبلغ: {{totalAmount}} تومان',
    variables: ['orderNumber', 'totalAmount'],
    isActive: true,
    description: 'پیامک ثبت سفارش'
  },
  {
    name: 'order_confirmed_sms',
    type: 'sms',
    category: 'order',
    body: 'سیستم کترینگ\nسفارش {{orderNumber}} تایید شد و در حال آماده‌سازی است.',
    variables: ['orderNumber'],
    isActive: true,
    description: 'پیامک تایید سفارش'
  },
  {
    name: 'order_ready_sms',
    type: 'sms',
    category: 'order',
    body: 'سیستم کترینگ\nسفارش {{orderNumber}} آماده تحویل است.',
    variables: ['orderNumber'],
    isActive: true,
    description: 'پیامک آماده تحویل'
  },
  {
    name: 'payment_success_sms',
    type: 'sms',
    category: 'payment',
    body: 'سیستم کترینگ\nپرداخت {{amount}} تومان موفق.\nکد پیگیری: {{trackingCode}}',
    variables: ['amount', 'trackingCode'],
    isActive: true,
    description: 'پیامک تایید پرداخت'
  },
  {
    name: 'otp_sms',
    type: 'sms',
    category: 'system',
    body: 'سیستم کترینگ\nکد تایید: {{code}}\nاین کد تا {{expiry}} دقیقه معتبر است.',
    variables: ['code', 'expiry'],
    isActive: true,
    description: 'پیامک کد تایید'
  }
];

const seedTemplates = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // Clear existing templates
    await Template.deleteMany({});
    console.log('Cleared existing templates');

    // Insert new templates
    await Template.insertMany(templates);
    console.log(`Inserted ${templates.length} templates`);

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
};

seedTemplates();
