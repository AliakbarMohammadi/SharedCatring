const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const config = { port: parseInt(process.env.PORT, 10) || 3012 };

// Multer config for file uploads
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع فایل مجاز نیست'), false);
    }
  }
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { service: 'file-service', status: 'healthy', timestamp: new Date().toISOString() },
    message: 'سرویس در حال اجرا است'
  });
});

// Upload file
app.post('/api/v1/files/upload', upload.single('file'), async (req, res) => {
  const { category, entityId, entityType } = req.body;
  
  // In production, this would upload to MinIO
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.status(201).json({
    success: true,
    data: {
      id: fileId,
      filename: req.file?.originalname || 'uploaded_file',
      mimetype: req.file?.mimetype || 'application/octet-stream',
      size: req.file?.size || 0,
      category,
      entityId,
      entityType,
      url: `/files/${fileId}`,
      uploadedAt: new Date().toISOString()
    },
    message: 'فایل با موفقیت آپلود شد'
  });
});

// Upload multiple files
app.post('/api/v1/files/upload-multiple', upload.array('files', 10), async (req, res) => {
  const files = (req.files || []).map((file, index) => ({
    id: `file_${Date.now()}_${index}`,
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `/files/file_${Date.now()}_${index}`
  }));

  res.status(201).json({
    success: true,
    data: files,
    message: 'فایل‌ها با موفقیت آپلود شد'
  });
});

// Get file info
app.get('/api/v1/files/:id', async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      filename: 'sample_file.jpg',
      mimetype: 'image/jpeg',
      size: 102400,
      url: `/files/${req.params.id}`,
      uploadedAt: new Date().toISOString()
    },
    message: 'اطلاعات فایل دریافت شد'
  });
});

// Download file
app.get('/api/v1/files/:id/download', async (req, res) => {
  // In production, this would stream from MinIO
  res.json({
    success: true,
    data: {
      downloadUrl: `https://storage.example.com/files/${req.params.id}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    },
    message: 'لینک دانلود ایجاد شد'
  });
});

// Delete file
app.delete('/api/v1/files/:id', async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'فایل با موفقیت حذف شد'
  });
});

// List files by entity
app.get('/api/v1/files/entity/:entityType/:entityId', async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'فایل‌ها دریافت شد'
  });
});

// Error handler for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: { code: 'ERR_1901', message: 'حجم فایل بیش از حد مجاز است', details: [] }
      });
    }
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.errorCode || 'ERR_1000', message: err.message || 'خطای داخلی سرور', details: [] }
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'ERR_1002', message: 'مسیر یافت نشد', details: [] } });
});

app.listen(config.port, () => console.log(`File Service running on port ${config.port}`));
module.exports = app;
