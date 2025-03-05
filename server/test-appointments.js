const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Helper function to get a valid token
const getToken = async () => {
  try {
    // Try to login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@healthcareapps.org',
      password: 'password123'
    });
    
    return loginResponse.data.token;
  } catch (error) {
    console.error('Error getting token:', error.message);
    throw error;
  }
};

// Main function to test appointments
const testAppointments = async () => {
  try {
    console.log('🔍 Testing appointments API...');
    
    // Get authentication token
    const token = await getToken();
    console.log('✅ Got authentication token');
    
    // Check token validity and user role
    const decoded = jwt.decode(token);
    console.log(`👤 Logged in as: ${decoded.email} (${decoded.role})`);
    
    // Make request to the appointments endpoint
    const response = await axios.get('http://localhost:5000/api/appointments', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        page: 1,
        limit: 10,
        status: 'scheduled'
      }
    });
    
    console.log('✅ Appointments API response:');
    
    if (response.data && response.data.appointments) {
      console.log(`📊 Total appointments: ${response.data.pagination.total}`);
      console.log(`📋 Appointments returned: ${response.data.appointments.length}`);
      
      if (response.data.appointments.length > 0) {
        console.log('\n📝 First appointment:');
        const firstAppointment = response.data.appointments[0];
        console.log(`ID: ${firstAppointment._id}`);
        console.log(`Patient: ${firstAppointment.patient?.firstName} ${firstAppointment.patient?.lastName}`);
        console.log(`Dentist: ${firstAppointment.dentist?.firstName} ${firstAppointment.dentist?.lastName}`);
        console.log(`Time: ${new Date(firstAppointment.startTime).toLocaleString()}`);
        console.log(`Status: ${firstAppointment.status}`);
      } else {
        console.log('\n⚠️ No appointments found. The list is empty.');
      }
    } else {
      console.log('\n⚠️ Unexpected response format:', response.data);
    }
    
  } catch (error) {
    console.error('\n❌ Error testing appointments:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
};

// Run the test
testAppointments(); 