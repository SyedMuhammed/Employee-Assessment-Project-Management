import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Calendar, 
  DollarSign, 
  Target,
  ArrowRight,
  X
} from 'lucide-react';
import api from '../api/http';
import toast from 'react-hot-toast';

const ProjectRequirements = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [pendingStatus, setPendingStatus] = useState('');
  const [matchExplanation, setMatchExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    company: '',
    skillRequirements: [],
    budget: '',
    duration: '',
    priority: 'medium',
    status: 'open',
    category: 'web'
  });
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      setProjects(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      setEmployees(response.data?.data || response.data?.employees || response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const findMatches = async (projectId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/projects/${projectId}/matches`);
      const data = response.data?.data || response.data || {};
      setMatches(data.matches || []);
      setSelectedProject(data.project || projects.find(p => p._id === projectId));
    } catch (error) {
      console.error('Error finding matches:', error);
      toast.error('Failed to find matches');
    } finally {
      setLoading(false);
    }
  };

  const openProjectDetails = async (projectId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}`);
      const data = response.data?.data || response.data;
      setSelectedProject(data);
      setPendingStatus(data.status);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load project details');
    }
  };

  const refreshSelectedProject = async () => {
    if (!selectedProject?._id) return;
    try {
      const response = await api.get(`/api/projects/${selectedProject._id}`);
      const data = response.data?.data || response.data;
      setSelectedProject(data);
      // Also update list card
      setProjects(prev => prev.map(p => p._id === data._id ? data : p));
    } catch (e) {
      // no-op
    }
  };

  const updateProjectStatus = async (newStatus) => {
    if (!selectedProject?._id) return;
    try {
      await api.put(`/api/projects/${selectedProject._id}`, { status: newStatus });
      setPendingStatus(newStatus);
      await refreshSelectedProject();
      toast.success('Status updated');
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const deleteProject = async () => {
    if (!selectedProject?._id) return;
    const ok = window.confirm('Are you sure you want to delete this project?');
    if (!ok) return;
    try {
      await api.delete(`/api/projects/${selectedProject._id}`);
      setShowDetailsModal(false);
      setProjects(prev => prev.filter(p => p._id !== selectedProject._id));
      setSelectedProject(null);
      toast.success('Project deleted');
    } catch (e) {
      toast.error('Failed to delete project');
    }
  };

  const addProjectComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post(`/api/projects/${selectedProject._id}/comments`, { text: newComment });
      setNewComment('');
      await refreshSelectedProject();
      toast.success('Comment added');
    } catch (e) {
      toast.error('Failed to add comment');
    }
  };

  const assignEmployeeToProject = async () => {
    if (!assignEmployeeId) return;
    try {
      await api.post(`/api/projects/${selectedProject._id}/assign`, { employeeId: assignEmployeeId, role: 'Member' });
      setAssignEmployeeId('');
      await refreshSelectedProject();
      toast.success('Employee assigned');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to assign employee');
    }
  };

  const removeEmployeeFromProject = async (employeeId) => {
    try {
      await api.delete(`/api/projects/${selectedProject._id}/assign/${employeeId}`);
      await refreshSelectedProject();
      toast.success('Employee removed');
    } catch (e) {
      toast.error('Failed to remove employee');
    }
  };

  const getExplanation = async (projectId, employeeId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/match-explanation/${employeeId}`);
      // setExplanation(response.data.explanation || 'No explanation available'); // This line was removed
      // setShowExplanation(true); // This line was removed
    } catch (error) {
      console.error('Error getting explanation:', error);
      toast.error('Failed to get explanation');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    };
    return colors[status] || colors['open'];
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProject,
        // Map UI skill strings to backend requirement objects with sensible defaults
        requirements: newProject.skillRequirements.map((skill) => ({
          skill,
          level: 5,
          priority: 'medium'
        }))
      };
      delete payload.skillRequirements;

      const response = await api.post('/api/projects', payload);
      toast.success('Project created successfully!');
      setShowAddModal(false);
      setNewProject({
        title: '',
        description: '',
        company: '',
        skillRequirements: [],
        budget: '',
        duration: '',
        priority: 'medium',
        status: 'open',
        category: 'web'
      });
      // Optionally assign selected employees after project creation
      const created = response.data?.data || response.data;
      if (created?._id && selectedEmployeeIds.length > 0) {
        await Promise.all(selectedEmployeeIds.map(id =>
          api.post(`/api/projects/${created._id}/assign`, { employeeId: id, role: 'Member' })
        ));
        toast.success('Selected employees assigned');
      }
      setSelectedEmployeeIds([]);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkillRequirement = () => {
    const skill = prompt('Enter skill requirement:');
    if (skill && skill.trim()) {
      setNewProject(prev => ({
        ...prev,
        skillRequirements: [...prev.skillRequirements, skill.trim()]
      }));
    }
  };

  const removeSkillRequirement = (index) => {
    setNewProject(prev => ({
      ...prev,
      skillRequirements: prev.skillRequirements.filter((_, i) => i !== index)
    }));
  };

  const filteredProjects = projects.filter(project => {
    if (filters.status !== 'all' && project.status !== filters.status) return false;
    if (filters.priority !== 'all' && project.priority !== filters.priority) return false;
    if (filters.category !== 'all' && project.category !== filters.category) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Project Requirements
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage project briefs and find suitable employees
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center space-x-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex items-center space-x-4">
          <Edit className="w-5 h-5 text-gray-500" />
          <div className="flex space-x-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="input-field"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-field"
            >
              <option value="all">All Categories</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile Development</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card cursor-pointer transition-all duration-200 ${
                  selectedProject?._id === project._id 
                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => findMatches(project._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-5 h-5 text-primary-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {project.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {project.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {project.duration} days
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          ${project.budget?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {project.assignedEmployees?.length || 0} assigned
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded border border-primary-500 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      onClick={(e) => { e.stopPropagation(); openProjectDetails(project._id); }}
                    >
                      View details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Matches Panel */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Employee Matches
              </h3>
              {selectedProject && (
                <span className="text-sm text-gray-500">
                  {matches.length} matches
                </span>
              )}
            </div>

            {!selectedProject ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a project to see employee matches
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="spinner w-8 h-8 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Finding matches...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match, index) => (
                  <motion.div
                    key={match.employee._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {match.employee.firstName?.[0]}{match.employee.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {match.employee.firstName} {match.employee.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {match.employee.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500">Projects: {match.activeProjectsCount}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            Performance: {match.employee.performanceScore}%
                          </span>
                          <span className="text-xs text-gray-500">
                            Skills: {match.employee.skills?.length || 0}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => getExplanation(selectedProject._id, match.employee._id)}
                          className="p-1 text-primary-500 hover:text-primary-600"
                          title="Get explanation"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>
                      <div>
                        {match.presentSkills?.length > 0 && (
                          <div className="text-xs text-green-700 dark:text-green-300">
                            Present: {match.presentSkills.map(s => s.name).join(', ')}
                          </div>
                        )}
                        {match.missingSkills?.length > 0 && (
                          <div className="text-xs text-red-700 dark:text-red-300">
                            Missing: {match.missingSkills.map(s => s.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={async () => {
                            try {
                              await api.post(`/api/projects/${selectedProject._id}/assign`, { employeeId: match.employee._id, role: 'Member' });
                              toast.success('Employee assigned');
                              // Refresh matches and increment assigned count locally
                              await findMatches(selectedProject._id);
                              setProjects(prev => prev.map(p => {
                                if (p._id === selectedProject._id) {
                                  const updated = {
                                    ...p,
                                    assignedEmployees: [...(p.assignedEmployees || []), { employeeId: match.employee._id, role: 'Member', assignedDate: new Date().toISOString() }]
                                  };
                                  return updated;
                                }
                                return p;
                              }));
                              setSelectedProject(prev => prev ? {
                                ...prev,
                                assignedEmployees: [...(prev.assignedEmployees || []), { employeeId: match.employee._id, role: 'Member', assignedDate: new Date().toISOString() }]
                              } : prev);
                            } catch (err) {
                              toast.error(err.response?.data?.message || 'Failed to assign');
                            }
                          }}
                          className="btn-secondary btn-sm"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[92vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProject.title}</h2>
                  <p className="text-sm text-gray-500">{selectedProject.company} • {selectedProject.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="input-field text-sm"
                    value={pendingStatus}
                    onChange={(e) => setPendingStatus(e.target.value)}
                    onBlur={() => updateProjectStatus(pendingStatus)}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button className="btn-secondary text-sm" onClick={() => updateProjectStatus('completed')}>Mark completed</button>
                  <button className="btn-secondary text-sm text-red-600" onClick={deleteProject}>Delete</button>
                  <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div className="card p-4">
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedProject.description}</p>
                    </div>
                    <div className="card p-4">
                      <h3 className="font-semibold mb-2">Requirements</h3>
                      <div className="flex flex-wrap gap-2">
                        {(selectedProject.requirements || []).map((r, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded text-xs">
                            {r.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="card p-4">
                      <h3 className="font-semibold mb-2">Assign employee</h3>
                      <div className="flex items-center space-x-2">
                        <select
                          className="input-field"
                          value={assignEmployeeId}
                          onChange={(e) => setAssignEmployeeId(e.target.value)}
                        >
                          <option value="">Select employee</option>
                          {employees
                            .filter(emp => !(selectedProject.assignedEmployees || []).some(a => (a.employeeId?._id || a.employeeId)?.toString() === emp._id))
                            .map(emp => (
                              <option key={emp._id} value={emp._id}>
                                {emp.firstName} {emp.lastName}
                              </option>
                            ))}
                        </select>
                        <button className="btn-primary" onClick={assignEmployeeToProject}>Assign</button>
                      </div>
                    </div>
                    <div className="card p-4">
                      <h3 className="font-semibold mb-2">Comments</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(selectedProject.comments || []).slice().reverse().map((c, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium">{c.author || 'Admin'}</span>
                            <span className="text-gray-500"> — {new Date(c.createdAt).toLocaleString()}</span>
                            <div className="text-gray-800 dark:text-gray-200">{c.text}</div>
                          </div>
                        ))}
                        {(selectedProject.comments || []).length === 0 && (
                          <div className="text-xs text-gray-500">No comments yet.</div>
                        )}
                      </div>
                      <div className="mt-3 flex items-center space-x-2">
                        <input
                          className="input-field flex-1"
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button className="btn-secondary" onClick={addProjectComment}>Add</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-4">
                  <h3 className="font-semibold mb-3">Assigned Employees</h3>
                  <div className="space-y-2">
                    {(selectedProject.assignedEmployees || []).map(a => (
                      <div key={(a.employeeId?._id || a.employeeId)} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{a.employeeId?.firstName} {a.employeeId?.lastName}</span>
                          <span className="text-gray-500"> — {a.role}</span>
                        </div>
                        <button className="text-red-600 hover:underline" onClick={() => removeEmployeeFromProject(a.employeeId?._id || a.employeeId)}>Remove</button>
                      </div>
                    ))}
                    {(selectedProject.assignedEmployees || []).length === 0 && (
                      <div className="text-xs text-gray-500">No one assigned yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation Modal */}
      <AnimatePresence>
        {/* showExplanation && ( // This line was removed
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowExplanation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Match Explanation
                </h3>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300">
                  {explanation}
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) */}
      </AnimatePresence>

      {/* Add Project Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Add New Project
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddProject} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newProject.title}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={newProject.company}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={newProject.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Budget ($)
                    </label>
                    <input
                      type="number"
                      name="budget"
                      value={newProject.budget}
                      onChange={handleInputChange}
                      className="input-field"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={newProject.duration}
                      onChange={handleInputChange}
                      className="input-field"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={newProject.priority}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={newProject.status}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={newProject.category}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="web">Web Development</option>
                      <option value="mobile">Mobile Development</option>
                      <option value="design">Design</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skill Requirements
                  </label>
                  <div className="space-y-2">
                    {newProject.skillRequirements.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                          {skill}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSkillRequirement(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSkillRequirement}
                      className="btn-secondary text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Skill
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assign Employees (optional)
                  </label>
                  <div className="max-h-56 overflow-y-auto space-y-2 p-3 rounded border border-gray-200 dark:border-dark-700">
                    {employees.map(emp => {
                      const activeCount = (emp.projects || []).filter(p => p.isActive).length;
                      const req = newProject.skillRequirements;
                      const empSkills = (emp.skills || []).map(s => s.name);
                      const matched = req.filter(s => empSkills.includes(s)).length;
                      const percent = req.length ? Math.round((matched / req.length) * 100) : 0;
                      return (
                        <label key={emp._id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedEmployeeIds.includes(emp._id)}
                              onChange={(e) => {
                                setSelectedEmployeeIds(prev => (
                                  e.target.checked ? [...prev, emp._id] : prev.filter(id => id !== emp._id)
                                ));
                              }}
                            />
                            <span className="text-gray-800 dark:text-gray-200">{emp.firstName} {emp.lastName}</span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-3">
                            <span>Projects: {activeCount}</span>
                            <span>Match: {percent}%</span>
                          </div>
                        </label>
                      );
                    })}
                    {employees.length === 0 && (
                      <div className="text-xs text-gray-500">No employees found.</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-dark-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectRequirements; 