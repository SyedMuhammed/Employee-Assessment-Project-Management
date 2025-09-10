const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  assessorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  assessmentDate: {
    type: Date,
    default: Date.now
  },
  scores: {
    technicalSkills: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    communication: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    leadership: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    problemSolving: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    teamwork: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    adaptability: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    timeManagement: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    creativity: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    }
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  strengths: [String],
  weaknesses: [String],
  recommendations: [String],
  comments: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'approved'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate overall score before saving
assessmentSchema.pre('save', function(next) {
  const scores = this.scores;
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  this.overallScore = Math.round((totalScore / Object.keys(scores).length) * 10);
  next();
});

// Virtual for score level
assessmentSchema.virtual('scoreLevel').get(function() {
  if (this.overallScore >= 90) return 'Excellent';
  if (this.overallScore >= 80) return 'Very Good';
  if (this.overallScore >= 70) return 'Good';
  if (this.overallScore >= 60) return 'Average';
  return 'Needs Improvement';
});

// Static method to get average scores by employee
assessmentSchema.statics.getAverageScoresByEmployee = function(employeeId) {
  return this.aggregate([
    { $match: { employeeId: mongoose.Types.ObjectId(employeeId), isActive: true } },
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
};

// Index for efficient queries
assessmentSchema.index({ employeeId: 1, assessmentDate: -1 });
assessmentSchema.index({ assessorId: 1, assessmentDate: -1 });
assessmentSchema.index({ projectId: 1, assessmentDate: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
