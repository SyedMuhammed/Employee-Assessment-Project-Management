const express = require('express');
const Project = require('../models/Project');
const Employee = require('../models/Employee');
const axios = require('axios');
const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const { status, priority, category, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort = { createdAt: -1 };
    }
    
    const skip = (page - 1) * limit;
    
    const projects = await Project.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedEmployees.employeeId', 'firstName lastName email position');
    
    const total = await Project.countDocuments(query);
    
    res.json({
      success: true,
      data: projects,
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

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assignedEmployees.employeeId', 'firstName lastName email position skills');
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete project (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get matching employees for a project
router.get('/:id/matches', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    let matches = await project.findMatchingEmployees(Employee);
    // Filter out employees already assigned to the project
    const assignedIds = new Set((project.assignedEmployees || []).map(a => a.employeeId.toString()));
    matches = matches.filter(m => !assignedIds.has(m.employee._id.toString()));
    
    res.json({ success: true, data: { project, matches } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a project comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { text, author } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    project.comments.push({ text: text.trim(), author: author || 'Admin' });
    await project.save();
    res.status(201).json({ success: true, data: project.comments[project.comments.length - 1] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Generate NLP explanation for employee match
router.post('/:id/match-explanation', async (req, res) => {
  try {
    const { employeeId } = req.body;
    const project = await Project.findById(req.params.id);
    const employee = await Employee.findById(employeeId);
    
    if (!project || !employee) {
      return res.status(404).json({ success: false, message: 'Project or employee not found' });
    }
    
    // Generate explanation using OpenAI or similar API
    const explanation = await generateMatchExplanation(project, employee);
    
    res.json({
      success: true,
      data: {
        explanation,
        project,
        employee
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign employee to project
router.post('/:id/assign', async (req, res) => {
  try {
    const { employeeId, role } = req.body;
    
    const project = await Project.findById(req.params.id);
    const employee = await Employee.findById(employeeId);
    
    if (!project || !employee) {
      return res.status(404).json({ success: false, message: 'Project or employee not found' });
    }
    
    // Check if employee is already assigned
    const alreadyAssigned = project.assignedEmployees.find(
      assignment => assignment.employeeId.toString() === employeeId
    );
    
    if (alreadyAssigned) {
      return res.status(400).json({ success: false, message: 'Employee already assigned to this project' });
    }
    
    project.assignedEmployees.push({
      employeeId,
      role,
      assignedDate: new Date()
    });
    
    // Update project status if it's the first assignment
    if (project.status === 'open') {
      project.status = 'in-progress';
    }
    
    await project.save();
    
    // Update employee's project involvement
    employee.projects.push({
      projectId: project._id,
      role,
      startDate: new Date(),
      isActive: true
    });
    
    await employee.save();
    
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove employee from project
router.delete('/:id/assign/:employeeId', async (req, res) => {
  try {
    const { id, employeeId } = req.params;
    
    const project = await Project.findById(id);
    const employee = await Employee.findById(employeeId);
    
    if (!project || !employee) {
      return res.status(404).json({ success: false, message: 'Project or employee not found' });
    }
    
    // Remove from project assignments
    project.assignedEmployees = project.assignedEmployees.filter(
      assignment => assignment.employeeId.toString() !== employeeId
    );
    
    // Update project status if no more assignments
    if (project.assignedEmployees.length === 0) {
      project.status = 'open';
    }
    
    await project.save();
    
    // Update employee's project involvement
    employee.projects = employee.projects.map(project => {
      if (project.projectId.toString() === id) {
        project.isActive = false;
        project.endDate = new Date();
      }
      return project;
    });
    
    await employee.save();
    
    res.json({ success: true, message: 'Employee removed from project' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get project statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments({ isActive: true });
    const openProjects = await Project.countDocuments({ isActive: true, status: 'open' });
    const inProgressProjects = await Project.countDocuments({ isActive: true, status: 'in-progress' });
    const completedProjects = await Project.countDocuments({ isActive: true, status: 'completed' });
    
    const avgBudget = await Project.aggregate([
      { $match: { isActive: true, budget: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgBudget: { $avg: '$budget' } } }
    ]);
    
    const categoryStats = await Project.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalProjects,
        openProjects,
        inProgressProjects,
        completedProjects,
        avgBudget: avgBudget[0]?.avgBudget || 0,
        categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to generate match explanation
async function generateMatchExplanation(project, employee) {
  try {
    // This is a simplified version. In production, you'd use OpenAI or similar
    const requiredSkills = project.requirements.map(req => req.skill);
    const employeeSkills = employee.skills.map(skill => skill.name);
    
    const matchedSkills = requiredSkills.filter(skill => employeeSkills.includes(skill));
    const matchPercentage = (matchedSkills.length / requiredSkills.length) * 100;
    
    let explanation = `${employee.firstName} ${employee.lastName} is a ${matchPercentage.toFixed(0)}% match for this project. `;
    
    if (matchedSkills.length > 0) {
      explanation += `They have the required skills: ${matchedSkills.join(', ')}. `;
    }
    
    if (employee.availability === 'available') {
      explanation += 'They are currently available for new projects. ';
    }
    
    explanation += `With ${employee.skills.length} total skills and a performance score of ${employee.performanceScore}, they would be a valuable addition to this project.`;
    
    return explanation;
  } catch (error) {
    return 'Unable to generate explanation at this time.';
  }
}

module.exports = router; 