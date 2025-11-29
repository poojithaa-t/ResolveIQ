const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-complaint-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('👑 Admin user found:', adminUser.name);
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Hashed password:', adminUser.password.substring(0, 20) + '...');

    // Test password comparison
    const testPassword = 'admin123';
    const isValid = await adminUser.comparePassword(testPassword);
    
    console.log(`\n🔍 Testing password "${testPassword}":`, isValid ? '✅ VALID' : '❌ INVALID');

    // Try other possible passwords
    const passwords = ['password123', 'admin', 'Admin123'];
    
    for (const pwd of passwords) {
      const valid = await adminUser.comparePassword(pwd);
      console.log(`🔍 Testing password "${pwd}":`, valid ? '✅ VALID' : '❌ INVALID');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

testLogin();