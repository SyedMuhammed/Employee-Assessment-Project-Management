const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  level: { type: Number, min: 1, max: 10, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  requirements: [requirementSchema],
  budget: {
    type: Number,
    min: 0
  },
  duration: {
    type: Number, // in weeks
    min: 1
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  assignedEmployees: [{
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    role: { type: String, required: true },
    assignedDate: { type: Date, default: Date.now }
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  comments: [{
    text: { type: String, required: true, maxlength: 1000 },
    author: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Virtual for project duration in days
projectSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return this.duration * 7; // Convert weeks to days
});

// Method to get matching employees
projectSchema.methods.findMatchingEmployees = async function(Employee) {
  const requiredSkills = this.requirements.map(req => req.skill);
  const requiredLevels = this.requirements.reduce((acc, req) => {
    acc[req.skill] = req.level;
    return acc;
  }, {});

  const employees = await Employee.find({ isActive: true });
  
  return employees.map(employee => {
    let matchScore = 0;
    let matchedSkills = 0;
    const presentSkills = [];
    const missingSkills = [];
    
    employee.skills.forEach(skill => {
      if (requiredSkills.includes(skill.name)) {
        const requiredLevel = requiredLevels[skill.name] || 1;
        const skillMatch = Math.min(skill.level / requiredLevel, 1);
        matchScore += skillMatch;
        matchedSkills++;
        presentSkills.push({ name: skill.name, level: skill.level, requiredLevel });
      }
    });
    // Determine missing skills explicitly
    requiredSkills.forEach(reqSkill => {
      const hasSkill = employee.skills.some(s => s.name === reqSkill);
      if (!hasSkill) {
        missingSkills.push({ name: reqSkill, requiredLevel: requiredLevels[reqSkill] || 1 });
      }
    });
    
    const averageMatch = matchedSkills > 0 ? matchScore / matchedSkills : 0;
    const availabilityBonus = employee.availability === 'available' ? 0.2 : 0;
    const finalScore = Math.min(averageMatch + availabilityBonus, 1);
    const activeProjectsCount = (employee.projects || []).filter(p => p.isActive).length;
    
    return {
      employee,
      matchScore: Math.round(finalScore * 100),
      matchedSkills,
      totalRequiredSkills: requiredSkills.length,
      presentSkills,
      missingSkills,
      activeProjectsCount
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = mongoose.model('Project', projectSchema); 