const express = require('express');
const router = express.Router();
const invoiceController = require('../../controllers/invoice.controller');
const { validateCreateInvoice, validateUpdateStatus, validateConsolidatedInvoice, validateQuery } = require('../../validators/invoice.validator');
const { requireAuth, requireAdmin, companyAdminAccess } = require('../../middlewares/auth');

/**
 * @swagger
 * /api/v1/invoices:
 *   post:
 *     summary: ایجاد فاکتور جدید
 *     tags: [فاکتورها]
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
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [instant, consolidated, proforma]
 *                 default: instant
 *                 description: نوع فاکتور
 *               companyId:
 *                 type: string
 *                 format: uuid
 *                 description: شناسه شرکت (برای فاکتور سازمانی)
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       format: uuid
 *                     description:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *               discount:
 *                 type: number
 *                 default: 0
 *               taxRate:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               customerName:
 *                 type: string
 *               customerEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: فاکتور ایجاد شد
 */
router.post('/', requireAuth, validateCreateInvoice, invoiceController.create);

/**
 * @swagger
 * /api/v1/invoices:
 *   get:
 *     summary: لیست فاکتورهای کاربر
 *     tags: [فاکتورها]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, issued, sent, paid, cancelled]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [instant, consolidated, proforma]
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
 *         description: لیست فاکتورها
 */
router.get('/', requireAuth, validateQuery, invoiceController.findAll);

/**
 * @swagger
 * /api/v1/invoices/{id}:
 *   get:
 *     summary: دریافت جزئیات فاکتور
 *     tags: [فاکتورها]
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
 *         description: جزئیات فاکتور
 *       404:
 *         description: فاکتور یافت نشد
 */
router.get('/:id', requireAuth, invoiceController.findById);

/**
 * @swagger
 * /api/v1/invoices/number/{invoiceNumber}:
 *   get:
 *     summary: دریافت فاکتور با شماره فاکتور
 *     tags: [فاکتورها]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceNumber
 *         required: true
 *         schema:
 *           type: string
 *         example: INV-1403-0001
 *     responses:
 *       200:
 *         description: جزئیات فاکتور
 */
router.get('/number/:invoiceNumber', requireAuth, invoiceController.findByNumber);

/**
 * @swagger
 * /api/v1/invoices/{id}/status:
 *   patch:
 *     summary: تغییر وضعیت فاکتور
 *     tags: [فاکتورها]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [issued, sent, paid, cancelled]
 *     responses:
 *       200:
 *         description: وضعیت تغییر کرد
 */
router.patch('/:id/status', requireAuth, validateUpdateStatus, invoiceController.updateStatus);

/**
 * @swagger
 * /api/v1/invoices/{id}/pdf:
 *   get:
 *     summary: دریافت لینک PDF فاکتور
 *     tags: [فاکتورها]
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
 *         description: لینک PDF
 */
router.get('/:id/pdf', requireAuth, invoiceController.generatePDF);

/**
 * @swagger
 * /api/v1/invoices/{id}/download:
 *   get:
 *     summary: دانلود PDF فاکتور
 *     tags: [فاکتورها]
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
 *         description: فایل PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:id/download', requireAuth, invoiceController.downloadPDF);

/**
 * @swagger
 * /api/v1/invoices/{id}/send:
 *   post:
 *     summary: ارسال فاکتور به ایمیل مشتری
 *     tags: [فاکتورها]
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
 *         description: فاکتور ارسال شد
 */
router.post('/:id/send', requireAuth, invoiceController.sendInvoice);

// Company routes
/**
 * @swagger
 * /api/v1/invoices/company/{companyId}:
 *   get:
 *     summary: لیست فاکتورهای شرکت
 *     tags: [فاکتورهای شرکت]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: لیست فاکتورهای شرکت
 */
router.get('/company/:companyId', requireAuth, companyAdminAccess, validateQuery, invoiceController.getCompanyInvoices);

/**
 * @swagger
 * /api/v1/invoices/company/consolidated/preview:
 *   post:
 *     summary: پیش‌نمایش فاکتور تجمیعی
 *     tags: [فاکتورهای شرکت]
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
 *               - periodStart
 *               - periodEnd
 *             properties:
 *               companyId:
 *                 type: string
 *                 format: uuid
 *               periodStart:
 *                 type: string
 *                 format: date
 *               periodEnd:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: پیش‌نمایش فاکتور
 */
router.post('/company/consolidated/preview', requireAuth, companyAdminAccess, validateConsolidatedInvoice, invoiceController.previewConsolidated);

/**
 * @swagger
 * /api/v1/invoices/company/consolidated:
 *   post:
 *     summary: ایجاد فاکتور تجمیعی
 *     tags: [فاکتورهای شرکت]
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
 *               - periodStart
 *               - periodEnd
 *             properties:
 *               companyId:
 *                 type: string
 *                 format: uuid
 *               periodStart:
 *                 type: string
 *                 format: date
 *               periodEnd:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: فاکتور تجمیعی ایجاد شد
 */
router.post('/company/consolidated', requireAuth, companyAdminAccess, validateConsolidatedInvoice, invoiceController.generateConsolidated);

module.exports = router;
