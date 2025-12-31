const { fileService } = require('../../services');
const logger = require('../../utils/logger');

class FileController {
  /**
   * POST /api/v1/files/upload
   * آپلود فایل
   */
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ERR_NO_FILE',
            message: 'فایلی برای آپلود ارسال نشده است',
            details: [],
            timestamp: new Date().toISOString()
          }
        });
      }

      const result = await fileService.uploadFile(req.file, {
        userId: req.user.id,
        companyId: req.user.companyId,
        isPublic: req.body.isPublic === 'true' || req.body.isPublic === true,
        referenceType: req.body.referenceType,
        referenceId: req.body.referenceId
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'فایل با موفقیت آپلود شد'
      });
    } catch (error) {
      logger.error('خطا در آپلود فایل', { error: error.message });
      next(error);
    }
  }

  /**
   * POST /api/v1/files/bulk-upload
   * آپلود دسته‌ای
   */
  async bulkUpload(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ERR_NO_FILES',
            message: 'فایلی برای آپلود ارسال نشده است',
            details: [],
            timestamp: new Date().toISOString()
          }
        });
      }

      const { results, errors } = await fileService.uploadFiles(req.files, {
        userId: req.user.id,
        companyId: req.user.companyId,
        isPublic: req.body.isPublic === 'true' || req.body.isPublic === true,
        referenceType: req.body.referenceType,
        referenceId: req.body.referenceId
      });

      res.status(201).json({
        success: true,
        data: {
          uploaded: results,
          failed: errors,
          summary: {
            total: req.files.length,
            successful: results.length,
            failed: errors.length
          }
        },
        message: `${results.length} فایل از ${req.files.length} فایل با موفقیت آپلود شد`
      });
    } catch (error) {
      logger.error('خطا در آپلود دسته‌ای', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/files/:id
   * دانلود فایل
   */
  async downloadFile(req, res, next) {
    try {
      const { id } = req.params;
      const { stream, mimeType, fileName, size } = await fileService.getFileContent(id);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
      res.setHeader('Content-Length', size);

      stream.pipe(res);
    } catch (error) {
      logger.error('خطا در دانلود فایل', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/files/:id/info
   * اطلاعات فایل
   */
  async getFileInfo(req, res, next) {
    try {
      const { id } = req.params;
      const file = await fileService.getFileById(id, req.user.id);

      res.json({
        success: true,
        data: file,
        message: 'اطلاعات فایل دریافت شد'
      });
    } catch (error) {
      logger.error('خطا در دریافت اطلاعات فایل', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/files/:id/url
   * دریافت URL فایل
   */
  async getFileUrl(req, res, next) {
    try {
      const { id } = req.params;
      const url = await fileService.getFileUrl(id);

      res.json({
        success: true,
        data: { url },
        message: 'لینک فایل دریافت شد'
      });
    } catch (error) {
      logger.error('خطا در دریافت URL فایل', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/files/:id/thumbnail
   * تصویر بندانگشتی
   */
  async getThumbnail(req, res, next) {
    try {
      const { id } = req.params;
      const { stream, mimeType, fileName } = await fileService.getThumbnailContent(id);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`);

      stream.pipe(res);
    } catch (error) {
      logger.error('خطا در دریافت تامبنیل', { error: error.message });
      next(error);
    }
  }

  /**
   * DELETE /api/v1/files/:id
   * حذف فایل
   */
  async deleteFile(req, res, next) {
    try {
      const { id } = req.params;
      await fileService.deleteFile(id, req.user.id);

      res.json({
        success: true,
        data: null,
        message: 'فایل با موفقیت حذف شد'
      });
    } catch (error) {
      logger.error('خطا در حذف فایل', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/files
   * لیست فایل‌های کاربر
   */
  async getUserFiles(req, res, next) {
    try {
      const { page, limit, category } = req.query;
      const result = await fileService.getUserFiles(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        category
      });

      res.json({
        success: true,
        data: result,
        message: 'لیست فایل‌ها دریافت شد'
      });
    } catch (error) {
      logger.error('خطا در دریافت لیست فایل‌ها', { error: error.message });
      next(error);
    }
  }
}

module.exports = new FileController();
