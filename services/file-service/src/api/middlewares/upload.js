const multer = require('multer');
const config = require('../../config');
const { isAllowedExtension } = require('../../utils/helpers');

// Memory storage for processing before upload to MinIO
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  if (!isAllowedExtension(file.originalname)) {
    const error = new Error('فرمت فایل مجاز نیست. فرمت‌های مجاز: jpg, jpeg, png, pdf, xlsx');
    error.code = 'ERR_INVALID_FILE_TYPE';
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
};

// Single file upload
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize
  }
}).single('file');

// Multiple files upload (max 10)
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10
  }
}).array('files', 10);

// Wrapper for better error handling
const handleUpload = (uploadFn) => {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: {
                code: 'ERR_FILE_TOO_LARGE',
                message: 'حجم فایل بیش از حد مجاز است (حداکثر ۱۰ مگابایت)',
                details: [],
                timestamp: new Date().toISOString()
              }
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              error: {
                code: 'ERR_TOO_MANY_FILES',
                message: 'تعداد فایل‌ها بیش از حد مجاز است (حداکثر ۱۰ فایل)',
                details: [],
                timestamp: new Date().toISOString()
              }
            });
          }
        }
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle: handleUpload(uploadSingle),
  uploadMultiple: handleUpload(uploadMultiple)
};
