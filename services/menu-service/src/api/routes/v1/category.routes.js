const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/category.controller');
const { validateCreateCategory, validateUpdateCategory, validateUpdateOrder } = require('../../validators/category.validator');
const { requireAuth, adminOnly } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/v1/menu/categories:
 *   get:
 *     summary: لیست دسته‌بندی‌ها
 *     tags: [دسته‌بندی‌ها]
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: شامل دسته‌بندی‌های غیرفعال
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: شناسه دسته‌بندی والد
 *     responses:
 *       200:
 *         description: لیست دسته‌بندی‌ها
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get('/', categoryController.findAll);

/**
 * @swagger
 * /api/v1/menu/categories/tree:
 *   get:
 *     summary: درخت دسته‌بندی‌ها
 *     tags: [دسته‌بندی‌ها]
 *     responses:
 *       200:
 *         description: درخت دسته‌بندی‌ها
 */
router.get('/tree', categoryController.getTree);

/**
 * @swagger
 * /api/v1/menu/categories/{id}:
 *   get:
 *     summary: دریافت دسته‌بندی
 *     tags: [دسته‌بندی‌ها]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: اطلاعات دسته‌بندی
 *       404:
 *         description: دسته‌بندی یافت نشد
 */
router.get('/:id', categoryController.findById);

/**
 * @swagger
 * /api/v1/menu/categories:
 *   post:
 *     summary: ایجاد دسته‌بندی
 *     tags: [دسته‌بندی‌ها]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: غذاهای ایرانی
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               parentId:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: دسته‌بندی ایجاد شد
 */
router.post('/', requireAuth, adminOnly, validateCreateCategory, categoryController.create);

/**
 * @swagger
 * /api/v1/menu/categories/{id}:
 *   put:
 *     summary: ویرایش دسته‌بندی
 *     tags: [دسته‌بندی‌ها]
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
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: دسته‌بندی ویرایش شد
 */
router.put('/:id', requireAuth, adminOnly, validateUpdateCategory, categoryController.update);

/**
 * @swagger
 * /api/v1/menu/categories/{id}:
 *   delete:
 *     summary: حذف دسته‌بندی
 *     tags: [دسته‌بندی‌ها]
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
 *         description: دسته‌بندی حذف شد
 */
router.delete('/:id', requireAuth, adminOnly, categoryController.delete);

/**
 * @swagger
 * /api/v1/menu/categories/{id}/order:
 *   patch:
 *     summary: تغییر ترتیب دسته‌بندی
 *     tags: [دسته‌بندی‌ها]
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
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: ترتیب تغییر کرد
 */
router.patch('/:id/order', requireAuth, adminOnly, validateUpdateOrder, categoryController.updateOrder);

module.exports = router;
