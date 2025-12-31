const express = require('express');
const router = express.Router();
const walletController = require('../../controllers/wallet.controller');
const { 
  validateTopup, 
  validateCompanyTopup, 
  validateAllocate, 
  validateQuery 
} = require('../../validators/wallet.validator');
const { requireAuth, companyAdminAccess } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/v1/wallets/balance:
 *   get:
 *     summary: دریافت موجودی کیف پول
 *     tags: [کیف پول کاربر]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: موجودی کیف پول
 */
router.get('/balance', requireAuth, walletController.getBalance);

/**
 * @swagger
 * /api/v1/wallets/transactions:
 *   get:
 *     summary: تاریخچه تراکنش‌ها
 *     tags: [کیف پول کاربر]
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
 *           enum: [topup_personal, topup_company, subsidy_allocation, order_payment, order_refund]
 *       - in: query
 *         name: balanceType
 *         schema:
 *           type: string
 *           enum: [personal, company]
 *     responses:
 *       200:
 *         description: لیست تراکنش‌ها
 */
router.get('/transactions', requireAuth, validateQuery, walletController.getTransactions);

/**
 * @swagger
 * /api/v1/wallets/topup:
 *   post:
 *     summary: شارژ کیف پول شخصی
 *     tags: [کیف پول کاربر]
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
 *               amount:
 *                 type: number
 *                 minimum: 10000
 *                 description: مبلغ شارژ (تومان)
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: کیف پول شارژ شد
 */
router.post('/topup', requireAuth, validateTopup, walletController.topup);

// Company wallet routes
/**
 * @swagger
 * /api/v1/wallets/company/{companyId}:
 *   get:
 *     summary: دریافت اطلاعات حساب شرکت
 *     tags: [کیف پول شرکت]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: اطلاعات حساب شرکت
 */
router.get('/company/:companyId', requireAuth, companyAdminAccess, walletController.getCompanyPool);

/**
 * @swagger
 * /api/v1/wallets/company/{companyId}/topup:
 *   post:
 *     summary: شارژ حساب شرکت
 *     tags: [کیف پول شرکت]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
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
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 10000
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: حساب شرکت شارژ شد
 */
router.post('/company/:companyId/topup', requireAuth, companyAdminAccess, validateCompanyTopup, walletController.topupCompany);

/**
 * @swagger
 * /api/v1/wallets/company/{companyId}/allocate:
 *   post:
 *     summary: تخصیص یارانه به کارمند
 *     tags: [کیف پول شرکت]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
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
 *               - employeeUserId
 *               - amount
 *             properties:
 *               employeeUserId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *                 minimum: 1000
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: یارانه تخصیص داده شد
 */
router.post('/company/:companyId/allocate', requireAuth, companyAdminAccess, validateAllocate, walletController.allocateSubsidy);

/**
 * @swagger
 * /api/v1/wallets/company/{companyId}/employees:
 *   get:
 *     summary: لیست کیف پول کارمندان
 *     tags: [کیف پول شرکت]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: لیست کیف پول کارمندان
 */
router.get('/company/:companyId/employees', requireAuth, companyAdminAccess, validateQuery, walletController.getCompanyEmployees);

module.exports = router;
