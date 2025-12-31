const express = require('express');
const router = express.Router();
const reservationController = require('../../controllers/reservation.controller');
const { validateCreateReservation, validateUpdateReservation } = require('../../validators/reservation.validator');
const { requireAuth } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/v1/orders/reservations:
 *   post:
 *     summary: ایجاد رزرو هفتگی
 *     tags: [رزرو هفتگی]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - weekStartDate
 *               - items
 *             properties:
 *               weekStartDate:
 *                 type: string
 *                 format: date
 *               companyId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     mealType:
 *                       type: string
 *                       enum: [breakfast, lunch, dinner]
 *                     foodId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: رزرو ایجاد شد
 */
router.post('/', requireAuth, validateCreateReservation, reservationController.create);

/**
 * @swagger
 * /api/v1/orders/reservations/current:
 *   get:
 *     summary: رزرو هفتگی جاری
 *     tags: [رزرو هفتگی]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: رزرو هفتگی جاری
 */
router.get('/current', requireAuth, reservationController.getCurrent);

/**
 * @swagger
 * /api/v1/orders/reservations/{id}:
 *   get:
 *     summary: دریافت رزرو
 *     tags: [رزرو هفتگی]
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
 *         description: اطلاعات رزرو
 */
router.get('/:id', requireAuth, reservationController.findById);

/**
 * @swagger
 * /api/v1/orders/reservations/{id}:
 *   put:
 *     summary: ویرایش رزرو هفتگی
 *     tags: [رزرو هفتگی]
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
 *         description: رزرو ویرایش شد
 */
router.put('/:id', requireAuth, validateUpdateReservation, reservationController.update);

/**
 * @swagger
 * /api/v1/orders/reservations/{id}/day/{date}:
 *   delete:
 *     summary: لغو یک روز از رزرو
 *     tags: [رزرو هفتگی]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: روز لغو شد
 */
router.delete('/:id/day/:date', requireAuth, reservationController.cancelDay);

/**
 * @swagger
 * /api/v1/orders/reservations/{id}:
 *   delete:
 *     summary: لغو کامل رزرو
 *     tags: [رزرو هفتگی]
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
 *         description: رزرو لغو شد
 */
router.delete('/:id', requireAuth, reservationController.cancel);

module.exports = router;
