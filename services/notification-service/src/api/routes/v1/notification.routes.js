const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notification.controller');
const { validateSendNotification, validateUpdatePreferences, validateQuery } = require('../../validators/notification.validator');
const { requireAuth, requireAdmin } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: لیست اعلان‌های کاربر
 *     tags: [اعلان‌ها]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [email, sms, push, in_app]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, failed, read]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [order, payment, wallet, company, system, promotion]
 *     responses:
 *       200:
 *         description: لیست اعلان‌ها
 */
router.get('/', requireAuth, validateQuery, notificationController.getNotifications);

/**
 * @swagger
 * /api/v1/notifications/unread-count:
 *   get:
 *     summary: تعداد اعلان‌های خوانده نشده
 *     tags: [اعلان‌ها]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تعداد اعلان‌های خوانده نشده
 */
router.get('/unread-count', requireAuth, notificationController.getUnreadCount);

/**
 * @swagger
 * /api/v1/notifications/preferences:
 *   get:
 *     summary: دریافت تنظیمات اعلان
 *     tags: [تنظیمات]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تنظیمات اعلان کاربر
 */
router.get('/preferences', requireAuth, notificationController.getPreferences);

/**
 * @swagger
 * /api/v1/notifications/preferences:
 *   put:
 *     summary: به‌روزرسانی تنظیمات اعلان
 *     tags: [تنظیمات]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   address:
 *                     type: string
 *               sms:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   phone:
 *                     type: string
 *               categories:
 *                 type: object
 *                 properties:
 *                   order:
 *                     type: boolean
 *                   payment:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: تنظیمات به‌روزرسانی شد
 */
router.put('/preferences', requireAuth, validateUpdatePreferences, notificationController.updatePreferences);

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   patch:
 *     summary: خوانده شدن همه اعلان‌ها
 *     tags: [اعلان‌ها]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: همه اعلان‌ها خوانده شدند
 */
router.patch('/read-all', requireAuth, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: علامت‌گذاری به عنوان خوانده شده
 *     tags: [اعلان‌ها]
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
 *         description: اعلان خوانده شد
 */
router.patch('/:id/read', requireAuth, notificationController.markAsRead);

/**
 * @swagger
 * /api/v1/notifications/send:
 *   post:
 *     summary: ارسال اعلان دستی (ادمین)
 *     tags: [مدیریت]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - title
 *               - body
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [email, sms, push, in_app]
 *               category:
 *                 type: string
 *                 enum: [order, payment, wallet, company, system, promotion]
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               templateName:
 *                 type: string
 *               variables:
 *                 type: object
 *               recipient:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *     responses:
 *       201:
 *         description: اعلان ارسال شد
 */
router.post('/send', requireAuth, requireAdmin, validateSendNotification, notificationController.sendNotification);

module.exports = router;
