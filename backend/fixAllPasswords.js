const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

async function fixAllUserPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-complaint-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    // Get all users except the ones we know work
    const usersToFix = [
      'john@example.com',
      'jane@example.com', 
      'sarah@example.com',
      'mike@example.com',
      'lisa@example.com',
      'update@example.com'
    ];

    console.log('🔧 Fixing passwords for seeded users...\n');

    for (const email of usersToFix) {
      const user = await User.findOne({ email });
      if (user) {
        console.log(`👤 Fixing password for: ${user.name} (${email})`);
        
        // Set password (this triggers the hashing middleware)
        user.password = 'password123';
        await user.save();
        
        // Test the login
        const testLogin = await user.comparePassword('password123');
        console.log(`   🔍 Password test: ${testLogin ? '✅ SUCCESS' : '❌ FAILED'}`);
      }
    }

    console.log('\n🎉 All user passwords have been fixed!');
    console.log('\n📋 Working Login Credentials:');
    console.log('   👑 Admin: admin@example.com / admin123');
    console.log('   👤 Users: [any seeded user] / password123');
    console.log('   👤 New User: testnewuser@example.com / password123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

fixAllUserPasswords();