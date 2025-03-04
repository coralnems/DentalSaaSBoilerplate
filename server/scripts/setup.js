const { generateSecret, updateEnvFile } = require('./generateSecrets');
const { generateMinioConfig } = require('./setupMinio');

async function main() {
  try {
    // Generate JWT secrets
    console.log('Generating JWT secrets...');
    const jwtSecrets = {
      JWT_SECRET: generateSecret(),
      JWT_REFRESH_SECRET: generateSecret(),
      JWT_ACCESS_EXPIRATION: '15m',
      JWT_REFRESH_EXPIRATION: '7d',
    };
    await updateEnvFile(jwtSecrets);
    console.log('JWT secrets generated successfully');

    // Generate Minio configuration
    console.log('\nGenerating Minio configuration...');
    const minioConfig = generateMinioConfig();
    await updateEnvFile(minioConfig);
    console.log('Minio configuration generated successfully');

    console.log('\nSetup completed successfully!');
    console.log('\nMinio credentials:');
    console.log('Access Key:', minioConfig.MINIO_ACCESS_KEY);
    console.log('Secret Key:', minioConfig.MINIO_SECRET_KEY);
    
    console.log('\nNext steps:');
    console.log('1. Install and start Minio server');
    console.log('2. Use the generated credentials when setting up your Minio server');
    console.log('3. Update MINIO_ENDPOINT in .env if not running Minio locally');
    console.log('4. Restart your application to apply the changes');

  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main; 