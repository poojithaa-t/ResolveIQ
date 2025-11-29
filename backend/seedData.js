const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    phone: '123-456-7890',
    department: 'Computer Science'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    phone: '098-765-4321',
    department: 'Electronics'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    phone: '555-0123',
    department: 'Administration'
  }
];

const sampleComplaints = [
  {
    title: 'WiFi not working in hostel room',
    description: 'The WiFi connection in room 205 has been down for 3 days. Unable to attend online classes.',
    category: 'wifi',
    priority: 'high',
    status: 'pending'
  },
  {
    title: 'Food quality issue in cafeteria',
    description: 'The food served today was not fresh and many students got sick.',
    category: 'food',
    priority: 'medium',
    status: 'pending'
  },
  {
    title: 'Library AC not working',
    description: 'The air conditioning in the library has been broken for a week.',
    category: 'infrastructure',
    priority: 'medium',
    status: 'in-progress'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-complaint-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data (optional)
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Complaint.deleteMany({});

    // Insert users
    console.log('Inserting users...');
    const insertedUsers = await User.insertMany(sampleUsers);
    console.log(`${insertedUsers.length} users inserted`);

    // Insert complaints with proper user references
    console.log('Inserting complaints...');
    const complaintsWithUsers = sampleComplaints.map((complaint, index) => ({
      ...complaint,
      submittedBy: insertedUsers[index % insertedUsers.length]._id
    }));
    
    const insertedComplaints = await Complaint.insertMany(complaintsWithUsers);
    console.log(`${insertedComplaints.length} complaints inserted`);

    console.log('\n=== Sample Data Inserted Successfully ===');
    console.log('\nUsers:');
    insertedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\nComplaints:');
    insertedComplaints.forEach(complaint => {
      console.log(`- ${complaint.title} - Priority: ${complaint.priority}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the seeding
seedDatabase();