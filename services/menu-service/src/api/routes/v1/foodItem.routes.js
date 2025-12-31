const express = require('express');
const router = express.Router();
const foodItemController = require('../../controllers/foodItem.controller');
const {
  validateCreateFoodItem,
  validateUpdateFoodItem,
  validateUpdateAvailability,
  validateUpdatePrices,
  validateCorporatePrice
} = require('../../validators/foodItem.validator');
const { requireAuth, adminOnly, kitchenAccess } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/v1/menu/items:
 *   get:
 *     summary: لیست غذاها
 *     tags: [غذاها]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: شماره صفحه
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: تعداد در صفحه
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: فیلتر بر اساس دسته‌بندی
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *         description: فیلتر موجودی
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: جستجو در نام و توضیحات
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: حداقل قیمت
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: حداکثر قیمت
 *     responses:
 *       200:
 *         description: لیست غذاها
 */
router.get('/', foodItemController.findAll);

/**
 * @swagger
 * /api/v1/menu/items/popular:
 *   get:
 *     summary: غذاهای محبوب
 *     tags: [غذاها]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: تعداد
 *     responses:
 *       200:
 *         description: لیست غذاهای محبوب
 */
router.get('/popular', foodItemController.getPopular);

/**
 * @swagger
 * /api/v1/menu/items/featured:
 *   get:
 *     summary: غذاهای ویژه
 *     tags: [غذاها]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: لیست غذاهای ویژه
 */
router.get('/featured', foodItemController.getFeatured);

/**
 * @swagger
 * /api/v1/menu/items/{id}:
 *   get:
 *     summary: دریافت غذا
 *     tags: [غذاها]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: اطلاعات غذا
 *       404:
 *         description: غذا یافت نشد
 */
router.get('/:id', foodItemController.findById);

/**
 * @swagger
 * /api/v1/menu/items/{id}/nutrition:
 *   get:
 *     summary: اطلاعات تغذیه‌ای غذا
 *     tags: [غذاها]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: اطلاعات تغذیه‌ای
 */
router.get('/:id/nutrition', foodItemController.getNutrition);

/**
 * @swagger
 * /api/v1/menu/items/{id}/prices:
 *   get:
 *     summary: قیمت‌های غذا
 *     tags: [غذاها]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: قیمت‌ها
 */
router.get('/:id/prices', foodItemController.getPrices);

/**
 * @swagger
 * /api/v1/menu/items:
 *   post:
 *     summary: ایجاد غذا
 *     tags: [غذاها]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - categoryId
 *               - pricing
 *             properties:
 *               name:
 *                 type: string
 *                 example: چلوکباب کوبیده
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               pricing:
 *                 type: object
 *                 properties:
 *                   basePrice:
 *                     type: number
 *                     example: 150000
 *     responses:
 *       201:
 *         description: غذا ایجاد شد
 */
router.post('/', requireAuth, adminOnly, validateCreateFoodItem, foodItemController.create);

/**
 * @swagger
 * /api/v1/menu/items/{id}:
 *   put:
 *     summary: ویرایش غذا
 *     tags: [غذاها]
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
 *         description: غذا ویرایش شد
 */
router.put('/:id', requireAuth, adminOnly, validateUpdateFoodItem, foodItemController.update);

/**
 * @swagger
 * /api/v1/menu/items/{id}:
 *   delete:
 *     summary: حذف غذا
 *     tags: [غذاها]
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
 *         description: غذا حذف شد
 */
router.delete('/:id', requireAuth, adminOnly, foodItemController.delete);

/**
 * @swagger
 * /api/v1/menu/items/{id}/availability:
 *   patch:
 *     summary: تغییر موجودی غذا
 *     tags: [غذاها]
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
 *             properties:
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: موجودی تغییر کرد
 */
router.patch('/:id/availability', requireAuth, kitchenAccess, validateUpdateAvailability, foodItemController.updateAvailability);

/**
 * @swagger
 * /api/v1/menu/items/{id}/prices:
 *   put:
 *     summary: ویرایش قیمت‌ها
 *     tags: [غذاها]
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
 *         description: قیمت‌ها ویرایش شد
 */
router.put('/:id/prices', requireAuth, adminOnly, validateUpdatePrices, foodItemController.updatePrices);

/**
 * @swagger
 * /api/v1/menu/items/{id}/prices/corporate:
 *   post:
 *     summary: افزودن قیمت سازمانی
 *     tags: [غذاها]
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
 *             properties:
 *               companyId:
 *                 type: string
 *               price:
 *                 type: number
 *               discountPercentage:
 *                 type: number
 *     responses:
 *       200:
 *         description: قیمت سازمانی اضافه شد
 */
router.post('/:id/prices/corporate', requireAuth, adminOnly, validateCorporatePrice, foodItemController.addCorporatePrice);

module.exports = router;
