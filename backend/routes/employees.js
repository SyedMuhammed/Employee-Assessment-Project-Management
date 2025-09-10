const express = require('express');
const Employee = require('../models/Employee');
const { authenticateToken, requireAdmin, requireAdminOrOwner } = require('../middleware/auth');
const router = express.Router();

// Get all employees with search, filter, and sort (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, department, position, availability, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by department
    if (department) {
      query.department = department;
    }
    
    // Filter by position
    if (position) {
      query.position = position;
    }
    
    // Filter by availability
    if (availability) {
      query.availability = availability;
    }
    
    // Build sort object
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort = { createdAt: -1 };
    }
    
    const skip = (page - 1) * limit;
    
    const employees = await Employee.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('projects.projectId', 'title status');
    
    const total = await Employee.countDocuments(query);
    
    res.json({
      success: true,
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single employee (Admin or employee accessing their own data)
router.get('/:id', authenticateToken, requireAdminOrOwner, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('projects.projectId', 'title status description');
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new employee (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password is required and must be at least 6 characters.' });
    }
    const employee = new Employee(req.body);
    await employee.save();
    const employeeObj = employee.toObject();
    delete employeeObj.password;
    res.status(201).json({ success: true, data: employeeObj });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update employee (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete employee (soft delete) (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get employee statistics (Admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const availableEmployees = await Employee.countDocuments({ isActive: true, availability: 'available' });
    const busyEmployees = await Employee.countDocuments({ isActive: true, availability: 'busy' });
    
    const avgPerformance = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgPerformance: { $avg: '$performanceScore' } } }
    ]);
    
    const departmentStats = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalEmployees,
        availableEmployees,
        busyEmployees,
        avgPerformance: avgPerformance[0]?.avgPerformance || 0,
        departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update employee skills (Admin or employee updating their own skills)
router.patch('/:id/skills', authenticateToken, requireAdminOrOwner, async (req, res) => {
  try {
    const { skills } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { skills },
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router; 