const express = require('express');
const router = express.Router();
const walletController = require('../../controllers/wallet.controller');
const { validateDeduct, validateRefund, validateCheckBalance } = require('../../validators/wallet.validator');
const { validateInternalKey } = require('../../middlewares/auth');

/**
 * @swagger
 * /internal/deduct:
 *   post:
 *     summary: کسر از کیف پول (API داخلی)
 *     tags: [API داخلی]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *               balanceType:
 *                 type: string
 *                 enum: [personal, company]
 *               referenceType:
 *                 type: string
 *               referenceId:
 *                 type: string
 *                 format: uuid
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: مبلغ کسر شد
 */
router.post('/deduct', validateInternalKey, validateDeduct, walletController.internalDeduct);

/**
 * @swagger
 * /internal/refund:
 *   post:
 *     summary: برگشت به کیف پول (API داخلی)
 *     tags: [API داخلی]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *               balanceType:
 *                 type: string
 *                 enum: [personal, company]
 *               referenceType:
 *                 type: string
 *               referenceId:
 *                 type: string
 *                 format: uuid
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: مبلغ برگشت داده شد
 */
router.post('/refund', validateInternalKey, validateRefund, walletController.internalRefund);

/**
 * @swagger
 * /internal/check-balance:
 *   post:
 *     summary: بررسی موجودی (API داخلی)
 *     tags: [API داخلی]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *               balanceType:
 *                 type: string
 *                 enum: [personal, company]
 *     responses:
 *       200:
 *         description: نتیجه بررسی موجودی
 */
router.post('/check-balance', validateInternalKey, validateCheckBalance, walletController.internalCheckBalance);

module.exports = router;
