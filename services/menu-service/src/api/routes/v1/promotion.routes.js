const express = require('express');
const router = express.Router();
const promotionController = require('../../controllers/promotion.controller');
const { validateCreatePromotion, validateUpdatePromotion, validatePromotion } = require('../../validators/promotion.validator');
const { requireAuth, adminOnly } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/v1/menu/promotions:
 *   get:
 *     summary: لیست تخفیف‌ها
 *     tags: [تخفیف‌ها]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: includeExpired
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: لیست تخفیف‌ها
 */
router.get('/', requireAuth, adminOnly, promotionController.findAll);

/**
 * @swagger
 * /api/v1/menu/promotions/{id}:
 *   get:
 *     summary: دریافت تخفیف
 *     tags: [تخفیف‌ها]
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
 *         description: اطلاعات تخفیف
 */
router.get('/:id', requireAuth, adminOnly, promotionController.findById);

/**
 * @swagger
 * /api/v1/menu/promotions:
 *   post:
 *     summary: ایجاد تخفیف
 *     tags: [تخفیف‌ها]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - type
 *               - value
 *               - startDate
 *               - endDate
 *             properties:
 *               code:
 *                 type: string
 *                 example: NEWYEAR20
 *               name:
 *                 type: string
 *                 example: تخفیف سال نو
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               value:
 *                 type: number
 *                 example: 20
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: تخفیف ایجاد شد
 */
router.post('/', requireAuth, adminOnly, validateCreatePromotion, promotionController.create);

/**
 * @swagger
 * /api/v1/menu/promotions/validate:
 *   post:
 *     summary: اعتبارسنجی کد تخفیف
 *     tags: [تخفیف‌ها]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - orderAmount
 *             properties:
 *               code:
 *                 type: string
 *                 example: NEWYEAR20
 *               orderAmount:
 *                 type: number
 *                 example: 500000
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: نتیجه اعتبارسنجی
 */
router.post('/validate', validatePromotion, promotionController.validate);

/**
 * @swagger
 * /api/v1/menu/promotions/{id}:
 *   put:
 *     summary: ویرایش تخفیف
 *     tags: [تخفیف‌ها]
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
 *         description: تخفیف ویرایش شد
 */
router.put('/:id', requireAuth, adminOnly, validateUpdatePromotion, promotionController.update);

/**
 * @swagger
 * /api/v1/menu/promotions/{id}:
 *   delete:
 *     summary: حذف تخفیف
 *     tags: [تخفیف‌ها]
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
 *         description: تخفیف حذف شد
 */
router.delete('/:id', requireAuth, adminOnly, promotionController.delete);

module.exports = router;
