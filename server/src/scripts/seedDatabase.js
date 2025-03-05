require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const { generateMockData } = require('../utils/mockDataGenerator');

// Database connection URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/dental-clinic';

// Connect to MongoDB
function connectDB() {
  return new Promise(function(resolve, reject) {
    mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(function() {
      console.log('[INFO] MongoDB Connected');
      resolve(true);
    })
    .catch(function(err) {
      console.error('[ERROR] MongoDB Connection Error:', err.message);
      reject(err);
    });
  });
}

// Seed the database with mock data
function seedDatabase() {
  // Connect to the database
  connectDB()
    .then(function() {
      // Generate and insert mock data
      return generateMockData();
    })
    .then(function() {
      console.log('[SUCCESS] Database seeded successfully');
      process.exit(0);
    })
    .catch(function(error) {
      console.error('[ERROR] Failed to seed database:', error);
      process.exit(1);
    });
}

// Run the seeding function
seedDatabase(); 