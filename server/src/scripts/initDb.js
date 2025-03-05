const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Import models
const User = require('../models/User');
const Patient = require('../models/Patient');

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:32768/dental-clinic';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Sample user data
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    firstName: 'Doctor',
    lastName: 'Smith',
    email: 'doctor@example.com',
    password: 'doctor123',
    role: 'doctor'
  },
  {
    firstName: 'Reception',
    lastName: 'Desk',
    email: 'reception@example.com',
    password: 'reception123',
    role: 'receptionist'
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'patient@example.com',
    password: 'patient123',
    role: 'patient'
  }
];

// Sample patient data
const patients = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'patient@example.com',
    phone: '123-456-7890',
    dateOfBirth: new Date('1990-01-15'),
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    },
    medicalHistory: {
      allergies: ['Penicillin', 'Peanuts'],
      medications: ['Ibuprofen'],
      conditions: ['Asthma'],
      notes: 'Patient has mild asthma'
    },
    insuranceInfo: {
      provider: 'Health Insurance Co',
      policyNumber: 'POL123456',
      groupNumber: 'GRP789',
      coverageDetails: 'Dental coverage includes cleanings and fillings'
    }
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '987-654-3210',
    dateOfBirth: new Date('1985-05-20'),
    address: {
      street: '456 Oak Ave',
      city: 'Somewhere',
      state: 'NY',
      zipCode: '67890',
      country: 'USA'
    },
    medicalHistory: {
      allergies: ['Sulfa drugs'],
      medications: ['Lisinopril'],
      conditions: ['Hypertension'],
      notes: 'Patient needs to monitor blood pressure'
    },
    insuranceInfo: {
      provider: 'Dental Care Plus',
      policyNumber: 'DCP987654',
      groupNumber: 'GRP321',
      coverageDetails: 'Full coverage for preventive care'
    }
  }
];

// Function to initialize the database
async function initializeDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    console.log('Cleared existing data');

    // Create users with hashed passwords
    const userPromises = users.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      return new User({
        ...user,
        password: hashedPassword
      }).save();
    });

    const createdUsers = await Promise.all(userPromises);
    console.log('\n===== USER LOGIN CREDENTIALS =====');
    createdUsers.forEach(user => {
      console.log(`- ${user.role.toUpperCase()}: ${user.email} / Password: ${users.find(u => u.email === user.email).password}`);
    });

    // Create patients
    const createdPatients = await Patient.insertMany(patients);
    console.log(`\nCreated ${createdPatients.length} patients`);

    console.log('\nDatabase initialization complete!');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 