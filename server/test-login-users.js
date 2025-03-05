require('dotenv').config();
const axios = require('axios');
const { logger } = require('./src/middleware/errorHandler');

// Users to test login with
const users = [
  {
    email: 'admin@healthcareapps.org',
    password: 'JPtp7XDGF=9ezR>q',
    role: 'admin',
    name: 'Admin User'
  },
  {
    email: 'doctor@healthcareapps.org',
    password: 'M9V|?v}}&yrwcJML',
    role: 'doctor',
    name: 'Doctor Smith'
  },
  {
    email: 'reception@healthcareapps.org',
    password: '|;;g]J39=wiqQXKg',
    role: 'receptionist',
    name: 'Front Desk'
  },
  {
    email: 'patient@healthcareapps.org',
    password: ',H,^v&F8MeMK@}64',
    role: 'patient',
    name: 'Test Patient'
  }
];

// Test login function
async function testLogin(email, password) {
  try {
    logger.info(`\nAttempting to login with email: ${email}`);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    
    logger.info('Login successful!');
    logger.info('Response status:', response.status);
    logger.info('User data:', JSON.stringify({
      id: response.data._id,
      name: `${response.data.firstName} ${response.data.lastName}`,
      email: response.data.email,
      role: response.data.role,
      token: response.data.token ? 'Token received (hidden for security)' : 'No token received'
    }, null, 2));
    
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('Login failed!');
    logger.error('Error status:', error.response?.status);
    logger.error('Error message:', error.message);
    
    if (error.response?.data) {
      logger.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    
    return { success: false, error };
  }
}

// Main test function
async function runTests() {
  logger.info('=== TESTING LOGIN API WITH CREATED USERS ===');
  
  // Test with all users
  for (const user of users) {
    logger.info(`\n--- Testing login for ${user.name} (${user.role}) ---`);
    await testLogin(user.email, user.password);
  }
  
  // Test with incorrect password
  logger.info('\n--- Testing login with incorrect password ---');
  await testLogin('admin@healthcareapps.org', 'WrongPassword123!');
  
  // Test with non-existent user
  logger.info('\n--- Testing login with non-existent user ---');
  await testLogin('nonexistent@healthcareapps.org', 'SomePassword123!');
  
  logger.info('\n=== LOGIN TESTING COMPLETE ===');
}

// Run the tests
runTests(); 