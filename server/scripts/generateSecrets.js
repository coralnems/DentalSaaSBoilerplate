const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function updateEnvFile(secrets) {
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';

  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Update or add JWT secrets
  Object.entries(secrets).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  });

  // Write updated content back to .env file
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log('Environment variables updated successfully');
}

function main() {
  const secrets = {
    JWT_SECRET: generateSecret(),
    JWT_REFRESH_SECRET: generateSecret(),
    JWT_ACCESS_EXPIRATION: '15m',
    JWT_REFRESH_EXPIRATION: '7d',
  };

  try {
    updateEnvFile(secrets);
    console.log('JWT secrets generated and stored successfully');
    console.log('Make sure to restart your application to apply the changes');
  } catch (error) {
    console.error('Error generating secrets:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateSecret,
  updateEnvFile,
}; 