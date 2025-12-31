const { v4: uuidv4 } = require('uuid');
const path = require('path');
const config = require('../config');

/**
 * Generate unique filename
 */
const generateFileName = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  return `${uuidv4()}${ext}`;
};

/**
 * Get file extension
 */
const getExtension = (filename) => {
  return path.extname(filename).toLowerCase().replace('.', '');
};

/**
 * Check if file is image
 */
const isImage = (mimeType) => {
  return mimeType && mimeType.startsWith('image/');
};

/**
 * Check if extension is allowed
 */
const isAllowedExtension = (filename) => {
  const ext = getExtension(filename);
  return config.upload.allowedExtensions.includes(ext);
};

/**
 * Format file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '۰ بایت';
  
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);
  
  return `${toPersianNumber(size)} ${sizes[i]}`;
};

/**
 * Convert number to Persian
 */
const toPersianNumber = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

/**
 * Get MIME type from extension
 */
const getMimeType = (ext) => {
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'pdf': 'application/pdf',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
};

/**
 * Get file category
 */
const getFileCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'document';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  return 'other';
};

module.exports = {
  generateFileName,
  getExtension,
  isImage,
  isAllowedExtension,
  formatFileSize,
  toPersianNumber,
  getMimeType,
  getFileCategory
};
