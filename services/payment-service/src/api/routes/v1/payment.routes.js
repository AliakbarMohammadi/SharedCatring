const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment.controller');
const { validateCreatePayment, validateRefund, validateQuery } = require('../../validators/payment.validator');
const { requireAuth, requireAdmin } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/v1/payments/request:
 *   post:
 *     summary: ایجاد درخواست پرداخت
 *     tags: [پرداخت]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 description: شناسه سفارش
 *               invoiceId:
 *                 type: string
 *                 format: uuid
 *                 description: شناسه فاکتور
 *               amount:
 *                 type: number
 *                 minimum: 1000
 *                 description: مبلغ پرداخت (تومان)
 *               gateway:
 *                 type: string
 *                 enum: [zarinpal, idpay]
 *                 default: zarinpal
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: درخواست پرداخت ایجاد شد
 */
router.post('/request', requireAuth, validateCreatePayment, paymentController.createPayment);

/**
 * @swagger
 * /api/v1/payments/verify:
 *   get:
 *     summary: بازگشت از درگاه پرداخت (Callback)
 *     tags: [پرداخت]
 *     parameters:
 *       - in: query
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: Authority
 *         schema:
 *           type: string
 *       - in: query
 *         name: Status
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: ریدایرکت به صفحه نتیجه
 */
router.get('/verify', paymentController.verifyPayment);

/**
 * @swagger
 * /api/v1/payments/verify:
 *   post:
 *     summary: تایید پرداخت (API)
 *     tags: [پرداخت]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *             properties:
 *               paymentId:
 *                 type: string
 *                 format: uuid
 *               Authority:
 *                 type: string
 *               Status:
 *                 type: string
 *     responses:
 *       200:
 *         description: نتیجه تایید پرداخت
 */
router.post('/verify', paymentController.verifyPayment);

/**
 * @swagger
 * /api/v1/payments/history:
 *   get:
 *     summary: تاریخچه پرداخت‌های کاربر
 *     tags: [پرداخت]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, refunded]
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: تاریخچه پرداخت‌ها
 */
router.get('/history', requireAuth, validateQuery, paymentController.getHistory);

/**
 * @swagger
 * /api/v1/payments/tracking/{trackingCode}:
 *   get:
 *     summary: پیگیری پرداخت با کد رهگیری
 *     tags: [پرداخت]
 *     parameters:
 *       - in: path
 *         name: trackingCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: اطلاعات پرداخت
 */
router.get('/tracking/:trackingCode', paymentController.findByTrackingCode);

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   get:
 *     summary: دریافت اطلاعات پرداخت
 *     tags: [پرداخت]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: اطلاعات پرداخت
 */
router.get('/:id', requireAuth, paymentController.findById);

/**
 * @swagger
 * /api/v1/payments/{id}/refund:
 *   post:
 *     summary: درخواست استرداد وجه
 *     tags: [پرداخت]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: دلیل استرداد
 *     responses:
 *       200:
 *         description: درخواست استرداد ثبت شد
 */
router.post('/:id/refund', requireAuth, requireAdmin, validateRefund, paymentController.refund);

module.exports = router;
