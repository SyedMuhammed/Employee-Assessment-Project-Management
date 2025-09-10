const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin._id,
        role: 'admin',
        email: admin.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Return success response
    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: 'admin',
        permissions: admin.permissions
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Employee login
router.post('/employee/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find employee by email
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if employee is active
    if (!employee.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await employee.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        employeeId: employee._id,
        role: 'employee',
        email: employee.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Return success response
    res.json({
      success: true,
      message: 'Employee login successful',
      token,
      user: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        role: 'employee',
        performanceScore: employee.performanceScore
      }
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { role, ...userData } = req.body;
    
    // Validate required fields
    if (!role || !['admin', 'employee'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Role is required and must be either "admin" or "employee"' 
      });
    }

    if (!userData.email || !userData.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Check if email already exists in either collection
    const existingAdmin = await Admin.findOne({ email: userData.email });
    const existingEmployee = await Employee.findOne({ email: userData.email });
    
    if (existingAdmin || existingEmployee) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    let newUser;
    let token;

    if (role === 'admin') {
      // Create admin
      if (!userData.username || !userData.firstName || !userData.lastName) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username, firstName, and lastName are required for admin registration' 
        });
      }

      // Check if username already exists
      const existingUsername = await Admin.findOne({ username: userData.username });
      if (existingUsername) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username already taken' 
        });
      }

      newUser = new Admin({
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'admin',
        permissions: userData.permissions || ['manage_employees', 'manage_projects', 'view_analytics']
      });
      
      await newUser.save();

      // Generate token
      token = jwt.sign(
        { 
          adminId: newUser._id,
          role: 'admin',
          email: userData.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );

    } else {
      // Create employee
      if (!userData.firstName || !userData.lastName || !userData.position || !userData.department) {
        return res.status(400).json({ 
          success: false, 
          message: 'firstName, lastName, position, and department are required for employee registration' 
        });
      }

      newUser = new Employee({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        position: userData.position,
        department: userData.department,
        phone: userData.phone || '',
        hireDate: userData.hireDate || new Date(),
        skills: userData.skills || [],
        performanceScore: userData.performanceScore || 75
      });
      
      await newUser.save();

      // Generate token
      token = jwt.sign(
        { 
          employeeId: newUser._id,
          role: 'employee',
          email: userData.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );
    }

    // Return success response
    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: role,
      ...(role === 'admin' && { username: newUser.username }),
      ...(role === 'employee' && { 
        position: newUser.position,
        department: newUser.department,
        performanceScore: newUser.performanceScore
      })
    };

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!`,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

// Profile update endpoint
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, location } = req.body;
    
    if (req.user.role === 'admin') {
      const admin = await Admin.findByIdAndUpdate(
        req.user.userId,
        { firstName, lastName, phone, location },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: admin
      });
    } else {
      const employee = await Employee.findByIdAndUpdate(
        req.user.userId,
        { firstName, lastName, phone, location },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: employee
      });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;