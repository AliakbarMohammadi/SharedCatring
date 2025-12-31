const File = require('../models/file.model');
const storageService = require('./storage.service');
const imageService = require('./image.service');
const { generateFileName, isImage, getFileCategory, formatFileSize } = require('../utils/helpers');
const logger = require('../utils/logger');

class FileService {
  /**
   * Upload single file
   */
  async uploadFile(file, options = {}) {
    const { userId, companyId, isPublic = false, referenceType, referenceId } = options;
    
    try {
      const fileName = generateFileName(file.originalname);
      const category = getFileCategory(file.mimetype);
      let buffer = file.buffer;
      let thumbnailPath = null;

      // Optimize image if applicable
      if (isImage(file.mimetype)) {
        buffer = await imageService.optimizeImage(buffer, file.mimetype);
        
        // Generate thumbnail
        try {
          const thumbnailBuffer = await imageService.generateThumbnail(buffer);
          const thumbnailFileName = `thumb_${fileName.replace(/\.[^.]+$/, '.jpg')}`;
          thumbnailPath = await storageService.uploadThumbnail(thumbnailBuffer, thumbnailFileName);
        } catch (error) {
          logger.warn('خطا در ایجاد تامبنیل', { error: error.message });
        }
      }

      // Upload to storage
      const path = await storageService.uploadFile(buffer, fileName, file.mimetype, isPublic);

      // Get image metadata
      let metadata = {};
      if (isImage(file.mimetype)) {
        const imgMeta = await imageService.getMetadata(buffer);
        if (imgMeta) {
          metadata = { ...metadata, ...imgMeta };
        }
      }

      // Save to database
      const fileRecord = await File.create({
        originalName: file.originalname,
        fileName,
        mimeType: file.mimetype,
        size: buffer.length,
        path,
        category,
        isPublic,
        hasThumbnail: !!thumbnailPath,
        thumbnailPath,
        metadata,
        uploadedBy: userId,
        companyId,
        referenceType,
        referenceId
      });

      logger.info('فایل آپلود شد', { fileId: fileRecord.id, fileName });

      return this.formatFileResponse(fileRecord);
    } catch (error) {
      logger.error('خطا در آپلود فایل', { error: error.message });
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files, options = {}) {
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, options);
        results.push(result);
      } catch (error) {
        errors.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    return { results, errors };
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId, userId = null) {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      const error = new Error('فایل یافت نشد');
      error.statusCode = 404;
      error.code = 'ERR_NOT_FOUND';
      throw error;
    }

    return this.formatFileResponse(file);
  }

  /**
   * Get file content
   */
  async getFileContent(fileId) {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      const error = new Error('فایل یافت نشد');
      error.statusCode = 404;
      error.code = 'ERR_NOT_FOUND';
      throw error;
    }

    try {
      const response = await storageService.getFile(file.path);
      return {
        stream: response.Body,
        mimeType: file.mimeType,
        fileName: file.originalName,
        size: file.size
      };
    } catch (error) {
      logger.error('خطا در دریافت محتوای فایل', { error: error.message, fileId });
      throw error;
    }
  }

  /**
   * Get thumbnail content
   */
  async getThumbnailContent(fileId) {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      const error = new Error('فایل یافت نشد');
      error.statusCode = 404;
      error.code = 'ERR_NOT_FOUND';
      throw error;
    }

    if (!file.hasThumbnail || !file.thumbnailPath) {
      const error = new Error('تامبنیل برای این فایل موجود نیست');
      error.statusCode = 404;
      error.code = 'ERR_NO_THUMBNAIL';
      throw error;
    }

    try {
      const response = await storageService.getFile(file.thumbnailPath);
      return {
        stream: response.Body,
        mimeType: 'image/jpeg',
        fileName: `thumb_${file.originalName}`
      };
    } catch (error) {
      logger.error('خطا در دریافت تامبنیل', { error: error.message, fileId });
      throw error;
    }
  }

  /**
   * Get file URL
   */
  async getFileUrl(fileId, expiresIn = 3600) {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      const error = new Error('فایل یافت نشد');
      error.statusCode = 404;
      error.code = 'ERR_NOT_FOUND';
      throw error;
    }

    if (file.isPublic) {
      return storageService.getPublicUrl(file.path);
    }

    return storageService.getSignedUrl(file.path, expiresIn);
  }

  /**
   * Delete file
   */
  async deleteFile(fileId, userId) {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      const error = new Error('فایل یافت نشد');
      error.statusCode = 404;
      error.code = 'ERR_NOT_FOUND';
      throw error;
    }

    try {
      // Delete from storage
      await storageService.deleteFile(file.path);
      
      // Delete thumbnail if exists
      if (file.thumbnailPath) {
        try {
          await storageService.deleteFile(file.thumbnailPath);
        } catch (error) {
          logger.warn('خطا در حذف تامبنیل', { error: error.message });
        }
      }

      // Delete from database
      await file.destroy();

      logger.info('فایل حذف شد', { fileId, userId });
      return true;
    } catch (error) {
      logger.error('خطا در حذف فایل', { error: error.message, fileId });
      throw error;
    }
  }

  /**
   * Get user files
   */
  async getUserFiles(userId, options = {}) {
    const { page = 1, limit = 20, category } = options;
    const offset = (page - 1) * limit;

    const where = { uploadedBy: userId };
    if (category) where.category = category;

    const { count, rows } = await File.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      files: rows.map(f => this.formatFileResponse(f)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Format file response
   */
  formatFileResponse(file) {
    return {
      id: file.id,
      originalName: file.originalName,
      fileName: file.fileName,
      mimeType: file.mimeType,
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      category: file.category,
      isPublic: file.isPublic,
      hasThumbnail: file.hasThumbnail,
      metadata: file.metadata,
      uploadedBy: file.uploadedBy,
      companyId: file.companyId,
      referenceType: file.referenceType,
      referenceId: file.referenceId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    };
  }
}

module.exports = new FileService();
