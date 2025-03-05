const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Script to automatically detect Docker container configurations
 * and update the .env file with the correct connection details
 */

// Function to generate a secure random string for use as a secret key
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Function to get container details
function getContainerDetails() {
  try {
    // Get all running containers
    const containersOutput = execSync('docker ps').toString();
    const containers = containersOutput.split('\n')
      .filter(line => line.trim() !== '' && !line.startsWith('CONTAINER'))
      .map(line => {
        const parts = line.split(/\s{2,}/);
        return {
          id: parts[0],
          image: parts[1],
          name: parts[parts.length - 1],
          ports: parts[parts.length - 2]
        };
      });

    // Find Redis and MongoDB containers
    const redisContainer = containers.find(c => c.image.includes('redis'));
    const mongoContainer = containers.find(c => c.image.includes('mongo'));

    const result = {};

    if (redisContainer) {
      console.log(`Found Redis container: ${redisContainer.name} (${redisContainer.id})`);
      
      // Get Redis IP address
      const redisIpOutput = execSync(`docker inspect ${redisContainer.id} | findstr "IPAddress"`).toString();
      const redisIpMatch = redisIpOutput.match(/"IPAddress": "([^"]+)"/);
      if (redisIpMatch && redisIpMatch[1]) {
        result.redisIp = redisIpMatch[1];
      }
      
      // Get Redis port
      result.redisPort = '6379'; // Default Redis port
      
      // Check if port is mapped to host
      const redisPortOutput = redisContainer.ports;
      const redisPortMatch = redisPortOutput.match(/0\.0\.0\.0:(\d+)->6379/);
      if (redisPortMatch && redisPortMatch[1]) {
        result.redisHostPort = redisPortMatch[1];
      }
    } else {
      console.log('No Redis container found');
    }

    if (mongoContainer) {
      console.log(`Found MongoDB container: ${mongoContainer.name} (${mongoContainer.id})`);
      
      // Get MongoDB IP address
      const mongoIpOutput = execSync(`docker inspect ${mongoContainer.id} | findstr "IPAddress"`).toString();
      const mongoIpMatch = mongoIpOutput.match(/"IPAddress": "([^"]+)"/);
      if (mongoIpMatch && mongoIpMatch[1]) {
        result.mongoIp = mongoIpMatch[1];
      }
      
      // Get MongoDB port
      result.mongoPort = '27017'; // Default MongoDB port
      
      // Check if port is mapped to host
      const mongoPortOutput = mongoContainer.ports;
      const mongoPortMatch = mongoPortOutput.match(/0\.0\.0\.0:(\d+)->27017/);
      if (mongoPortMatch && mongoPortMatch[1]) {
        result.mongoHostPort = mongoPortMatch[1];
      }
    } else {
      console.log('No MongoDB container found');
    }

    return result;
  } catch (error) {
    console.error('Error getting container details:', error.message);
    return {};
  }
}

