const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cart.controller');
const { validateAddItem, validateUpdateItem } = require('../../validators/cart.validator');
const { requireAuth } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/v1/orders/cart:
 *   get:
 *     summary: دریافت سبد خرید
 *     tags: [سبد خرید]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: سبد خرید کاربر
 */
router.get('/', requireAuth, cartController.getCart);

/**
 * @swagger
 * /api/v1/orders/cart/items:
 *   post:
 *     summary: افزودن آیتم به سبد خرید
 *     tags: [سبد خرید]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - foodId
 *               - foodName
 *               - quantity
 *               - unitPrice
 *             properties:
 *               foodId:
 *                 type: string
 *                 format: uuid
 *               foodName:
 *                 type: string
 *                 example: چلوکباب کوبیده
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               unitPrice:
 *                 type: number
 *                 example: 150000
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: آیتم اضافه شد
 */
router.post('/items', requireAuth, validateAddItem, cartController.addItem);

/**
 * @swagger
 * /api/v1/orders/cart/items/{id}:
 *   put:
 *     summary: ویرایش آیتم سبد خرید
 *     tags: [سبد خرید]
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
 *             properties:
 *               quantity:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: آیتم ویرایش شد
 */
router.put('/items/:id', requireAuth, validateUpdateItem, cartController.updateItem);

/**
 * @swagger
 * /api/v1/orders/cart/items/{id}:
 *   delete:
 *     summary: حذف آیتم از سبد خرید
 *     tags: [سبد خرید]
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
 *         description: آیتم حذف شد
 */
router.delete('/items/:id', requireAuth, cartController.removeItem);

/**
 * @swagger
 * /api/v1/orders/cart:
 *   delete:
 *     summary: خالی کردن سبد خرید
 *     tags: [سبد خرید]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: سبد خرید خالی شد
 */
router.delete('/', requireAuth, cartController.clearCart);

module.exports = router;
