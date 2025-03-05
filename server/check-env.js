require('dotenv').config();
const path = require('path');

console.log('Environment Variables Check:');
console.log('---------------------------');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (length: ' + process.env.JWT_SECRET.length + ')' : 'Not set');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'Set (length: ' + process.env.JWT_REFRESH_SECRET.length + ')' : 'Not set');
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);
console.log('---------------------------');

// Check .env file path
console.log('Checking .env file path:');
console.log('Current directory:', __dirname);
console.log('Expected .env path:', path.join(__dirname, '.env'));
console.log('Parent directory .env path:', path.join(__dirname, '..', '.env'));

// Try to read the .env file directly
const fs = require('fs');
try {
  const envPath = path.join(__dirname, '.env');
  const envExists = fs.existsSync(envPath);
  console.log('.env file exists in server directory:', envExists);
  
  if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('.env file content length:', envContent.length);
    
    // Check if JWT_SECRET is in the file
    const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);
    if (jwtSecretMatch) {
      console.log('JWT_SECRET found in .env file');
    } else {
      console.log('JWT_SECRET not found in .env file');
    }
  }
  
  // Check parent directory
  const parentEnvPath = path.join(__dirname, '..', '.env');
  const parentEnvExists = fs.existsSync(parentEnvPath);
  console.log('.env file exists in parent directory:', parentEnvExists);
} catch (error) {
  console.error('Error checking .env file:', error);
}

// Check if dotenv is loading the file correctly
console.log('---------------------------');
console.log('Reloading .env file with explicit path:');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('JWT_SECRET after explicit load:', process.env.JWT_SECRET ? 'Set (length: ' + process.env.JWT_SECRET.length + ')' : 'Not set');

// Try parent directory
console.log('---------------------------');
console.log('Trying parent directory .env:');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
console.log('JWT_SECRET after parent load:', process.env.JWT_SECRET ? 'Set (length: ' + process.env.JWT_SECRET.length + ')' : 'Not set'); 