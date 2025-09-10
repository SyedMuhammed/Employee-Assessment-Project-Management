# MongoDB Setup Guide for Employee Assessment App

## Option 1: MongoDB Atlas (Cloud - Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create"

### Step 3: Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP addresses
5. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with your database name (e.g., `employee-assessment`)

### Step 6: Update Environment Variables
Create a `.env` file in the `backend` folder:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/employee-assessment?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Option 2: Local MongoDB Installation

### Step 1: Download MongoDB Community Server
1. Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Download MongoDB Community Server for Windows
3. Run the installer and follow the setup wizard

### Step 2: Install MongoDB Compass (Optional but Recommended)
1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Install it for a GUI to manage your database

### Step 3: Start MongoDB Service
1. Open Command Prompt as Administrator
2. Navigate to MongoDB bin directory (usually `C:\Program Files\MongoDB\Server\6.0\bin`)
3. Run: `mongod --dbpath="C:\data\db"`
4. Or install MongoDB as a Windows service:
   ```cmd
   mongod --install --dbpath="C:\data\db" --logpath="C:\data\log\mongod.log"
   net start MongoDB
   ```

### Step 4: Update Environment Variables
For local MongoDB, use this connection string:

```env
MONGODB_URI=mongodb://localhost:27017/employee-assessment
```

## Option 3: Docker MongoDB (Alternative)

### Step 1: Install Docker Desktop
1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Install and start Docker Desktop

### Step 2: Run MongoDB Container
```bash
docker run --name mongodb -d -p 27017:27017 mongo:latest
```

### Step 3: Update Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/employee-assessment
```

## Testing the Connection

### Step 1: Install Dependencies
Navigate to the backend directory and install dependencies:
```bash
cd C:\Users\Muhammad\employee-assessment-app\backend
npm install
```

### Step 2: Test Connection
Create a test file to verify the connection:

```javascript
// test-connection.js
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test creating a collection
    const testCollection = mongoose.connection.collection('test');
    await testCollection.insertOne({ test: 'data' });
    console.log('✅ Database write test successful!');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

testConnection();
```

Run the test:
```bash
node test-connection.js
```

## Common Issues and Solutions

### Issue 1: Connection Timeout
**Solution**: Check your internet connection and firewall settings. For Atlas, ensure your IP is whitelisted.

### Issue 2: Authentication Failed
**Solution**: 
- Verify username and password in connection string
- Check if database user has correct permissions
- Ensure password doesn't contain special characters that need URL encoding

### Issue 3: Network Error
**Solution**:
- For Atlas: Check if your IP is whitelisted
- For local: Ensure MongoDB service is running
- For Docker: Ensure container is running (`docker ps`)

### Issue 4: Database Not Found
**Solution**: MongoDB will create the database automatically when you first insert data. This is normal behavior.

## Production Considerations

### Security Best Practices
1. **Use Environment Variables**: Never hardcode connection strings
2. **Strong Passwords**: Use complex passwords for database users
3. **IP Whitelisting**: Only allow necessary IP addresses
4. **Network Security**: Use VPC peering for production deployments
5. **Encryption**: Enable TLS/SSL for database connections

### Monitoring
1. Set up MongoDB Atlas alerts for:
   - Connection count
   - Query performance
   - Storage usage
   - Error rates

### Backup Strategy
1. Enable automated backups in MongoDB Atlas
2. Set up regular backup schedules
3. Test restore procedures regularly

## Next Steps

1. **Choose your MongoDB setup option** (Atlas recommended for beginners)
2. **Update your `.env` file** with the correct connection string
3. **Test the connection** using the provided test script
4. **Start your backend server**: `npm run dev`
5. **Start your frontend**: `npm start`

## Verification Commands

After setup, verify everything works:

```bash
# Backend directory
cd C:\Users\Muhammad\employee-assessment-app\backend

# Install dependencies
npm install

# Test connection
node test-connection.js

# Start development server
npm run dev
```

Your application should now be able to connect to MongoDB and store/retrieve data for the employee assessment system! 