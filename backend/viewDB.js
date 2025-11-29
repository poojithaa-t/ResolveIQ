const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const dotenv = require('dotenv');

dotenv.config();

// ANSI color codes for colorful output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(title) {
  console.log('\n' + '='.repeat(60));
  console.log(colorize(title, 'cyan'));
  console.log('='.repeat(60));
}

function printStats(stats) {
  console.log(`📊 ${colorize('Database Statistics:', 'bright')}`);
  console.log(`   👥 Total Users: ${colorize(stats.totalUsers, 'green')}`);
  console.log(`   📝 Total Complaints: ${colorize(stats.totalComplaints, 'blue')}`);
  console.log(`   👑 Admin Users: ${colorize(stats.adminUsers, 'yellow')}`);
  console.log(`   ⏳ Pending Complaints: ${colorize(stats.pendingComplaints, 'red')}`);
  console.log(`   🔥 High Priority: ${colorize(stats.highPriorityComplaints, 'magenta')}`);
}

async function viewDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-complaint-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    printHeader('🔍 MONGODB DATABASE VIEWER - SMART COMPLAINT SYSTEM');

    // Get all data
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    const complaints = await Complaint.find({}).populate('submittedBy', 'name email').sort({ createdAt: -1 });

    // Calculate stats
    const stats = {
      totalUsers: users.length,
      totalComplaints: complaints.length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      pendingComplaints: complaints.filter(c => c.status === 'pending').length,
      highPriorityComplaints: complaints.filter(c => c.priority === 'high').length
    };

    printStats(stats);

    // Display Users
    printHeader('👥 USERS');
    if (users.length > 0) {
      users.forEach((user, index) => {
        const roleColor = user.role === 'admin' ? 'red' : 'blue';
        const roleIcon = user.role === 'admin' ? '👑' : '👤';
        
        console.log(`${index + 1}. ${roleIcon} ${colorize(user.name, 'bright')} (${colorize(user.email, 'cyan')})`);
        console.log(`   Role: ${colorize(user.role.toUpperCase(), roleColor)}`);
        console.log(`   Department: ${user.department || 'Not specified'}`);
        console.log(`   Created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`);
        console.log('');
      });
    } else {
      console.log(colorize('No users found', 'yellow'));
    }

    // Display Complaints
    printHeader('📝 COMPLAINTS');
    if (complaints.length > 0) {
      complaints.forEach((complaint, index) => {
        const priorityColor = {
          high: 'red',
          medium: 'yellow',
          low: 'green'
        }[complaint.priority] || 'white';

        const statusColor = {
          pending: 'yellow',
          'in-progress': 'blue',
          resolved: 'green',
          closed: 'magenta'
        }[complaint.status] || 'white';

        const priorityIcon = {
          high: '🔥',
          medium: '⚡',
          low: '📌'
        }[complaint.priority] || '📝';

        console.log(`${index + 1}. ${priorityIcon} ${colorize(complaint.title, 'bright')}`);
        console.log(`   📖 ${complaint.description.substring(0, 80)}${complaint.description.length > 80 ? '...' : ''}`);
        console.log(`   📂 Category: ${complaint.category}`);
        console.log(`   🚨 Priority: ${colorize(complaint.priority.toUpperCase(), priorityColor)}`);
        console.log(`   📊 Status: ${colorize(complaint.status.toUpperCase(), statusColor)}`);
        console.log(`   👤 By: ${complaint.submittedBy ? complaint.submittedBy.name : 'Unknown'} (${complaint.submittedBy ? complaint.submittedBy.email : 'N/A'})`);
        console.log(`   📅 Created: ${complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}`);
        console.log('');
      });
    } else {
      console.log(colorize('No complaints found', 'yellow'));
    }

    printHeader('✅ DATABASE VIEW COMPLETE');
    console.log(`${colorize('💡 Tip:', 'yellow')} Use ${colorize('node mongoViewer.js', 'green')} for a web interface at http://localhost:3001`);

  } catch (error) {
    console.error(colorize('❌ Error connecting to database:', 'red'), error.message);
  } finally {
    await mongoose.connection.close();
    console.log(colorize('\n🔒 Database connection closed', 'green'));
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colorize('📚 MongoDB Viewer Commands:', 'cyan')}

${colorize('node viewDB.js', 'green')}          - View all data
${colorize('node viewDB.js --users', 'green')}   - View only users
${colorize('node viewDB.js --complaints', 'green')} - View only complaints
${colorize('node viewDB.js --stats', 'green')}   - View only statistics
${colorize('node viewDB.js --help', 'green')}    - Show this help

${colorize('Web Interface:', 'yellow')}
${colorize('node mongoViewer.js', 'green')}      - Start web viewer at http://localhost:3001
  `);
  process.exit(0);
}

// Run the viewer
viewDatabase();