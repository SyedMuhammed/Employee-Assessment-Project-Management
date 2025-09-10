const express = require('express');
const jwt = require('jsonwebtoken');
const Assessment = require('../models/Assessment');
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.adminId) {
      const admin = await Admin.findById(decoded.adminId).select('-password');
      if (!admin || !admin.isActive) {
        return res.status(401).json({ success: false, message: 'Admin not found or inactive' });
      }
      req.user = { ...admin.toObject(), role: 'admin', userType: 'admin' };
    } else if (decoded.employeeId) {
      const employee = await Employee.findById(decoded.employeeId).select('-password');
      if (!employee || !employee.isActive) {
        return res.status(401).json({ success: false, message: 'Employee not found or inactive' });
      }
      req.user = { ...employee.toObject(), role: 'employee', userType: 'employee' };
    } else {
      return res.status(401).json({ success: false, message: 'Invalid token structure' });
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Get all assessments (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { employeeId, projectId, status, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (employeeId) query.employeeId = employeeId;
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    const assessments = await Assessment.find(query)
      .populate('employeeId', 'firstName lastName email position department')
      .populate('assessorId', 'firstName lastName username')
      .populate('projectId', 'title status')
      .sort({ assessmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Assessment.countDocuments(query);
    
    res.json({
      success: true,
      data: assessments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get assessment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('employeeId', 'firstName lastName email position department')
      .populate('assessorId', 'firstName lastName username')
      .populate('projectId', 'title status description');
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    // Check if user has access to this assessment
    if (req.user.role === 'employee' && assessment.employeeId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, data: assessment });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new assessment (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const {
      employeeId,
      projectId,
      scores,
      strengths,
      weaknesses,
      recommendations,
      comments
    } = req.body;

    // Validate required fields
    if (!employeeId || !scores) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID and scores are required' 
      });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Validate scores
    const requiredScores = ['technicalSkills', 'communication', 'leadership', 'problemSolving', 'teamwork', 'adaptability', 'timeManagement', 'creativity'];
    for (const scoreKey of requiredScores) {
      if (typeof scores[scoreKey] !== 'number' || scores[scoreKey] < 0 || scores[scoreKey] > 10) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid score for ${scoreKey}. Must be a number between 0 and 10.` 
        });
      }
    }

    const assessment = new Assessment({
      employeeId,
      assessorId: req.user._id,
      projectId,
      scores,
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      recommendations: recommendations || [],
      comments,
      status: 'submitted'
    });

    await assessment.save();

    // Populate the response
    const populatedAssessment = await Assessment.findById(assessment._id)
      .populate('employeeId', 'firstName lastName email position department')
      .populate('assessorId', 'firstName lastName username')
      .populate('projectId', 'title status');

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully!',
      data: populatedAssessment
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update assessment (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Only allow updates if assessment is in draft or submitted status
    if (assessment.status === 'reviewed' || assessment.status === 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update assessment that has been reviewed or approved' 
      });
    }

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employeeId', 'firstName lastName email position department')
     .populate('assessorId', 'firstName lastName username')
     .populate('projectId', 'title status');

    res.json({
      success: true,
      message: 'Assessment updated successfully!',
      data: updatedAssessment
    });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete assessment (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    res.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get employee's assessments
router.get('/employee/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Check if user has access to this employee's assessments
    if (req.user.role === 'employee' && employeeId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const skip = (page - 1) * limit;
    
    const assessments = await Assessment.find({ 
      employeeId, 
      isActive: true 
    })
      .populate('assessorId', 'firstName lastName username')
      .populate('projectId', 'title status')
      .sort({ assessmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Assessment.countDocuments({ employeeId, isActive: true });
    
    res.json({
      success: true,
      data: assessments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get employee assessments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get assessment statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const totalAssessments = await Assessment.countDocuments({ isActive: true });
    const submittedAssessments = await Assessment.countDocuments({ isActive: true, status: 'submitted' });
    const reviewedAssessments = await Assessment.countDocuments({ isActive: true, status: 'reviewed' });
    const approvedAssessments = await Assessment.countDocuments({ isActive: true, status: 'approved' });
    
    const avgScores = await Assessment.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: null,
        avgTechnicalSkills: { $avg: '$scores.technicalSkills' },
        avgCommunication: { $avg: '$scores.communication' },
        avgLeadership: { $avg: '$scores.leadership' },
        avgProblemSolving: { $avg: '$scores.problemSolving' },
        avgTeamwork: { $avg: '$scores.teamwork' },
        avgAdaptability: { $avg: '$scores.adaptability' },
        avgTimeManagement: { $avg: '$scores.timeManagement' },
        avgCreativity: { $avg: '$scores.creativity' },
        avgOverallScore: { $avg: '$overallScore' }
      }}
    ]);
    
    res.json({
      success: true,
      data: {
        totalAssessments,
        submittedAssessments,
        reviewedAssessments,
        approvedAssessments,
        avgScores: avgScores[0] || {}
      }
    });
  } catch (error) {
    console.error('Get assessment stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
