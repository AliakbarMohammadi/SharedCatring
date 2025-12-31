const express = require('express');
const router = express.Router();
const fileController = require('../../controllers/file.controller');
const { requireAuth } = require('../../middlewares/auth');
const { uploadSingle, uploadMultiple } = require('../../middlewares/upload');
const { validateUpload, validateFileId, validateQuery } = require('../../validators/file.validator');

/**
 * @swagger
 * /api/v1/files:
 *   get:
 *     summary: لیست فایل‌های کاربر
 *     description: دریافت لیست فایل‌های آپلود شده توسط کاربر
 *     tags: [فایل‌ها]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: شماره صفحه
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: تعداد در هر صفحه
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [image, document, spreadsheet, other]
 *         description: دسته‌بندی فایل
 *     responses:
 *       200:
 *         description: لیست فایل‌ها
 *       401:
 *         description: عدم احراز هویت
 */
router.get('/', requireAuth, validateQuery, fileController.getUserFiles);

/**
 * @swagger
 * /api/v1/files/upload:
 *   post:
 *     summary: آپلود فایل
 *     description: آپلود یک فایل جدید
 *     tags: [فایل‌ها]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: فایل برای آپلود
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *                 description: آیا فایل عمومی باشد؟
 *               referenceType:
 *                 type: string
 *                 description: نوع مرجع (مثلاً menu, company)
 *               referenceId:
 *                 type: string
 *                 format: uuid
 *                 description: شناسه مرجع
 *     responses:
 *       201:
 *         description: فایل آپلود شد
 *       400:
 *         description: خطا در آپلود
 *       401:
 *         description: عدم احراز هویت
 */
router.post('/upload', requireAuth, uploadSingle, validateUpload, fileController.uploadFile);

/**
 * @swagger
 * /api/v1/files/bulk-upload:
 *   post:
 *     summary: آپلود دسته‌ای
 *     description: آپلود چندین فایل به صورت همزمان (حداکثر ۱۰ فایل)
 *     tags: [فایل‌ها]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: فایل‌ها برای آپلود
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *               referenceType:
 *                 type: string
 *               referenceId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: فایل‌ها آپلود شدند
 *       400:
 *         description: خطا در آپلود
 *       401:
 *         description: عدم احراز هویت
 */
router.post('/bulk-upload', requireAuth, uploadMultiple, validateUpload, fileController.bulkUpload);

/**
 * @swagger
 * /api/v1/files/{id}:
 *   get:
 *     summary: دانلود فایل
 *     description: دانلود محتوای فایل
 *     tags: [فایل‌ها]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: شناسه فایل
 *     responses:
 *       200:
 *         description: محتوای فایل
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: فایل یافت نشد
 *       401:
 *         description: عدم احراز هویت
 */
router.get('/:id', requireAuth, validateFileId, fileController.downloadFile);

/**
 * @swagger
 * /api/v1/files/{id}/info:
 *   get:
 *     summary: اطلاعات فایل
 *     description: دریافت اطلاعات و متادیتای فایل
 *     tags: [فایل‌ها]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: شناسه فایل
 *     responses:
 *       200:
 *         description: اطلاعات فایل
 *       404:
 *         description: فایل یافت نشد
 *       401:
 *         description: عدم احراز هویت
 */
router.get('/:id/info', requireAuth, validateFileId, fileController.getFileInfo);

/**
 * @swagger
 * /api/v1/files/{id}/url:
 *   get:
 *     summary: دریافت URL فایل
 *     description: دریافت لینک مستقیم یا امضا شده فایل
 *     tags: [فایل‌ها]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: شناسه فایل
 *     responses:
 *       200:
 *         description: URL فایل
 *       404:
 *         description: فایل یافت نشد
 *       401:
 *         description: عدم احراز هویت
 */
router.get('/:id/url', requireAuth, validateFileId, fileController.getFileUrl);

/**
 * @swagger
 * /api/v1/files/{id}/thumbnail:
 *   get:
 *     summary: تصویر بندانگشتی
 *     description: دریافت تامبنیل تصویر
 *     tags: [تصاویر]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: شناسه فایل
 *     responses:
 *       200:
 *         description: تصویر بندانگشتی
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: فایل یا تامبنیل یافت نشد
 *       401:
 *         description: عدم احراز هویت
 */
router.get('/:id/thumbnail', requireAuth, validateFileId, fileController.getThumbnail);

/**
 * @swagger
 * /api/v1/files/{id}:
 *   delete:
 *     summary: حذف فایل
 *     description: حذف فایل از سیستم
 *     tags: [فایل‌ها]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: شناسه فایل
 *     responses:
 *       200:
 *         description: فایل حذف شد
 *       404:
 *         description: فایل یافت نشد
 *       401:
 *         description: عدم احراز هویت
 */
router.delete('/:id', requireAuth, validateFileId, fileController.deleteFile);

module.exports = router;