// Function to update .env file
function updateEnvFile(containerDetails) {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Generate security keys if they don't exist
    if (!envContent.includes('JWT_SECRET=') || envContent.includes('JWT_SECRET=your-jwt-secret-key-for-development')) {
      const jwtSecret = generateSecureKey(48);
      if (!envContent.includes('JWT_SECRET=')) {
        envContent += `\n# Security\nJWT_SECRET=${jwtSecret}\n`;
      } else {
        envContent = envContent.replace(
          /JWT_SECRET=.*/,
          `JWT_SECRET=${jwtSecret}`
        );
      }
      console.log('Generated new JWT_SECRET');
    }

    if (!envContent.includes('JWT_EXPIRES_IN=')) {
      envContent += `JWT_EXPIRES_IN=7d\n`;
    }

    if (!envContent.includes('ENCRYPTION_KEY=') || envContent.includes('ENCRYPTION_KEY=secure-encryption-key-for-development')) {
      const encryptionKey = generateSecureKey(32);
      if (!envContent.includes('ENCRYPTION_KEY=')) {
        envContent += `ENCRYPTION_KEY=${encryptionKey}\n`;
      } else {
        envContent = envContent.replace(
          /ENCRYPTION_KEY=.*/,
          `ENCRYPTION_KEY=${encryptionKey}`
        );
      }
      console.log('Generated new ENCRYPTION_KEY');
    }

    // Update Redis configuration
    if (containerDetails.redisIp) {
      // Check if variables exist, if not add them
      if (!envContent.includes('REDIS_HOST=')) {
        envContent += `\n# Redis Configuration\nREDIS_HOST=${containerDetails.redisIp}\n`;
      } else {
        // Update REDIS_HOST
        envContent = envContent.replace(
          /REDIS_HOST=.*/,
          `REDIS_HOST=${containerDetails.redisIp}`
        );
      }
      
      if (!envContent.includes('REDIS_PORT=')) {
        envContent += `REDIS_PORT=${containerDetails.redisPort}\n`;
      } else {
        // Update REDIS_PORT
        envContent = envContent.replace(
          /REDIS_PORT=.*/,
          `REDIS_PORT=${containerDetails.redisPort}`
        );
      }
      
      if (!envContent.includes('REDIS_URL=')) {
        envContent += `REDIS_URL=redis://${containerDetails.redisIp}:${containerDetails.redisPort}\n`;
      } else {
        // Update REDIS_URL
        envContent = envContent.replace(
          /REDIS_URL=.*/,
          `REDIS_URL=redis://${containerDetails.redisIp}:${containerDetails.redisPort}`
        );
      }
      
      if (!envContent.includes('REDIS_PASSWORD=')) {
        envContent += `REDIS_PASSWORD=\n`;
      }
      
      console.log(`Updated Redis configuration: ${containerDetails.redisIp}:${containerDetails.redisPort}`);
    }

    // Update MongoDB configuration
    if (containerDetails.mongoIp) {
      // Check if variables exist, if not add them
      if (!envContent.includes('MONGO_HOST=')) {
        envContent += `\n# MongoDB Configuration\nMONGO_HOST=${containerDetails.mongoIp}\n`;
      } else {
        // Update MONGO_HOST
        envContent = envContent.replace(
          /MONGO_HOST=.*/,
          `MONGO_HOST=${containerDetails.mongoIp}`
        );
      }
      
      if (!envContent.includes('MONGO_PORT=')) {
        envContent += `MONGO_PORT=${containerDetails.mongoPort}\n`;
      } else {
        // Update MONGO_PORT
        envContent = envContent.replace(
          /MONGO_PORT=.*/,
          `MONGO_PORT=${containerDetails.mongoPort}`
        );
      }
      
      if (!envContent.includes('MONGO_DB=')) {
        envContent += `MONGO_DB=dental-clinic\n`;
      }
      
      if (!envContent.includes('MONGO_USER=')) {
        envContent += `MONGO_USER=\n`;
      }
      
      if (!envContent.includes('MONGO_PASSWORD=')) {
        envContent += `MONGO_PASSWORD=\n`;
      }
      
      // Update MONGODB_URI
      const mongoUri = `mongodb://${containerDetails.mongoIp}:${containerDetails.mongoPort}/dental-clinic`;
      if (!envContent.includes('MONGODB_URI=')) {
        envContent += `MONGODB_URI=${mongoUri}\n`;
      } else {
        envContent = envContent.replace(
          /MONGODB_URI=.*/,
          `MONGODB_URI=${mongoUri}`
        );
      }
      
      console.log(`Updated MongoDB configuration: ${containerDetails.mongoIp}:${containerDetails.mongoPort}`);
    }

    // Write updated content back to .env file
    fs.writeFileSync(envPath, envContent);
    console.log('.env file updated successfully');
    
    // Also update client .env file if it exists
    const clientEnvPath = path.join(__dirname, '..', 'client', '.env');
    if (fs.existsSync(clientEnvPath)) {
      let clientEnvContent = fs.readFileSync(clientEnvPath, 'utf8');
      
      // Update encryption key for client
      if (envContent.includes('ENCRYPTION_KEY=')) {
        const encryptionKeyMatch = envContent.match(/ENCRYPTION_KEY=([^\n]+)/);
        if (encryptionKeyMatch && encryptionKeyMatch[1]) {
          if (!clientEnvContent.includes('VITE_ENCRYPTION_KEY=')) {
            clientEnvContent += `\nVITE_ENCRYPTION_KEY=${encryptionKeyMatch[1]}\n`;
          } else {
            clientEnvContent = clientEnvContent.replace(
              /VITE_ENCRYPTION_KEY=.*/,
              `VITE_ENCRYPTION_KEY=${encryptionKeyMatch[1]}`
            );
          }
          console.log('Client .env file updated with encryption key');
        }
      }
      
      // Update Redis configuration for client
      if (containerDetails.redisIp) {
        if (!clientEnvContent.includes('VITE_REDIS_HOST=')) {
          clientEnvContent += `\n# Redis Configuration\nVITE_REDIS_HOST=${containerDetails.redisIp}\n`;
        } else {
          clientEnvContent = clientEnvContent.replace(
            /VITE_REDIS_HOST=.*/,
            `VITE_REDIS_HOST=${containerDetails.redisIp}`
          );
        }
        
        if (!clientEnvContent.includes('VITE_REDIS_PORT=')) {
          clientEnvContent += `VITE_REDIS_PORT=${containerDetails.redisPort}\n`;
        } else {
          clientEnvContent = clientEnvContent.replace(
            /VITE_REDIS_PORT=.*/,
            `VITE_REDIS_PORT=${containerDetails.redisPort}`
          );
        }
        
        console.log('Client .env file updated with Redis configuration');
      }
      
      fs.writeFileSync(clientEnvPath, clientEnvContent);
    }
  } catch (error) {
    console.error('Error updating .env file:', error.message);
  }
}

// Main function
function main() {
  console.log('Detecting Docker container configurations...');
  const containerDetails = getContainerDetails();
  
  if (Object.keys(containerDetails).length === 0) {
    console.log('No container details found. Make sure Docker is running and containers are up.');
    return;
  }
  
  updateEnvFile(containerDetails);
  
  console.log('\nConfiguration Summary:');
  if (containerDetails.redisIp) {
    console.log(`Redis: ${containerDetails.redisIp}:${containerDetails.redisPort}`);
    if (containerDetails.redisHostPort) {
      console.log(`Redis Host Port: ${containerDetails.redisHostPort}`);
    }
  }
  
  if (containerDetails.mongoIp) {
    console.log(`MongoDB: ${containerDetails.mongoIp}:${containerDetails.mongoPort}`);
    if (containerDetails.mongoHostPort) {
      console.log(`MongoDB Host Port: ${containerDetails.mongoHostPort}`);
    }
  }
  
  console.log('\nYou can now restart your application with:');
  console.log('npm run dev:all');
}

// Run the script
main(); 