const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Treatment = require('../models/Treatment');
const Appointment = require('../models/Appointment');
const redis = require('./redis');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    // Use environment variable or fallback to a local MongoDB URI
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/dental-clinic';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Clear database
async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Treatment.deleteMany({});
    await Appointment.deleteMany({});
    console.log('Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

// Clear Redis cache
async function clearRedisCache() {
  try {
    await redis.flushdb();
    console.log('Redis cache cleared');
  } catch (error) {
    console.error('Error clearing Redis cache:', error);
    // Continue even if Redis clear fails
  }
}

// Create users
async function createUsers() {
  try {
    // Clear existing users
    await User.deleteMany({});
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    // Create doctor users (previously dentist)
    const johnDoe = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'doctor'  // Changed from 'dentist' to 'doctor'
    });
    
    const janeSmith = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'doctor'  // Changed from 'dentist' to 'doctor'
    });
    
    // Create receptionist
    const receptionist = await User.create({
      name: 'Reception Staff',
      email: 'reception@example.com',
      password: 'password123',
      role: 'receptionist'
    });
    
    console.log('Users created successfully');
    return { admin, doctors: [johnDoe, janeSmith], receptionist };
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
}

// Create patients
async function createPatients() {
  try {
    const patients = [
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@example.com',
        phone: '555-123-4567',
        dateOfBirth: new Date('1985-03-15'),
        address: {
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02108',
        },
        medicalHistory: {
          allergies: ['Penicillin'],
          conditions: ['Hypertension'],
          medications: ['Lisinopril'],
        },
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@example.com',
        phone: '555-234-5678',
        dateOfBirth: new Date('1990-07-22'),
        address: {
          street: '456 Oak Ave',
          city: 'Boston',
          state: 'MA',
          zipCode: '02109',
        },
        medicalHistory: {
          allergies: [],
          conditions: [],
          medications: [],
        },
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@example.com',
        phone: '555-345-6789',
        dateOfBirth: new Date('1978-11-30'),
        address: {
          street: '789 Pine Rd',
          city: 'Cambridge',
          state: 'MA',
          zipCode: '02138',
        },
        medicalHistory: {
          allergies: ['Latex'],
          conditions: ['Diabetes'],
          medications: ['Metformin'],
        },
      },
      {
        firstName: 'Sophia',
        lastName: 'Martinez',
        email: 'sophia.martinez@example.com',
        phone: '555-456-7890',
        dateOfBirth: new Date('1995-05-10'),
        address: {
          street: '101 Elm St',
          city: 'Somerville',
          state: 'MA',
          zipCode: '02143',
        },
        medicalHistory: {
          allergies: [],
          conditions: ['Asthma'],
          medications: ['Albuterol'],
        },
      },
      {
        firstName: 'James',
        lastName: 'Taylor',
        email: 'james.taylor@example.com',
        phone: '555-567-8901',
        dateOfBirth: new Date('1982-09-18'),
        address: {
          street: '202 Maple Ave',
          city: 'Brookline',
          state: 'MA',
          zipCode: '02445',
        },
        medicalHistory: {
          allergies: ['Sulfa'],
          conditions: [],
          medications: [],
        },
      },
    ];

    const createdPatients = await Patient.insertMany(patients);
    console.log(`${createdPatients.length} patients created`);
    return createdPatients;
  } catch (error) {
    console.error('Error creating patients:', error);
    process.exit(1);
  }
}

// Create treatments
async function createTreatments() {
  try {
    const treatments = [
      {
        name: 'Regular Cleaning',
        description: 'Standard dental cleaning procedure',
        price: 120,
        duration: 30, // in minutes
      },
      {
        name: 'Deep Cleaning',
        description: 'Thorough cleaning for patients with gum disease',
        price: 200,
        duration: 60,
      },
      {
        name: 'Filling',
        description: 'Dental filling for cavities',
        price: 150,
        duration: 45,
      },
      {
        name: 'Root Canal',
        description: 'Endodontic treatment for infected tooth pulp',
        price: 800,
        duration: 90,
      },
      {
        name: 'Crown',
        description: 'Dental crown placement',
        price: 1200,
        duration: 60,
      },
      {
        name: 'Extraction',
        description: 'Tooth extraction procedure',
        price: 180,
        duration: 30,
      },
      {
        name: 'Whitening',
        description: 'Professional teeth whitening',
        price: 350,
        duration: 60,
      },
    ];

    const createdTreatments = await Treatment.insertMany(treatments);
    console.log(`${createdTreatments.length} treatments created`);
    return createdTreatments;
  } catch (error) {
    console.error('Error creating treatments:', error);
    process.exit(1);
  }
}

// Create appointments
async function createAppointments(patients, users) {
  try {
    // Clear existing appointments
    await Appointment.deleteMany({});
    
    const appointments = [];
    const treatments = await Treatment.find({});
    
    // Get doctors (users with role 'doctor')
    const doctors = users.doctors;
    
    // Create appointments for the next 30 days
    const today = new Date();
    today.setHours(9, 0, 0, 0); // Start at 9 AM
    
    for (let i = 0; i < 30; i++) {
      const appointmentDate = new Date(today);
      appointmentDate.setDate(today.getDate() + i);
      
      // Skip weekends
      if (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6) {
        continue;
      }
      
      // Create 3-5 appointments per day
      const appointmentsPerDay = Math.floor(Math.random() * 3) + 3;
      
      for (let j = 0; j < appointmentsPerDay; j++) {
        // Random doctor, patient, and treatment
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const patient = patients[Math.floor(Math.random() * patients.length)];
        const treatment = treatments[Math.floor(Math.random() * treatments.length)];
        
        // Random start time between 9 AM and 4 PM
        const startHour = Math.floor(Math.random() * 7) + 9;
        const startMinute = [0, 30][Math.floor(Math.random() * 2)]; // Either 0 or 30
        
        const startTime = new Date(appointmentDate);
        startTime.setHours(startHour, startMinute, 0, 0);
        
        // End time based on treatment duration
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + treatment.duration);
        
        // Random status
        const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
        const statusWeights = [0.3, 0.3, 0.2, 0.1, 0.1]; // Weights for random selection
        
        let statusIndex = 0;
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let k = 0; k < statusWeights.length; k++) {
          cumulativeWeight += statusWeights[k];
          if (random < cumulativeWeight) {
            statusIndex = k;
            break;
          }
        }
        
        const status = statuses[statusIndex];
        
        // Create appointment
        appointments.push({
          patient: patient._id,
          dentist: doctor._id,
          startTime: startTime,
          endTime: endTime,
          status: status,
          type: treatment.name.toLowerCase().includes('cleaning') ? 'cleaning' : 
                treatment.name.toLowerCase().includes('canal') ? 'emergency' :
                treatment.name.toLowerCase().includes('extraction') ? 'surgery' :
                'checkup',
          notes: `${treatment.name} appointment for ${patient.firstName} ${patient.lastName}`,
          treatment: treatment._id,
          createdBy: users.admin._id, // Admin user
        });
      }
    }
    
    const createdAppointments = await Appointment.insertMany(appointments);
    console.log(`${createdAppointments.length} appointments created`);
    return createdAppointments;
  } catch (error) {
    console.error('Error creating appointments:', error);
    process.exit(1);
  }
}

// Main seeder function
async function seedDatabase() {
  try {
    await connectDB();
    await clearDatabase();
    await clearRedisCache();
    
    const users = await createUsers();
    const patients = await createPatients();
    const treatments = await createTreatments();
    await createAppointments(patients, users);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase(); 
