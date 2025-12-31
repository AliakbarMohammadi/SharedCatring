const express = require('express');
const router = express.Router();
const menuScheduleController = require('../../controllers/menuSchedule.controller');
const { validateCreateSchedule, validateUpdateSchedule } = require('../../validators/menuSchedule.validator');
const { requireAuth, adminOnly, kitchenAccess } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/v1/menu/daily:
 *   get:
 *     summary: منوی امروز
 *     tags: [برنامه غذایی]
 *     parameters:
 *       - in: query
 *         name: mealType
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner]
 *         description: نوع وعده
 *     responses:
 *       200:
 *         description: منوی امروز
 */
router.get('/daily', menuScheduleController.getTodayMenu);

/**
 * @swagger
 * /api/v1/menu/weekly:
 *   get:
 *     summary: منوی هفتگی
 *     tags: [برنامه غذایی]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: تاریخ شروع هفته
 *     responses:
 *       200:
 *         description: منوی هفتگی
 */
router.get('/weekly', menuScheduleController.getWeeklyMenu);

/**
 * @swagger
 * /api/v1/menu/date/{date}:
 *   get:
 *     summary: منوی تاریخ خاص
 *     tags: [برنامه غذایی]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: تاریخ (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: منوی تاریخ مورد نظر
 */
router.get('/date/:date', menuScheduleController.getByDate);

/**
 * @swagger
 * /api/v1/menu/schedule/{id}:
 *   get:
 *     summary: دریافت برنامه غذایی
 *     tags: [برنامه غذایی]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: اطلاعات برنامه غذایی
 */
router.get('/schedule/:id', menuScheduleController.findById);

/**
 * @swagger
 * /api/v1/menu/schedule:
 *   post:
 *     summary: ایجاد برنامه غذایی
 *     tags: [برنامه غذایی]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - mealType
 *               - items
 *               - orderDeadline
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner]
 *                 example: lunch
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodId:
 *                       type: string
 *                     maxQuantity:
 *                       type: number
 *               orderDeadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: برنامه غذایی ایجاد شد
 */
router.post('/schedule', requireAuth, kitchenAccess, validateCreateSchedule, menuScheduleController.create);

/**
 * @swagger
 * /api/v1/menu/schedule/{id}:
 *   put:
 *     summary: ویرایش برنامه غذایی
 *     tags: [برنامه غذایی]
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
 *         description: برنامه غذایی ویرایش شد
 */
router.put('/schedule/:id', requireAuth, kitchenAccess, validateUpdateSchedule, menuScheduleController.update);

/**
 * @swagger
 * /api/v1/menu/schedule/{id}:
 *   delete:
 *     summary: حذف برنامه غذایی
 *     tags: [برنامه غذایی]
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
 *         description: برنامه غذایی حذف شد
 */
router.delete('/schedule/:id', requireAuth, adminOnly, menuScheduleController.delete);

module.exports = router;
