require('dotenv').config();
const mongoose = require('mongoose');
const { logger } = require('./src/middleware/errorHandler');

async function testMongoDBConnection() {
  try {
    // Get MongoDB connection string from environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic';
    
    logger.info(`Attempting to connect to MongoDB at ${mongoURI}`);
    
    // Connect to MongoDB with simpler options
    await mongoose.connect(mongoURI);
    
    logger.info('Connected to MongoDB successfully!');
    
    // Check connection status
    logger.info(`MongoDB connection state: ${mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'}`);
    
    // Test database access by creating a test collection
    const testCollection = mongoose.connection.collection('connectionTest');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    const result = await testCollection.findOne({ test: true });
    
    logger.info(`Test document saved and retrieved: ${result ? 'success' : 'failed'}`);
    await testCollection.deleteMany({ test: true });
    
    // Close connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the test
testMongoDBConnection(); 