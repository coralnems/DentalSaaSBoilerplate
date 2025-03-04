const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const path = require('path');
const crypto = require('crypto');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Generate unique filename
const generateFileName = (file) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(file.originalname);
  return `${timestamp}-${randomString}${extension}`;
};

// Configure multer for S3 upload
const upload = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileName = generateFileName(file);
      const folderPath = req.body.folderPath || 'general'; // e.g., 'xrays', 'documents'
      cb(null, `${folderPath}/${fileName}`);
    },
    metadata: (req, file, cb) => {
      cb(null, {
        patientId: req.body.patientId,
        uploadedBy: req.user.id,
        originalName: file.originalname
      });
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Generate signed URL for file access
const getSignedUrl = async (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Expires: 3600 // URL expires in 1 hour
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
};

// Delete file from S3
const deleteFile = async (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

module.exports = {
  upload,
  getSignedUrl,
  deleteFile
}; 