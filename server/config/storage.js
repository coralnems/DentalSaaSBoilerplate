const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const env = require('./env');
const logger = require('./logger');

// Storage types
const STORAGE_TYPES = {
  LOCAL: 'local',
  S3: 's3'
};

// S3 configuration
const s3Config = {
  accessKeyId: env.S3_ACCESS_KEY,
  secretAccessKey: env.S3_SECRET_KEY,
  region: env.S3_REGION,
  params: {
    Bucket: env.S3_BUCKET
  }
};

// Initialize S3 client
const s3 = new AWS.S3(s3Config);

// Local storage configuration
const localStorageConfig = {
  uploadDir: path.join(__dirname, '../uploads'),
  tempDir: path.join(__dirname, '../uploads/temp')
};

// Ensure storage directories exist
const initializeStorage = async () => {
  if (env.STORAGE_TYPE === STORAGE_TYPES.LOCAL) {
    try {
      await fs.mkdir(localStorageConfig.uploadDir, { recursive: true });
      await fs.mkdir(localStorageConfig.tempDir, { recursive: true });
    } catch (error) {
      logger.error('Error creating storage directories:', error);
      throw error;
    }
  }
};

// Generate unique filename
const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalFilename);
  return `${timestamp}-${random}${ext}`;
};

// Upload file
const uploadFile = async (file, options = {}) => {
  const filename = options.filename || generateUniqueFilename(file.originalname);
  const contentType = file.mimetype;
  const buffer = file.buffer;

  try {
    // Try primary storage first
    if (env.STORAGE_TYPE === STORAGE_TYPES.S3) {
      return await uploadToS3(buffer, filename, contentType);
    } else {
      return await uploadToLocal(buffer, filename);
    }
  } catch (error) {
    logger.error('Primary storage upload failed:', error);
    
    // Fallback to secondary storage
    if (env.STORAGE_TYPE === STORAGE_TYPES.S3) {
      logger.info('Falling back to local storage');
      return await uploadToLocal(buffer, filename);
    } else {
      logger.info('Falling back to S3 storage');
      return await uploadToS3(buffer, filename, contentType);
    }
  }
};

// Upload to S3
const uploadToS3 = async (buffer, filename, contentType) => {
  const params = {
    Bucket: env.S3_BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
    ACL: 'private'
  };

  try {
    const result = await s3.upload(params).promise();
    logger.info(`File uploaded to S3: ${result.Location}`);
    return {
      success: true,
      url: result.Location,
      key: result.Key,
      storage: STORAGE_TYPES.S3
    };
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw error;
  }
};

// Upload to local storage
const uploadToLocal = async (buffer, filename) => {
  const filepath = path.join(localStorageConfig.uploadDir, filename);
  
  try {
    await fs.writeFile(filepath, buffer);
    logger.info(`File uploaded locally: ${filepath}`);
    return {
      success: true,
      path: filepath,
      filename,
      storage: STORAGE_TYPES.LOCAL
    };
  } catch (error) {
    logger.error('Local upload error:', error);
    throw error;
  }
};

// Delete file
const deleteFile = async (fileInfo) => {
  try {
    if (fileInfo.storage === STORAGE_TYPES.S3) {
      await s3.deleteObject({
        Bucket: env.S3_BUCKET,
        Key: fileInfo.key
      }).promise();
      logger.info(`File deleted from S3: ${fileInfo.key}`);
    } else {
      await fs.unlink(fileInfo.path);
      logger.info(`File deleted locally: ${fileInfo.path}`);
    }
    return true;
  } catch (error) {
    logger.error('File deletion error:', error);
    throw error;
  }
};

// Get file
const getFile = async (fileInfo) => {
  try {
    if (fileInfo.storage === STORAGE_TYPES.S3) {
      const result = await s3.getObject({
        Bucket: env.S3_BUCKET,
        Key: fileInfo.key
      }).promise();
      return result.Body;
    } else {
      return await fs.readFile(fileInfo.path);
    }
  } catch (error) {
    logger.error('File retrieval error:', error);
    throw error;
  }
};

// Get file URL
const getFileUrl = async (fileInfo, expiresIn = 3600) => {
  try {
    if (fileInfo.storage === STORAGE_TYPES.S3) {
      const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: env.S3_BUCKET,
        Key: fileInfo.key,
        Expires: expiresIn
      });
      return url;
    } else {
      // For local files, return the relative path
      return `/uploads/${path.basename(fileInfo.path)}`;
    }
  } catch (error) {
    logger.error('Error generating file URL:', error);
    throw error;
  }
};

// Initialize storage on startup
initializeStorage().catch(error => {
  logger.error('Storage initialization failed:', error);
  process.exit(1);
});

module.exports = {
  uploadFile,
  deleteFile,
  getFile,
  getFileUrl,
  STORAGE_TYPES
}; 