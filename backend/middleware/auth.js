const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin or employee token
    if (decoded.adminId) {
      const admin = await Admin.findById(decoded.adminId).select('-password');
      if (!admin || !admin.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or inactive admin account' 
        });
      }
      req.user = { 
        ...admin.toObject(), 
        role: 'admin',
        userId: admin._id,
        userType: 'admin'
      };
    } else if (decoded.employeeId) {
      const employee = await Employee.findById(decoded.employeeId).select('-password');
      if (!employee || !employee.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or inactive employee account' 
        });
      }
      req.user = { 
        ...employee.toObject(), 
        role: 'employee',
        userId: employee._id,
        userType: 'employee'
      };
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required. You do not have permission to perform this action.'
    });
  }

  next();
};

// Middleware to require employee role
const requireEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'employee') {
    return res.status(403).json({
      success: false,
      message: 'Employee access required'
    });
  }

  next();
};

// Middleware to allow both admin and employee
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  next();
};

// Middleware to allow admin or resource owner (employee accessing their own data)
const requireAdminOrOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Admin can access anything
  if (req.user.role === 'admin') {
    return next();
  }

  // Employee can only access their own data
  if (req.user.role === 'employee') {
    const resourceId = req.params.id || req.params.employeeId;
    if (resourceId && resourceId !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own data'
      });
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireEmployee,
  requireAuth,
  requireAdminOrOwner
};
