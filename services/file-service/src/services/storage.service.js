const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client } = require('../config/minio');
const config = require('../config');
const logger = require('../utils/logger');

class StorageService {
  /**
   * Upload file to MinIO
   */
  async uploadFile(buffer, fileName, mimeType, isPublic = false) {
    try {
      const key = `${isPublic ? 'public' : 'private'}/${fileName}`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: config.minio.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: isPublic ? 'public-read' : 'private'
      }));

      logger.info('فایل آپلود شد', { fileName, key });
      return key;
    } catch (error) {
      logger.error('خطا در آپلود فایل', { error: error.message, fileName });
      throw error;
    }
  }

  /**
   * Upload thumbnail
   */
  async uploadThumbnail(buffer, fileName) {
    try {
      const key = `thumbnails/${fileName}`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: config.minio.bucket,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg'
      }));

      logger.info('تامبنیل آپلود شد', { fileName, key });
      return key;
    } catch (error) {
      logger.error('خطا در آپلود تامبنیل', { error: error.message, fileName });
      throw error;
    }
  }

  /**
   * Get file from MinIO
   */
  async getFile(key) {
    try {
      const response = await s3Client.send(new GetObjectCommand({
        Bucket: config.minio.bucket,
        Key: key
      }));

      return response;
    } catch (error) {
      logger.error('خطا در دریافت فایل', { error: error.message, key });
      throw error;
    }
  }

  /**
   * Delete file from MinIO
   */
  async deleteFile(key) {
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: config.minio.bucket,
        Key: key
      }));

      logger.info('فایل حذف شد', { key });
      return true;
    } catch (error) {
      logger.error('خطا در حذف فایل', { error: error.message, key });
      throw error;
    }
  }

  /**
   * Get signed URL for private file
   */
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: config.minio.bucket,
        Key: key
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      logger.error('خطا در ایجاد URL امضا شده', { error: error.message, key });
      throw error;
    }
  }

  /**
   * Get public URL
   */
  getPublicUrl(key) {
    const protocol = config.minio.useSSL ? 'https' : 'http';
    return `${protocol}://${config.minio.endpoint}:${config.minio.port}/${config.minio.bucket}/${key}`;
  }
}

module.exports = new StorageService();
