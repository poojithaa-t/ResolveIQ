const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

async function fixAdminPassword() {
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

    console.log('👑 Found admin user:', adminUser.name);
    
    // Update the password (this will trigger the hashing middleware)
    adminUser.password = 'admin123';
    await adminUser.save();
    
    console.log('✅ Admin password updated and hashed');

    // Test the login now
    const isValid = await adminUser.comparePassword('admin123');
    console.log('🔍 Testing login with "admin123":', isValid ? '✅ SUCCESS' : '❌ FAILED');

    // Also fix other users
    const users = await User.find({});
    for (const user of users) {
      if (user.email !== 'admin@example.com') {
        user.password = 'password123';
        await user.save();
        console.log(`✅ Fixed password for ${user.name}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

fixAdminPassword();