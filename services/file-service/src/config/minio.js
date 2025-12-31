const { S3Client, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const config = require('./index');
const logger = require('../utils/logger');

const s3Client = new S3Client({
  endpoint: `http${config.minio.useSSL ? 's' : ''}://${config.minio.endpoint}:${config.minio.port}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: config.minio.accessKey,
    secretAccessKey: config.minio.secretKey
  },
  forcePathStyle: true
});

const initializeBucket = async () => {
  try {
    // Check if bucket exists
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: config.minio.bucket }));
      logger.info(`باکت ${config.minio.bucket} موجود است`);
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        // Create bucket
        await s3Client.send(new CreateBucketCommand({ Bucket: config.minio.bucket }));
        logger.info(`باکت ${config.minio.bucket} ایجاد شد`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.error('خطا در اتصال به MinIO', { error: error.message });
    // Don't exit - service can work without MinIO in dev mode
    logger.warn('سرویس بدون MinIO ادامه می‌دهد');
  }
};

module.exports = { s3Client, initializeBucket };
