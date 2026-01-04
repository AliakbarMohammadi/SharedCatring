const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/order.controller');
const { validateCreateOrder, validateUpdateStatus, validateCancelOrder, validateBulkOrder } = require('../../validators/order.validator');
const { requireAuth, kitchenAccess, companyAdminAccess } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/v1/orders/stats:
 *   get:
 *     summary: آمار سفارشات (ادمین)
 *     tags: [آمار]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: آمار سفارشات
 */
router.get('/stats', requireAuth, orderController.getStats);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: ثبت سفارش جدید
 *     tags: [سفارشات]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - deliveryDate
 *             properties:
 *               orderType:
 *                 type: string
 *                 enum: [personal, corporate]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodId:
 *                       type: string
 *                     foodName:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *               deliveryAddress:
 *                 type: object
 *               promoCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: سفارش ثبت شد
 */
router.post('/', requireAuth, validateCreateOrder, orderController.create);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: لیست سفارشات کاربر
 *     tags: [سفارشات]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: orderType
 *         schema:
 *           type: string
 *           enum: [personal, corporate]
 *     responses:
 *       200:
 *         description: لیست سفارشات
 */
router.get('/', requireAuth, orderController.findAll);

/**
 * @swagger
 * /api/v1/orders/bulk:
 *   post:
 *     summary: ثبت سفارش گروهی
 *     tags: [سفارشات]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - deliveryDate
 *               - orders
 *             properties:
 *               companyId:
 *                 type: string
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *               orders:
 *                 type: array
 *     responses:
 *       201:
 *         description: سفارشات گروهی ثبت شد
 */
router.post('/bulk', requireAuth, companyAdminAccess, validateBulkOrder, orderController.createBulkOrder);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: دریافت جزئیات سفارش
 *     tags: [سفارشات]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: جزئیات سفارش
 */
router.get('/:id', requireAuth, orderController.findById);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     summary: تغییر وضعیت سفارش
 *     tags: [سفارشات]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, preparing, ready, delivered, completed, rejected]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: وضعیت تغییر کرد
 */
router.patch('/:id/status', requireAuth, kitchenAccess, validateUpdateStatus, orderController.updateStatus);

/**
 * @swagger
 * /api/v1/orders/{id}/cancel:
 *   post:
 *     summary: لغو سفارش
 *     tags: [سفارشات]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: سفارش لغو شد
 */
router.post('/:id/cancel', requireAuth, validateCancelOrder, orderController.cancel);

/**
 * @swagger
 * /api/v1/orders/{id}/reorder:
 *   post:
 *     summary: سفارش مجدد
 *     tags: [سفارشات]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: سفارش مجدد ثبت شد
 */
router.post('/:id/reorder', requireAuth, orderController.reorder);

// Kitchen routes
/**
 * @swagger
 * /api/v1/orders/kitchen/today:
 *   get:
 *     summary: سفارشات امروز (آشپزخانه)
 *     tags: [آشپزخانه]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: سفارشات امروز
 */
router.get('/kitchen/today', requireAuth, kitchenAccess, orderController.getTodayOrders);

/**
 * @swagger
 * /api/v1/orders/kitchen/queue:
 *   get:
 *     summary: صف سفارشات (آشپزخانه)
 *     tags: [آشپزخانه]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: صف سفارشات
 */
router.get('/kitchen/queue', requireAuth, kitchenAccess, orderController.getKitchenQueue);

/**
 * @swagger
 * /api/v1/orders/kitchen/summary:
 *   get:
 *     summary: خلاصه آشپزخانه
 *     tags: [آشپزخانه]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: خلاصه سفارشات
 */
router.get('/kitchen/summary', requireAuth, kitchenAccess, orderController.getKitchenSummary);

/**
 * @swagger
 * /api/v1/orders/kitchen/{id}/status:
 *   patch:
 *     summary: تغییر وضعیت سفارش (آشپزخانه)
 *     tags: [آشپزخانه]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: وضعیت تغییر کرد
 */
router.patch('/kitchen/:id/status', requireAuth, kitchenAccess, validateUpdateStatus, orderController.updateKitchenStatus);

// Company routes
/**
 * @swagger
 * /api/v1/orders/company/{companyId}:
 *   get:
 *     summary: سفارشات شرکت
 *     tags: [سفارشات شرکت]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: سفارشات شرکت
 */
router.get('/company/:companyId', requireAuth, companyAdminAccess, orderController.getCompanyOrders);

/**
 * @swagger
 * /api/v1/orders/company/{companyId}/summary:
 *   get:
 *     summary: خلاصه سفارشات شرکت
 *     tags: [سفارشات شرکت]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: خلاصه سفارشات
 */
router.get('/company/:companyId/summary', requireAuth, companyAdminAccess, orderController.getCompanySummary);

module.exports = router;
