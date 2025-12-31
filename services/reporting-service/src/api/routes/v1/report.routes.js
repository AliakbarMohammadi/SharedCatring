const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/report.controller');
const { requireAuth, requireAdmin, requireAdminOrCompanyAdmin, checkCompanyAccess } = require('../../middlewares/auth');
const {
  validateDateRange,
  validateDailyReport,
  validateMonthlyReport,
  validatePopularItems,
  validateExport,
  validateCompanyId
} = require('../../validators/report.validator');

/**
 * @swagger
 * /api/v1/reports/dashboard:
 *   get:
 *     summary: داشبورد مدیریتی
 *     description: نمایش متریک‌های کلی سیستم شامل سفارشات امروز، درآمد، سفارشات در انتظار و کاربران فعال
 *     tags: [گزارشات]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: داشبورد با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       example: "۱۴۰۳/۱۰/۱۱"
 *                     metrics:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: "داشبورد با موفقیت دریافت شد"
 *       401:
 *         description: عدم احراز هویت
 *       403:
 *         description: عدم دسترسی
 */
router.get('/dashboard', requireAuth, requireAdmin, reportController.getDashboard);

/**
 * @swagger
 * /api/v1/reports/orders/daily:
 *   get:
 *     summary: گزارش سفارشات روزانه
 *     description: گزارش تفصیلی سفارشات یک روز مشخص
 *     tags: [گزارشات]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: تاریخ گزارش (پیش‌فرض امروز)
 *         example: "2024-01-15"
 *     responses:
 *       200:
 *         description: گزارش روزانه با موفقیت دریافت شد
 *       400:
 *         description: پارامترهای نامعتبر
 *       401:
 *         description: عدم احراز هویت
 */
router.get('/orders/daily', requireAuth, requireAdmin, validateDailyReport, reportController.getDailyReport);

/**
 * @swagger
 * /api/v1/reports/orders/monthly:
 *   get:
 *     summary: گزارش سفارشات ماهانه
 *     description: گزارش تفصیلی سفارشات یک ماه شمسی
 *     tags: [گزارشات]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: سال شمسی (پیش‌فرض سال جاری)
 *         example: 1403
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: ماه شمسی (پیش‌فرض ماه جاری)
 *         example: 10
 *     responses:
 *       200:
 *         description: گزارش ماهانه با موفقیت دریافت شد
 *       400:
 *         description: پارامترهای نامعتبر
 *       401:
 *         description: عدم احراز هویت
 */
router.get('/orders/monthly', requireAuth, requireAdmin, validateMonthlyReport, reportController.getMonthlyReport);

/**
 * @swagger
 * /api/v1/reports/revenue:
 *   get:
 *     summary: گزارش درآمد
 *     description: گزارش درآمد در بازه زمانی مشخص با امکان گروه‌بندی
 *     tags: [گزارشات]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: تاریخ شروع
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: تاریخ پایان
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *         description: نحوه گروه‌بندی
 *     responses:
 *       200:
 *         description: گزارش درآمد با موفقیت دریافت شد
 *       400:
 *         description: پارامترهای نامعتبر
 *       401:
 *         description: عدم احراز هویت
 */
router.get('/revenue', requireAuth, requireAdmin, validateDateRange, reportController.getRevenueReport);

/**
 * @swagger
 * /api/v1/reports/company/{id}/consumption:
 *   get:
 *     summary: گزارش مصرف شرکت
 *     description: گزارش مصرف و یارانه یک شرکت در بازه زمانی مشخص
 *     tags: [گزارشات]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: شناسه شرکت
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: تاریخ شروع
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: تاریخ پایان
 *     responses:
 *       200:
 *         description: گزارش مصرف شرکت با موفقیت دریافت شد
 *       400:
 *         description: پارامترهای نامعتبر
 *       401:
 *         description: عدم احراز هویت
 *       403:
 *         description: عدم دسترسی به اطلاعات شرکت
 */
router.get(
  '/company/:id/consumption',
  requireAuth,
  requireAdminOrCompanyAdmin,
  validateCompanyId,
  validateDateRange,
  checkCompanyAccess,
  reportController.getCompanyConsumption
);

/**
 * @swagger
 * /api/v1/reports/popular-items:
 *   get:
 *     summary: غذاهای پرطرفدار
 *     description: لیست پرفروش‌ترین غذاها در بازه زمانی مشخص
 *     tags: [گزارشات]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: تعداد آیتم‌ها
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: تاریخ شروع
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: تاریخ پایان
 *     responses:
 *       200:
 *         description: غذاهای پرطرفدار با موفقیت دریافت شد
 *       400:
 *         description: پارامترهای نامعتبر
 *       401:
 *         description: عدم احراز هویت
 */
router.get('/popular-items', requireAuth, requireAdmin, validatePopularItems, reportController.getPopularItems);

/**
 * @swagger
 * /api/v1/reports/export:
 *   get:
 *     summary: خروجی Excel
 *     description: دانلود گزارش در قالب فایل Excel
 *     tags: [گزارشات]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [daily, monthly, revenue, company, popular]
 *         description: نوع گزارش
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: تاریخ (برای گزارش روزانه)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: سال شمسی (برای گزارش ماهانه)
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: ماه شمسی (برای گزارش ماهانه)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: تاریخ شروع
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: تاریخ پایان
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: شناسه شرکت (برای گزارش مصرف شرکت)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: تعداد (برای غذاهای پرطرفدار)
 *     responses:
 *       200:
 *         description: فایل Excel
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: پارامترهای نامعتبر
 *       401:
 *         description: عدم احراز هویت
 */
router.get('/export', requireAuth, requireAdminOrCompanyAdmin, validateExport, reportController.exportReport);

module.exports = router;
