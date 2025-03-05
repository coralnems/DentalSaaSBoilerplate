require('dotenv').config();
const axios = require('axios');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./src/models/User');

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic';

// Test login function
async function testLogin(email, password) {
  try {
    console.log(`\nAttempting to login with email: ${email}`);
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    
    console.log('Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login failed!');
    console.error('Error status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error message:', error.message);
    
    if (error.response?.data?.stack) {
      console.error('Server stack trace:', error.response.data.stack);
    }
    
    return { success: false, error };
  }
}

// Main test function
async function runTests() {
  console.log('=== CONNECTING TO MONGODB ===');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    
    console.log('MongoDB connected successfully');
    
    // Check if test user exists
    let testUser = await User.findOne({ email: 'admin@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      
      // Create a test user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      testUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await testUser.save();
      console.log('Test user created successfully');
    } else {
      console.log('Test user already exists');
    }
    
    console.log('\n=== TESTING LOGIN API ===');
    
    // Test with correct credentials
    await testLogin('admin@example.com', 'password123');
    
    // Test with incorrect password
    await testLogin('admin@example.com', 'wrongpassword');
    
    // Test with non-existent user
    await testLogin('nonexistent@example.com', 'password123');
    
    console.log('\n=== TESTING COMPLETE ===');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the tests
runTests(); 