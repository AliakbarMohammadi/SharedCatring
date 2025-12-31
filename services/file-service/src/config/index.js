require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3012,
  serviceName: process.env.SERVICE_NAME || 'file-service',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'file_db',
    user: process.env.DB_USER || 'catering_user',
    password: process.env.DB_PASSWORD || 'catering_pass_123'
  },
  
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucket: process.env.MINIO_BUCKET || 'catering-files'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    allowedExtensions: (process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png,pdf,xlsx').split(',')
  },
  
  thumbnail: {
    width: parseInt(process.env.THUMBNAIL_WIDTH, 10) || 200,
    height: parseInt(process.env.THUMBNAIL_HEIGHT, 10) || 200
  }
};
