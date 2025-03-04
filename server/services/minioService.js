const Minio = require('minio');
const { createAuditLog } = require('../utils/auditLogger');

class MinioService {
  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
  }

  async initializeBucket(tenantId) {
    const bucketName = `tenant-${tenantId}`;
    try {
      const exists = await this.minioClient.bucketExists(bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(bucketName);
        // Set bucket policy for private access
        await this.minioClient.setBucketPolicy(bucketName, this.getPrivateBucketPolicy(bucketName));
      }
      return bucketName;
    } catch (error) {
      console.error('Error initializing bucket:', error);
      throw error;
    }
  }

  getPrivateBucketPolicy(bucketName) {
    return JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
          Condition: {
            StringEquals: {
              's3:ExistingObjectTag/public': 'true'
            }
          }
        }
      ]
    });
  }

  async uploadFile(tenantId, file, metadata = {}) {
    const bucketName = `tenant-${tenantId}`;
    try {
      const objectName = `${Date.now()}-${file.originalname}`;
      await this.minioClient.putObject(
        bucketName,
        objectName,
        file.buffer,
        file.size,
        metadata
      );

      await createAuditLog({
        userId: metadata.userId,
        action: 'UPLOAD_FILE',
        resource: `storage/${bucketName}/${objectName}`,
        details: {
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        },
        tenantId,
      });

      return {
        bucket: bucketName,
        key: objectName,
        url: await this.getFileUrl(bucketName, objectName),
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getFileUrl(bucketName, objectName, expiresIn = 3600) {
    try {
      return await this.minioClient.presignedGetObject(bucketName, objectName, expiresIn);
    } catch (error) {
      console.error('Error generating file URL:', error);
      throw error;
    }
  }

  async deleteFile(tenantId, objectName) {
    const bucketName = `tenant-${tenantId}`;
    try {
      await this.minioClient.removeObject(bucketName, objectName);

      await createAuditLog({
        userId: 'system',
        action: 'DELETE_FILE',
        resource: `storage/${bucketName}/${objectName}`,
        details: {
          fileName: objectName,
        },
        tenantId,
      });

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async listFiles(tenantId, prefix = '') {
    const bucketName = `tenant-${tenantId}`;
    try {
      const stream = this.minioClient.listObjects(bucketName, prefix, true);
      const files = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          files.push({
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
          });
        });

        stream.on('error', (err) => {
          reject(err);
        });

        stream.on('end', () => {
          resolve(files);
        });
      });
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  async copyFile(sourceTenantId, sourceObjectName, targetTenantId, targetObjectName) {
    const sourceBucket = `tenant-${sourceTenantId}`;
    const targetBucket = `tenant-${targetTenantId}`;

    try {
      await this.minioClient.copyObject(
        targetBucket,
        targetObjectName,
        `/${sourceBucket}/${sourceObjectName}`
      );

      await createAuditLog({
        userId: 'system',
        action: 'COPY_FILE',
        resource: `storage/${targetBucket}/${targetObjectName}`,
        details: {
          sourceBucket,
          sourceObjectName,
          targetBucket,
          targetObjectName,
        },
        tenantId: targetTenantId,
      });

      return true;
    } catch (error) {
      console.error('Error copying file:', error);
      throw error;
    }
  }
}

module.exports = new MinioService(); 