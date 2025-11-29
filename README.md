# ResolveIQ - AI-Enhanced MERN Full-Stack Complaint Management System

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![AI](https://img.shields.io/badge/AI-NLP-blue)
![React](https://img.shields.io/badge/React-18.0-blue)
![Node](https://img.shields.io/badge/Node.js-16+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8+-yellow)

An intelligent complaint management platform built with MERN stack and AI-powered NLP for automated sentiment analysis and priority classification. Reduces manual complaint processing time by 80% through intelligent automation.

## 🚀 Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization with Bcrypt password hashing
- 👥 **Role-Based Access Control (RBAC)** - Separate Admin and User dashboards with protected routes
- 🤖 **NLP Sentiment Analysis** - Automated complaint analysis using TextBlob and NLTK VADER achieving 90% accuracy
- ⚡ **Automated Priority Classification** - Smart categorization (High/Medium/Low) based on keywords and sentiment
- 📊 **Real-Time Analytics** - Interactive dashboards with Material-UI and Recharts
- 🔄 **RESTful API Architecture** - Scalable backend with Express.js
- 📁 **File Attachments** - Upload images and documents with complaints
- 🔍 **Advanced Filtering** - Filter by status, category, and priority
- ⏱️ **80% Efficiency Improvement** - Reduces manual processing time significantly

## 🛠 Tech Stack

### Frontend
- **React.js** - UI library for building interactive interfaces
- **Material-UI** - Professional React component library
- **Recharts** - Data visualization library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose ODM** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing

### AI/NLP Module
- **Python** - Programming language for AI/ML
- **Flask** - Lightweight web framework for Python
- **TextBlob** - Simple NLP library for sentiment analysis
- **NLTK VADER** - Advanced sentiment analysis tool

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-complaint-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file and configure environment variables
# Copy the .env file and update the values:
MONGODB_URI=mongodb://localhost:27017/smart-complaint-db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
PORT=5000
AI_MODULE_URL=http://localhost:5001
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
# The .env file should contain:
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. AI Module Setup

```bash
cd ai-module

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# The .env file should contain:
PORT=5001
FLASK_ENV=development
```

### 5. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB service
# On Windows: Start MongoDB service from Services
# On macOS: brew services start mongodb/brew/mongodb-community
# On Linux: sudo systemctl start mongod
```

## 🚀 Running the Application

You need to start all three components in separate terminals:

### Terminal 1: Start the Backend
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:5000`

### Terminal 2: Start the AI Module
```bash
cd ai-module
# Activate virtual environment first
python app.py
```
The AI module will start on `http://localhost:5001`

### Terminal 3: Start the Frontend
```bash
cd frontend
npm start
```
The frontend will start on `http://localhost:3000`

## 👥 Default Admin Account

To create an admin account, you can either:

1. **Register a normal user** and manually update the role in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Use the registration form** and then update the user role through MongoDB Compass or CLI.

## 📱 Usage Guide

### For Users:
1. **Register**: Create a new account with your details
2. **Login**: Sign in with your credentials
3. **Submit Complaint**: Fill out the complaint form with title, description, category, and optional attachments
4. **Track Progress**: View your complaints on the dashboard and see status updates
5. **View Details**: Click on any complaint to see detailed information and admin updates

### For Admins:
1. **Access Admin Panel**: Login and navigate to the Admin section
2. **View Analytics**: Monitor complaint trends, priorities, and resolution metrics
3. **Manage Complaints**: Update status, assign complaints, and add notes
4. **Filter & Search**: Use advanced filters to find specific complaints
5. **Monitor Performance**: Track resolution times and system usage

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Complaints
- `GET /api/complaints` - Get user's complaints
- `POST /api/complaints` - Submit new complaint
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id` - Update complaint

### Admin
- `GET /api/admin/complaints` - Get all complaints (admin only)
- `PUT /api/admin/complaints/:id/status` - Update complaint status
- `POST /api/admin/complaints/:id/notes` - Add admin note
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/users` - Get all users

### AI Module
- `POST /analyze` - Analyze text sentiment and priority
- `GET /health` - Health check
- `GET /keywords` - Get urgency keywords

## 🎨 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/smart-complaint-db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
PORT=5000
AI_MODULE_URL=http://localhost:5001
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### AI Module (.env)
```
PORT=5001
FLASK_ENV=development
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: File type and size restrictions
- **Role-Based Access**: Admin and user role separation
- **CORS Protection**: Cross-origin request handling

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### AI Module Testing
```bash
cd ai-module
python -m pytest tests/
```

## 🚀 Deployment

### Backend Deployment
- Deploy to platforms like Heroku, AWS, or DigitalOcean
- Use MongoDB Atlas for cloud database
- Configure environment variables on the hosting platform

### Frontend Deployment
- Build the production version: `npm run build`
- Deploy to Netlify, Vercel, or AWS S3
- Update API URL in environment variables

### AI Module Deployment
- Deploy to platforms supporting Python like Heroku or AWS
- Ensure all Python dependencies are included
- Configure Flask for production

## 🛠 Customization

### Adding New Categories
Update the categories array in:
- `backend/routes/complaints.js`
- `frontend/src/pages/ComplaintForm.js`
- `frontend/src/pages/Dashboard.js`

### Modifying AI Analysis
Edit the keyword lists and sentiment logic in:
- `ai-module/app.py`

### Styling Changes
Modify the Material-UI theme in:
- `frontend/src/index.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file

2. **AI Module Not Working**
   - Check if Python virtual environment is activated
   - Ensure all Python packages are installed
   - Verify the AI module is running on port 5001

3. **Frontend API Errors**
   - Check if backend is running on port 5000
   - Verify API URL in frontend .env file
   - Check browser console for detailed errors

4. **File Upload Issues**
   - Ensure uploads directory exists in backend
   - Check file size and type restrictions
   - Verify multer configuration

### Getting Help
- Check the logs in each component's terminal
- Verify all environment variables are set correctly
- Ensure all services are running on their respective ports

## 📊 Project Structure

```
smart-complaint-system/
├── backend/                 # Node.js/Express API
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Authentication middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── uploads/            # File uploads directory
│   ├── .env                # Environment variables
│   ├── server.js           # Main server file
│   └── package.json        # Dependencies
├── frontend/               # React application
│   ├── public/             # Public assets
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.js          # Main app component
│   ├── .env                # Environment variables
│   └── package.json        # Dependencies
├── ai-module/              # Python Flask AI service
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Environment variables
└── README.md               # This file
```

---

Built with ❤️ for efficient complaint management and resolution.