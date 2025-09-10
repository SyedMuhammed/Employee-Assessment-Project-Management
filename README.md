# Employee Assessment System

A comprehensive employee assessment and management system built with React, Node.js, and MongoDB.

## 🚀 Features

### Backend Features
- **Separate User Models**: Distinct Admin and Employee models for better data organization
- **Role-based Authentication**: Secure JWT-based authentication for admins and employees
- **Assessment Management**: Complete CRUD operations for employee assessments
- **Employee Management**: Full employee lifecycle management
- **Project Management**: Track employee projects and performance
- **Real-time Notifications**: Socket.io integration for live updates
- **Data Analytics**: Comprehensive reporting and statistics

### Frontend Features
- **Modern UI/UX**: Beautiful, responsive design with dark/light themes
- **Role-based Dashboard**: Different interfaces for admins and employees
- **Real-time Updates**: Live data synchronization
- **Form Validation**: Comprehensive input validation and error handling
- **Loading States**: Smooth loading animations and skeleton screens
- **Responsive Design**: Works perfectly on all device sizes

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **bcryptjs** - Password hashing
- **express-rate-limit** - Rate limiting

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## 📁 Project Structure

```
employee-assessment-app/
├── backend/
│   ├── models/
│   │   ├── Admin.js          # Admin user model
│   │   ├── Employee.js       # Employee model
│   │   ├── User.js          # Authentication reference model
│   │   ├── Project.js       # Project model
│   │   └── Assessment.js    # Assessment model
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── employees.js     # Employee management
│   │   ├── projects.js      # Project management
│   │   ├── assessments.js   # Assessment management
│   │   └── notifications.js # Notification system
│   ├── scripts/
│   │   └── createAdmin.js   # Admin user creation script
│   └── server.js            # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
└── setup-env.md            # Environment setup guide
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Clone the Repository
   ```bash
   git clone <repository-url>
   cd employee-assessment-app
   ```

### 2. Backend Setup
   ```bash
   cd backend
   npm install
   ```

Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/employee-assessment
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=24h
   PORT=5000
   NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
   ```

### 4. Database Setup
   ```bash
# Start MongoDB (if not already running)
mongod

# Create admin user
   cd backend
   node scripts/createAdmin.js
   ```

### 5. Start the Application
   ```bash
# Backend (Terminal 1)
   cd backend
npm start

# Frontend (Terminal 2)
   cd frontend
   npm start
   ```

## 👤 Default Credentials

### Admin Access
- **Username:** admin
- **Email:** admin@company.com
- **Password:** admin123

## 🔐 Authentication System

### Admin Authentication
- Username-based login
- Full system access
- User management capabilities

### Employee Authentication
- Email-based login
- Limited access to personal data
- Assessment viewing capabilities

## 📊 Database Collections

- **admins** - Admin user accounts
- **employees** - Employee profiles and data
- **users** - Authentication references
- **projects** - Project information
- **assessments** - Employee evaluation data

## 🎯 Key Features Implemented

### ✅ Backend Fixes
- [x] Separate Admin and Employee models
- [x] Role-based user creation and authentication
- [x] Proper password hashing and validation
- [x] Comprehensive error handling and logging
- [x] Assessment management system
- [x] Real-time notification system
- [x] Data validation and sanitization

### ✅ Frontend Fixes
- [x] User greeting with personalized welcome message
- [x] Fixed form scrolling issues in AddEditEmployee
- [x] Enhanced form validation and error handling
- [x] Loading states and skeleton screens
- [x] Responsive design improvements
- [x] Better error messages and user feedback
- [x] Smooth animations and transitions

### ✅ Security Improvements
- [x] JWT token validation
- [x] Role-based access control
- [x] Password hashing with bcrypt
- [x] Rate limiting for API endpoints
- [x] Input validation and sanitization
- [x] Secure session management

## 🚀 Deployment

### Production Environment Variables
```env
MONGODB_URI=mongodb://your-production-mongo-uri
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### Build Commands
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ using React, Node.js, and MongoDB** 