import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Minus,
  Briefcase,
  GraduationCap,
  Clock,
  MapPin,
  Calendar,
  Star,
  Award,
  Target,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Upload,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import api from '../api/http';
import toast from 'react-hot-toast';

const AddEditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    department: '',
    position: '',
    hireDate: '',
    isActive: true,
    skills: [],
    experience: '',
    education: '',
    certifications: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentData, setAssessmentData] = useState({
    technicalSkills: 0,
    communication: 0,
    leadership: 0,
    problemSolving: 0,
    teamwork: 0,
    adaptability: 0,
    timeManagement: 0,
    creativity: 0
  });

  const assessmentQuestions = [
    {
      id: 'technical',
      category: 'Technical Skills',
      questions: [
        'How would you rate your programming skills?',
        'How comfortable are you with new technologies?',
        'How well do you understand system architecture?',
        'How experienced are you with debugging and troubleshooting?'
      ]
    },
    {
      id: 'communication',
      category: 'Communication',
      questions: [
        'How well do you explain technical concepts to non-technical people?',
        'How effective are you in team meetings?',
        'How well do you document your work?',
        'How comfortable are you with client presentations?'
      ]
    },
    {
      id: 'leadership',
      category: 'Leadership',
      questions: [
        'How often do you take initiative on projects?',
        'How well do you mentor junior team members?',
        'How comfortable are you making decisions under pressure?',
        'How well do you handle conflict resolution?'
      ]
    },
    {
      id: 'problemSolving',
      category: 'Problem Solving',
      questions: [
        'How quickly do you identify root causes of issues?',
        'How creative are you in finding solutions?',
        'How well do you handle unexpected challenges?',
        'How systematic is your approach to problem-solving?'
      ]
    },
    {
      id: 'teamwork',
      category: 'Teamwork',
      questions: [
        'How well do you collaborate with team members?',
        'How receptive are you to feedback?',
        'How well do you share knowledge with others?',
        'How flexible are you with changing priorities?'
      ]
    }
  ];

  const [answers, setAnswers] = useState({});

  // Helper to initialize answers from scores (for editing)
  const initializeAnswersFromScores = (scores) => {
    if (!scores) return;
    const newAnswers = {};
    assessmentQuestions.forEach((category) => {
      const score = scores[category.id];
      if (typeof score === 'number') {
        // Distribute score back to questions (approximate)
        const value = Math.round(score / 20);
        category.questions.forEach((_, idx) => {
          newAnswers[`${category.id}_${idx}`] = value;
        });
      }
    });
    setAnswers(newAnswers);
  };

  const fetchEmployee = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await api.get(`/api/employees/${id}`);
      const employee = response.data.data || response.data.employee;
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        location: employee.location || '',
        department: employee.department || '',
        position: employee.position || '',
        hireDate: employee.hireDate || '',
        skills: Array.isArray(employee.skills)
          ? employee.skills.map(s => (typeof s === 'string' ? s : (s?.name || ''))).filter(Boolean)
          : [],
        experience: employee.experience || '',
        education: employee.education || '',
        certifications: employee.certifications || []
      });
      if (employee.scores) {
        setAssessmentData(employee.scores);
        initializeAnswersFromScores(employee.scores);
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast.error('Failed to load employee data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && isEditing) {
      fetchEmployee();
    }
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...formData.skills];
    const current = newSkills[index];
    if (typeof current === 'object' && current !== null) {
      newSkills[index] = { ...current, name: value };
    } else {
      newSkills[index] = value;
    }
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleAnswerChange = (category, questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [`${category}_${questionIndex}`]: parseInt(value)
    }));
  };

  const calculateScores = () => {
    const newScores = {};
    assessmentQuestions.forEach(category => {
      // Only count answered questions
      const categoryAnswers = category.questions.map((_, index) =>
        answers[`${category.id}_${index}`]
      ).filter(v => typeof v === 'number' && !isNaN(v));
      if (categoryAnswers.length > 0) {
        const average = categoryAnswers.reduce((sum, score) => sum + score, 0) / categoryAnswers.length;
        newScores[category.id] = Math.round(average * 20); // Convert to percentage
      } else {
        newScores[category.id] = 0;
      }
    });
    const overall = Object.values(newScores).reduce((sum, score) => sum + score, 0) / Object.values(newScores).length;
    newScores.overall = Math.round(overall);
    setAssessmentData(newScores);
    return newScores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final submission
    try {
      setIsLoading(true);
      
      const finalScores = calculateScores();
      // Normalize skills to match backend schema { name, level, category }
      const normalizedSkills = (formData.skills || [])
        .filter(Boolean)
        .map(s => (typeof s === 'string' ? { name: s, level: 5, category: 'General' } : s));

      const employeeData = {
        ...formData,
        skills: normalizedSkills,
        scores: finalScores,
        performanceScore: finalScores.overall
      };

      // Ensure isActive is boolean
      if (typeof employeeData.isActive === 'string') {
        employeeData.isActive = employeeData.isActive === 'true';
      }

      // Generate a temporary password when creating (employees won't log in)
      const generateTempPassword = () => {
        try {
          const array = new Uint32Array(6);
          if (window?.crypto?.getRandomValues) {
            window.crypto.getRandomValues(array);
            return 'Emp#' + Array.from(array).map(n => (n % 36).toString(36)).join('').slice(0, 10) + '!';
          }
        } catch {}
        return 'Emp#' + Math.random().toString(36).slice(-10) + '!';
      };

      if (isEditing) {
        await api.put(`/api/employees/${id}`, employeeData);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/api/employees', {
          ...employeeData,
          password: generateTempPassword()
        });
        toast.success('Employee added successfully');
      }

      navigate('/dashboard/employees');
    } catch (error) {
      const serverMessage = error?.response?.data?.message || error.message || 'Failed to save employee';
      console.error('Error saving employee:', error?.response?.data || error);
      toast.error(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (score >= 75) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getStrengthLevel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6 form-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/employees')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Employee' : 'Add New Employee'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditing ? 'Update employee information and scores' : 'Create a new employee profile'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps with Category Names */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          {/* Category Names */}
          <div className="flex-1 flex justify-between mb-2">
            <span className={`text-xs font-semibold ${currentStep === 1 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>Basic Info</span>
            <span className={`text-xs font-semibold ${currentStep === 2 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>Assessment</span>
            <span className={`text-xs font-semibold ${currentStep === 3 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>Summary</span>
          </div>
          {/* Step Numbers */}
          <div className="flex items-center justify-between w-full md:w-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
            <div className="text-sm text-gray-500 ml-4">
              Step {currentStep} of 3
            </div>
          </div>
        </div>
      </motion.div>
      {/* End Progress Steps */}

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department *
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position *
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      name="isActive"
                      value={formData.isActive}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="input-field"
                    placeholder="Tell us about this employee..."
                  />
                </div>
              </motion.div>

              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Skills
                  </h2>
                  <button
                    type="button"
                    onClick={addSkill}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={typeof skill === 'string' ? skill : (skill?.name || '')}
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                        className="input-field flex-1"
                        placeholder="Enter skill..."
                      />
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="p-2 text-red-500 hover:text-red-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.skills.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No skills added yet. Click "Add Skill" to get started.
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Assessment Questions */}
              {assessmentQuestions.map((category, categoryIndex) => (
                <div
                  key={category.id}
                  className="card p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {category.category}
                  </h2>
                  <div className="space-y-4">
                    {category.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {question}
                        </label>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500">Poor</span>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <label key={value} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`${category.id}_${questionIndex}`}
                                  value={value}
                                  checked={answers[`${category.id}_${questionIndex}`] === value}
                                  onChange={(e) => handleAnswerChange(category.id, questionIndex, e.target.value)}
                                  className="sr-only"
                                />
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                                  answers[`${category.id}_${questionIndex}`] === value
                                    ? 'border-primary-500 bg-primary-500 text-white'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                                }`}>
                                  {answers[`${category.id}_${questionIndex}`] === value && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">Excellent</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Score Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Assessment Results
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(assessmentData).map(([key, score]) => (
                    <div key={key} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {key === 'overall' ? 'Overall Score' : key}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            score >= 90 ? 'bg-green-500' :
                            score >= 75 ? 'bg-blue-500' :
                            score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {getStrengthLevel(score)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Strengths & Weaknesses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Strengths
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(assessmentData)
                      .filter(([key]) => key !== 'overall')
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([key, score]) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <span className="text-sm font-medium capitalize">{key}</span>
                          <span className="text-sm text-green-600 dark:text-green-400">{score}%</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Areas for Improvement
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(assessmentData)
                      .filter(([key]) => key !== 'overall')
                      .sort(([,a], [,b]) => a - b)
                      .slice(0, 3)
                      .map(([key, score]) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          <span className="text-sm font-medium capitalize">{key}</span>
                          <span className="text-sm text-yellow-600 dark:text-yellow-400">{score}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pt-6"
        >
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="spinner w-4 h-4"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{currentStep === 3 ? (isEditing ? 'Update Employee' : 'Create Employee') : 'Next'}</span>
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default AddEditEmployee; 