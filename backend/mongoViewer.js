const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-complaint-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(express.static('public'));

// Routes
app.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role department createdAt').sort({ createdAt: -1 });
    const complaints = await Complaint.find({})
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    const stats = {
      totalUsers: users.length,
      totalComplaints: complaints.length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      pendingComplaints: complaints.filter(c => c.status === 'pending').length,
      highPriorityComplaints: complaints.filter(c => c.priority === 'high').length
    };

    res.render('dashboard', { users, complaints, stats });
  } catch (error) {
    res.status(500).send('Error fetching data: ' + error.message);
  }
});

// API endpoints for JSON data
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔍 MongoDB Viewer running at http://localhost:${PORT}`);
  console.log('📊 View your database data in a nice interface!');
});

module.exports = app;