const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

async function debugPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-complaint-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    // Test bcrypt directly
    const plainPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('🔍 Direct bcrypt test:');
    console.log('Plain password:', plainPassword);
    console.log('Hashed password:', hashedPassword.substring(0, 30) + '...');
    
    const isValidDirect = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Direct comparison result:', isValidDirect ? '✅ SUCCESS' : '❌ FAILED');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    console.log('\n👑 Admin user password in DB:', adminUser.password.substring(0, 30) + '...');
    
    // Test comparison directly with bcrypt
    const directCompare = await bcrypt.compare('admin123', adminUser.password);
    console.log('Direct bcrypt compare with DB password:', directCompare ? '✅ SUCCESS' : '❌ FAILED');
    
    // Test with user method
    const userMethod = await adminUser.comparePassword('admin123');
    console.log('User method compare:', userMethod ? '✅ SUCCESS' : '❌ FAILED');

    // Let's also check if the comparePassword method exists
    console.log('\n🔍 User methods available:');
    console.log('comparePassword method exists:', typeof adminUser.comparePassword === 'function');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

debugPassword();