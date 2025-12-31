const sharp = require('sharp');
const config = require('../config');
const logger = require('../utils/logger');

class ImageService {
  /**
   * Generate thumbnail
   */
  async generateThumbnail(buffer) {
    try {
      const thumbnail = await sharp(buffer)
        .resize(config.thumbnail.width, config.thumbnail.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      return thumbnail;
    } catch (error) {
      logger.error('خطا در ایجاد تامبنیل', { error: error.message });
      throw error;
    }
  }

  /**
   * Resize image
   */
  async resizeImage(buffer, width, height, options = {}) {
    try {
      const { fit = 'inside', quality = 85 } = options;
      
      const resized = await sharp(buffer)
        .resize(width, height, { fit })
        .jpeg({ quality })
        .toBuffer();

      return resized;
    } catch (error) {
      logger.error('خطا در تغییر اندازه تصویر', { error: error.message });
      throw error;
    }
  }

  /**
   * Get image metadata
   */
  async getMetadata(buffer) {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        space: metadata.space,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha
      };
    } catch (error) {
      logger.error('خطا در دریافت متادیتای تصویر', { error: error.message });
      return null;
    }
  }

  /**
   * Optimize image
   */
  async optimizeImage(buffer, mimeType) {
    try {
      let optimized;
      
      if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        optimized = await sharp(buffer)
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
      } else if (mimeType === 'image/png') {
        optimized = await sharp(buffer)
          .png({ compressionLevel: 8 })
          .toBuffer();
      } else {
        optimized = buffer;
      }

      return optimized;
    } catch (error) {
      logger.error('خطا در بهینه‌سازی تصویر', { error: error.message });
      return buffer;
    }
  }
}

module.exports = new ImageService();
