const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function insertSingleRecords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-complaint-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Method 1: Insert one user
    console.log('=== Method 1: Insert Single User ===');
    const newUser = new User({
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'user',
      phone: '555-0199',
      department: 'Mechanical Engineering'
    });
    
    const savedUser = await newUser.save();
    console.log('✅ User inserted:', savedUser.name, '-', savedUser.email);

    // Method 2: Insert one complaint
    console.log('\n=== Method 2: Insert Single Complaint ===');
    const newComplaint = new Complaint({
      title: 'Broken elevator in Engineering building',
      description: 'The elevator in the Engineering building has been out of order for a week. Students have to climb 5 floors.',
      category: 'infrastructure',
      priority: 'high',
      submittedBy: savedUser._id
    });

    const savedComplaint = await newComplaint.save();
    console.log('✅ Complaint inserted:', savedComplaint.title);

    // Method 3: Insert multiple records at once
    console.log('\n=== Method 3: Insert Multiple Users ===');
    const multipleUsers = [
      {
        name: 'Mike Wilson',
        email: 'mike@example.com',
        password: 'password123',
        department: 'Chemistry'
      },
      {
        name: 'Lisa Brown',
        email: 'lisa@example.com',
        password: 'password123',
        department: 'Physics'
      }
    ];

    const insertedUsers = await User.insertMany(multipleUsers);
    console.log(`✅ ${insertedUsers.length} users inserted:`);
    insertedUsers.forEach(user => console.log(`   - ${user.name} (${user.email})`));

    // Method 4: Insert with findOneAndUpdate (upsert)
    console.log('\n=== Method 4: Upsert Example ===');
    const upsertedUser = await User.findOneAndUpdate(
      { email: 'update@example.com' }, // Query
      { 
        name: 'Updated User',
        email: 'update@example.com',
        password: 'password123',
        department: 'Computer Science'
      }, // Update
      { 
        new: true,        // Return the updated document
        upsert: true      // Create if doesn't exist
      }
    );
    console.log('✅ User upserted:', upsertedUser.name);

    // Show all data
    console.log('\n=== Current Database Contents ===');
    const allUsers = await User.find({}, 'name email role department');
    const allComplaints = await Complaint.find({}).populate('submittedBy', 'name email');
    
    console.log(`\nUsers (${allUsers.length}):`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.department || 'No dept'}`);
    });

    console.log(`\nComplaints (${allComplaints.length}):`);
    allComplaints.forEach((complaint, index) => {
      console.log(`${index + 1}. ${complaint.title} - ${complaint.priority} - By: ${complaint.submittedBy.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

// Run the insertion examples
insertSingleRecords();