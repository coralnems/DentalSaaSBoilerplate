const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Payment = require('../models/Payment');
const Treatment = require('../models/Treatment');

function generateMockData() {
  console.log('[INFO] Starting mock data generation...');
  
  return new Promise(async function(resolve, reject) {
    try {
      // Clear existing data
      await User.deleteMany({});
      await Patient.deleteMany({});
      await Payment.deleteMany({});
      await Treatment.deleteMany({});
      
      console.log('[INFO] Cleared existing data');
      
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        email: 'admin@dentalclinic.com',
        password: adminPassword,
        role: 'admin'
      });
      await admin.save();
      
      // Create dentist users
      const dentists = [];
      const dentistNames = [
        { first: 'John', last: 'Smith' },
        { first: 'Sarah', last: 'Johnson' },
        { first: 'Michael', last: 'Chen' },
        { first: 'Emily', last: 'Rodriguez' }
      ];
      
      for (let i = 0; i < dentistNames.length; i++) {
        const password = await bcrypt.hash('dentist123', 10);
        const dentist = new User({
          firstName: dentistNames[i].first,
          lastName: dentistNames[i].last,
          name: `Dr. ${dentistNames[i].first} ${dentistNames[i].last}`,
          email: `dentist${i+1}@dentalclinic.com`,
          password: password,
          role: 'doctor'
        });
        await dentist.save();
        dentists.push(dentist);
      }
      
      // Create receptionist
      const receptionistPassword = await bcrypt.hash('reception123', 10);
      const receptionist = new User({
        firstName: 'Reception',
        lastName: 'Staff',
        name: 'Reception Staff',
        email: 'reception@dentalclinic.com',
        password: receptionistPassword,
        role: 'receptionist'
      });
      await receptionist.save();
      
      // Generate patients
      const patients = [];
      const patientData = [
        { firstName: 'James', lastName: 'Wilson', age: 37, gender: 'male' },
        { firstName: 'Emma', lastName: 'Taylor', age: 29, gender: 'female' },
        { firstName: 'Robert', lastName: 'Brown', age: 45, gender: 'male' },
        { firstName: 'Olivia', lastName: 'Garcia', age: 32, gender: 'female' },
        { firstName: 'William', lastName: 'Martinez', age: 51, gender: 'male' },
        { firstName: 'Sophia', lastName: 'Lee', age: 27, gender: 'female' },
        { firstName: 'David', lastName: 'Davis', age: 42, gender: 'male' },
        { firstName: 'Emily', lastName: 'Nguyen', age: 35, gender: 'female' },
        { firstName: 'Daniel', lastName: 'Clark', age: 48, gender: 'male' },
        { firstName: 'Isabella', lastName: 'Walker', age: 31, gender: 'female' },
        { firstName: 'Alexander', lastName: 'Anderson', age: 40, gender: 'male' },
        { firstName: 'Mia', lastName: 'White', age: 26, gender: 'female' },
        { firstName: 'Michael', lastName: 'Thompson', age: 55, gender: 'male' },
        { firstName: 'Charlotte', lastName: 'Harris', age: 33, gender: 'female' },
        { firstName: 'Matthew', lastName: 'Lewis', age: 47, gender: 'male' },
        { firstName: 'Amelia', lastName: 'Robinson', age: 30, gender: 'female' },
        { firstName: 'Christopher', lastName: 'Young', age: 39, gender: 'male' },
        { firstName: 'Abigail', lastName: 'Hill', age: 28, gender: 'female' },
        { firstName: 'Andrew', lastName: 'King', age: 52, gender: 'male' },
        { firstName: 'Elizabeth', lastName: 'Baker', age: 34, gender: 'female' }
      ];
      
      for (let i = 0; i < patientData.length; i++) {
        const data = patientData[i];
        
        // Create patient user account
        const patientPassword = await bcrypt.hash('patient123', 10);
        const patientUser = new User({
          firstName: data.firstName,
          lastName: data.lastName,
          name: `${data.firstName} ${data.lastName}`,
          email: `patient${i+1}@example.com`,
          password: patientPassword,
          role: 'patient'
        });
        await patientUser.save();
        
        // Create patient record
        const patient = new Patient({
          firstName: data.firstName,
          lastName: data.lastName,
          email: `patient${i+1}@example.com`,
          phone: `555-${100 + i}-${1000 + i}`,
          dateOfBirth: new Date(1970 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: data.gender,
          address: {
            street: `${1000 + i} Main St`,
            city: 'Dental City',
            state: 'CA',
            zipCode: `9${i}100`
          },
          emergencyContact: {
            name: `Emergency Contact for ${data.firstName}`,
            phone: `555-999-${1000 + i}`,
            relationship: 'Family'
          },
          medicalHistory: {
            allergies: i % 3 === 0 ? ['Penicillin'] : [],
            medications: i % 4 === 0 ? ['Blood pressure medication'] : [],
            conditions: i % 5 === 0 ? ['Diabetes'] : []
          },
          insuranceInfo: {
            provider: ['Delta Dental', 'Cigna', 'Aetna', 'MetLife'][i % 4],
            policyNumber: `POL-${10000 + i}`,
            groupNumber: `GRP-${2000 + i}`
          },
          notes: `Patient notes for ${data.firstName} ${data.lastName}`,
          userId: patientUser._id
        });
        
        await patient.save();
        patients.push(patient);
        
        // Update patient user with patientId reference
        patientUser.patientId = patient._id;
        await patientUser.save();
      }
      
      // Create treatments
      const treatmentTypes = [
        { name: 'Cleaning', description: 'Regular dental cleaning', price: 120, category: 'preventive' },
        { name: 'Filling', description: 'Dental filling procedure', price: 200, category: 'restorative' },
        { name: 'Root Canal', description: 'Root canal therapy', price: 800, category: 'endodontic' },
        { name: 'Crown', description: 'Dental crown placement', price: 1200, category: 'restorative' },
        { name: 'Extraction', description: 'Tooth extraction', price: 250, category: 'oral surgery' },
        { name: 'Whitening', description: 'Teeth whitening procedure', price: 350, category: 'cosmetic' }
      ];
      
      const treatments = [];
      for (let i = 0; i < treatmentTypes.length; i++) {
        const treatment = new Treatment({
          name: treatmentTypes[i].name,
          description: treatmentTypes[i].description,
          price: treatmentTypes[i].price,
          duration: 30 + (i * 15),
          category: treatmentTypes[i].category
        });
        await treatment.save();
        treatments.push(treatment);
      }
      
      // Skip creating payments for now since they have complex requirements
      // that would require more detailed schema analysis
      
      console.log('[INFO] Successfully generated mock data:');
      console.log(`- 1 Admin user (admin@dentalclinic.com / admin123)`);
      console.log(`- ${dentists.length} Dentists (dentist1@dentalclinic.com / dentist123)`);
      console.log(`- 1 Receptionist (reception@dentalclinic.com / reception123)`);
      console.log(`- ${patients.length} Patients (patient1@example.com / patient123)`);
      console.log(`- ${treatments.length} Treatment types`);
      
      // Return the generated data
      resolve({
        admin,
        dentists,
        receptionist,
        patients,
        treatments
      });
      
    } catch (error) {
      console.error('[ERROR] Failed to generate mock data:', error);
      reject(error);
    }
  });
}

module.exports = { generateMockData }; 