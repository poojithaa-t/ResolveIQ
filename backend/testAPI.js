const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('=== Testing API Endpoints ===\n');

    // Test user registration
    console.log('1. Registering a new user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'API Test User',
      email: 'apitest@example.com',
      password: 'password123',
      department: 'API Testing',
      phone: '123-456-7890'
    });
    
    console.log('✅ User registered successfully!');
    console.log('User:', registerResponse.data.user);
    console.log('Token:', registerResponse.data.token.substring(0, 20) + '...');
    
    const token = registerResponse.data.token;
    const userId = registerResponse.data.user.id;

    // Test creating a complaint
    console.log('\n2. Creating a new complaint...');
    const complaintResponse = await axios.post(`${BASE_URL}/complaints`, {
      title: 'API Test Complaint',
      description: 'This is a test complaint created via API to demonstrate data insertion.',
      category: 'other',
      priority: 'medium'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Complaint created successfully!');
    console.log('Complaint ID:', complaintResponse.data.complaint._id);
    console.log('Title:', complaintResponse.data.complaint.title);
    console.log('Status:', complaintResponse.data.complaint.status);

    console.log('\n=== API Test Completed Successfully! ===');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

// Test login with existing user
async function testLogin() {
  try {
    console.log('\n=== Testing Login with Existing User ===');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@example.com',
      password: 'password123'
    });

    console.log('✅ Login successful!');
    console.log('User:', loginResponse.data.user);
    
    const token = loginResponse.data.token;

    // Get user complaints
    console.log('\nFetching user complaints...');
    const complaintsResponse = await axios.get(`${BASE_URL}/complaints`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Complaints fetched!');
    console.log(`Found ${complaintsResponse.data.complaints.length} complaints`);
    
    complaintsResponse.data.complaints.forEach((complaint, index) => {
      console.log(`${index + 1}. ${complaint.title} - ${complaint.status}`);
    });

  } catch (error) {
    if (error.response) {
      console.error('❌ Login Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

// Run tests
async function runAllTests() {
  await testAPI();
  await testLogin();
}

runAllTests();