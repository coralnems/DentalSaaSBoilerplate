const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ClamScan = require('clamscan');
const logger = require('../config/logger');
const AppError = require('./errorHandler').AppError;

// Configure ClamAV scanner
const ClamAV = new ClamScan({
  removeInfected: true,
  quarantineInfected: false,
  scanLog: path.join(__dirname, '../logs/virus-scan.log'),
  debugMode: false,
  fileList: false,
  scanTimeout: 60000,
  preference: 'clamscan'
});

// File type validation
const allowedMimeTypes = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx']
};

// File size limits (in bytes)
const fileSizeLimits = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  default: 2 * 1024 * 1024 // 2MB
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads', req.user.tenantId);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype.toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase().substring(1);

  // Check if mime type is allowed
  if (!allowedMimeTypes[mimeType] || !allowedMimeTypes[mimeType].includes(ext)) {
    return cb(new AppError('Invalid file type', 400), false);
  }

  // Check file size
  const fileType = mimeType.startsWith('image/') ? 'image' : 'document';
  const sizeLimit = fileSizeLimits[fileType] || fileSizeLimits.default;
  
  if (file.size > sizeLimit) {
    return cb(new AppError('File size exceeds limit', 400), false);
  }

  cb(null, true);
};

// Virus scan middleware
const virusScan = async (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const files = req.files ? Object.values(req.files).flat() : [req.file];

  try {
    for (const file of files) {
      const {isInfected, viruses} = await ClamAV.isInfected(file.path);
      if (isInfected) {
        logger.warn(`Virus detected in file ${file.originalname}:`, viruses);
        return next(new AppError('Virus detected in uploaded file', 400));
      }
    }
    next();
  } catch (error) {
    logger.error('Virus scan error:', error);
    next(new AppError('Error scanning file for viruses', 500));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(...Object.values(fileSizeLimits))
  }
});

// Error handler for multer errors
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File size exceeds limit', 400));
    }
    return next(new AppError(`File upload error: ${error.message}`, 400));
  }
  next(error);
};

module.exports = {
  upload,
  virusScan,
  handleMulterError,
  allowedMimeTypes,
  fileSizeLimits
}; 