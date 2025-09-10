# Environment Setup Guide

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/employee-assessment

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL (for notifications)
FRONTEND_URL=http://localhost:3000
```

## Frontend Environment Variables

Create a `.env` file in the `frontend` directory with:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd frontend
   npm install
   ```

2. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

3. **Create Admin User:**
   ```bash
   cd backend
   node scripts/createAdmin.js
   ```

4. **Start the Application:**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm start

   # Frontend (Terminal 2)
   cd frontend
   npm start
   ```

## Default Admin Credentials

- **Username:** admin
- **Email:** admin@company.com
- **Password:** admin123

## Database Collections

The application will create the following collections:
- `admins` - Admin users
- `employees` - Employee users
- `users` - Authentication references
- `projects` - Project data
- `assessments` - Employee assessments 