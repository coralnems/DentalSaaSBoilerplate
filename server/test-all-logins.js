require('dotenv').config();
const axios = require('axios');

// Test users with their credentials
const users = [
  {
    email: 'admin@healthcareapps.org',
    password: 'JPtp7XDGF=9ezR>q',
    role: 'admin',
    name: 'Admin User',
    description: 'Administrator account with full access'
  },
  {
    email: 'doctor@healthcareapps.org',
    password: 'M9V|?v}}&yrwcJML',
    role: 'doctor',
    name: 'Doctor Smith',
    description: 'Doctor account with clinical access'
  },
  {
    email: 'reception@healthcareapps.org',
    password: '|;;g]J39=wiqQXKg',
    role: 'receptionist',
    name: 'Front Desk',
    description: 'Receptionist account for front desk operations'
  },
  {
    email: 'patient@healthcareapps.org',
    password: ',H,^v&F8MeMK@}64',
    role: 'patient',
    name: 'Test Patient',
    description: 'Patient account for appointment management'
  }
];

// Invalid login test cases
const invalidLogins = [
  {
    email: 'admin@healthcareapps.org',
    password: 'wrongpassword',
    description: 'Valid email with wrong password'
  },
  {
    email: 'nonexistent@healthcareapps.org',
    password: 'password123',
    description: 'Non-existent user'
  },
  {
    email: 'invalid-email-format',
    password: 'password123',
    description: 'Invalid email format'
  },
  {
    email: '',
    password: 'password123',
    description: 'Empty email'
  },
  {
    email: 'admin@healthcareapps.org',
    password: '',
    description: 'Empty password'
  }
];

// API endpoint
const API_URL = 'http://localhost:5000/api/auth/login';

// Test a single login
async function testLogin(email, password, description) {
  console.log(`\n⏳ Testing login: ${description}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${'*'.repeat(password.length)}`);
  
  try {
    const response = await axios.post(API_URL, { email, password });
    
    console.log(`✅ SUCCESS - Status: ${response.status}`);
    console.log(`✅ Token received`);
    
    // Print user info without the token for security
    const userData = { ...response.data.user };
    console.log(`✅ User data: ${JSON.stringify(userData, null, 2)}`);
    
    return { success: true, data: response.data };
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    if (description.toLowerCase().includes('invalid') || 
        description.toLowerCase().includes('non-existent') || 
        description.toLowerCase().includes('empty') ||
        description.toLowerCase().includes('wrong password')) {
      // These are expected to fail
      console.log(`🔶 EXPECTED FAILURE - Status: ${status}`);
      console.log(`🔶 Message: ${message}`);
      return { success: false, expected: true, error: { status, message } };
    } else {
      console.log(`❌ FAILURE - Status: ${status}`);
      console.log(`❌ Message: ${message}`);
      return { success: false, expected: false, error: { status, message } };
    }
  }
}

// Run all tests
async function runTests() {
  console.log('\n=== COMPREHENSIVE LOGIN TESTING ===\n');
  
  // Test valid logins
  console.log('\n📋 TESTING VALID LOGINS\n');
  const validResults = [];
  for (const user of users) {
    const result = await testLogin(user.email, user.password, `${user.name} (${user.role}) - ${user.description}`);
    validResults.push({ ...user, result });
  }
  
  // Test invalid logins
  console.log('\n📋 TESTING INVALID LOGINS\n');
  const invalidResults = [];
  for (const login of invalidLogins) {
    const result = await testLogin(login.email, login.password, login.description);
    invalidResults.push({ ...login, result });
  }
  
  // Summary
  console.log('\n=== TEST SUMMARY ===\n');
  
  console.log('✅ VALID LOGINS:');
  const validSuccess = validResults.filter(r => r.result.success).length;
  console.log(`Passed: ${validSuccess}/${users.length}`);
  
  console.log('\n🔶 INVALID LOGINS:');
  const invalidExpected = invalidResults.filter(r => !r.result.success && r.result.expected).length;
  console.log(`Expected failures: ${invalidExpected}/${invalidLogins.length}`);
  
  if (validSuccess === users.length && invalidExpected === invalidLogins.length) {
    console.log('\n🎉 ALL TESTS PASSED! The login system is working correctly.');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED! Please review the results above.');
  }
}

// Check if server is running before starting tests
async function checkServerAndRunTests() {
  try {
    await axios.get('http://localhost:5000/health');
    console.log('✅ Server is running. Starting tests...');
    await runTests();
  } catch (error) {
    console.log('❌ Server is not running or not accessible.');
    console.log('Please start the server with:');
    console.log('cd server && node index.js');
  }
}

// Run the tests
checkServerAndRunTests(); 