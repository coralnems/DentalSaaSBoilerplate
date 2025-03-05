# MongoDB Integration Guide

This guide explains how to use MongoDB in the MERN Boilerplate application.

## Docker Container Configuration

The application uses a MongoDB Docker container with the following configuration:

```json
{
  "Id": "fb7436baf0540929a0d5ca6f2076b9109f53b752bf82b3750d91a10300c88bb7",
  "Image": "mongodb/mongodb-community-server:5.0-ubi8",
  "Ports": {
    "27017/tcp": "32768"
  },
  "IPAddress": "localhost",
  "IPPrefixLen": 16
}
```

## Environment Variables

### Server (.env)

```
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:32768/dental-clinic
MONGO_HOST=localhost
MONGO_PORT=32768
MONGO_DB=dental-clinic
MONGO_USER=
MONGO_PASSWORD=
```

## Database Connection

The application connects to MongoDB using Mongoose. The connection is established in `server/src/config/database.js`:

```javascript
const mongoose = require('mongoose');
const { logger } = require('../middleware/errorHandler');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:32768/dental-clinic';
    
    const options = {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(mongoURI, options);
    
    logger.info('MongoDB connected successfully');
    
    // Ping the database to verify connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    logger.info('MongoDB connection verified - Database responded to ping');
    
    return mongoose.connection;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

## Models

The application uses Mongoose models to define the schema for the data stored in MongoDB. Here's an example of a model:

```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  medicalHistory: {
    allergies: [String],
    medications: [String],
    conditions: [String],
    notes: String
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    coverageDetails: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
patientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
```

## Usage Examples

### Creating a Document

```javascript
const Patient = require('../models/Patient');

const createPatient = async (patientData) => {
  try {
    const patient = new Patient(patientData);
    await patient.save();
    return patient;
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
};
```

### Finding Documents

```javascript
const Patient = require('../models/Patient');

// Find all patients
const getAllPatients = async () => {
  try {
    return await Patient.find();
  } catch (error) {
    console.error('Error getting patients:', error);
    throw error;
  }
};

// Find a patient by ID
const getPatientById = async (id) => {
  try {
    return await Patient.findById(id);
  } catch (error) {
    console.error('Error getting patient:', error);
    throw error;
  }
};

// Find patients with query
const findPatients = async (query) => {
  try {
    return await Patient.find(query);
  } catch (error) {
    console.error('Error finding patients:', error);
    throw error;
  }
};
```

### Updating a Document

```javascript
const Patient = require('../models/Patient');

const updatePatient = async (id, updates) => {
  try {
    return await Patient.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};
```

### Deleting a Document

```javascript
const Patient = require('../models/Patient');

const deletePatient = async (id) => {
  try {
    return await Patient.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};
```

## Monitoring MongoDB

You can monitor MongoDB using the MongoDB shell:

```bash
docker exec -it youthful_ellis mongosh
```

Common commands:
- `show dbs` - List all databases
- `use dental-clinic` - Switch to the dental-clinic database
- `show collections` - List all collections in the current database
- `db.patients.find()` - List all documents in the patients collection
- `db.patients.count()` - Count documents in the patients collection
- `db.stats()` - Show database statistics 