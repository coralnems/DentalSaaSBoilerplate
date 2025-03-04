const { updateEnvFile } = require('./generateSecrets');
const crypto = require('crypto');

function generateMinioConfig() {
  const config = {
    MINIO_ENDPOINT: 'localhost',
    MINIO_PORT: '9000',
    MINIO_USE_SSL: 'false',
    MINIO_ACCESS_KEY: crypto.randomBytes(20).toString('hex'),
    MINIO_SECRET_KEY: crypto.randomBytes(40).toString('hex'),
    MINIO_REGION: 'us-east-1',
  };

  return config;
}

async function main() {
  try {
    console.log('Generating Minio configuration...');
    const minioConfig = generateMinioConfig();
    
    // Update environment variables
    await updateEnvFile(minioConfig);
    
    console.log('Minio configuration generated successfully');
    console.log('\nMinio credentials:');
    console.log('Access Key:', minioConfig.MINIO_ACCESS_KEY);
    console.log('Secret Key:', minioConfig.MINIO_SECRET_KEY);
    console.log('\nPlease make sure to:');
    console.log('1. Install and start Minio server');
    console.log('2. Use these credentials when setting up your Minio server');
    console.log('3. Update the MINIO_ENDPOINT if you\'re not running Minio locally');
    
  } catch (error) {
    console.error('Error setting up Minio configuration:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateMinioConfig,
}; 