require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { logger } = require('./src/middleware/errorHandler');

// User model
const User = require('./src/models/User');

// Function to generate secure random password
function generateSecurePassword(length = 16) {
  const uppercaseLetters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // Ensure at least one character from each category
  let password = '';
  password += uppercaseLetters.charAt(Math.floor(Math.random() * uppercaseLetters.length));
  password += lowercaseLetters.charAt(Math.floor(Math.random() * lowercaseLetters.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  // Fill the rest of the password length
  const allChars = uppercaseLetters + lowercaseLetters + numbers + symbols;
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

async function createUsers() {
  try {
    // Get MongoDB connection string from environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic';
    
    logger.info(`Connecting to MongoDB at ${mongoURI}`);
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    
    logger.info('Connected to MongoDB successfully!');

    // Define users to create
    const usersToCreate = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@healthcareapps.org',
        role: 'admin'
      },
      {
        firstName: 'Doctor',
        lastName: 'Smith',
        email: 'doctor@healthcareapps.org',
        role: 'doctor'
      },
      {
        firstName: 'Front',
        lastName: 'Desk',
        email: 'reception@healthcareapps.org',
        role: 'receptionist'
      },
      {
        firstName: 'Test',
        lastName: 'Patient',
        email: 'patient@healthcareapps.org',
        role: 'patient'
      }
    ];

    logger.info('Creating users...');
    const createdUsers = [];

    for (const userData of usersToCreate) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        logger.info(`User with email ${userData.email} already exists. Skipping...`);
        continue;
      }

      // Generate secure password
      const password = generateSecurePassword();
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        ...userData,
        password: hashedPassword
      });

      await newUser.save();
      
      // Store created user info with plaintext password for display
      createdUsers.push({
        email: userData.email,
        password: password,
        role: userData.role,
        name: `${userData.firstName} ${userData.lastName}`
      });

      logger.info(`Created user: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    }

    // Display credentials
    if (createdUsers.length > 0) {
      logger.info('\n=========== CREATED USER CREDENTIALS ===========');
      createdUsers.forEach(user => {
        logger.info(`
Name: ${user.name}
Role: ${user.role}
Email: ${user.email}
Password: ${user.password}
--------------------------------------------`);
      });
      logger.info('=================================================\n');
      logger.info('IMPORTANT: Save these credentials securely as they will not be shown again!');
    } else {
      logger.info('No new users were created. All requested users already exist.');
    }

    // Close MongoDB connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
  } catch (error) {
    logger.error('Error creating users:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the function
createUsers(); 