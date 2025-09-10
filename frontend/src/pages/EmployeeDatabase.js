import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  MoreVertical,
  Calendar,
  Upload,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Star,
  Award,
  AlertTriangle,
  X,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import api from '../api/http';
import toast from 'react-hot-toast';

const EmployeeDatabase = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    performance: 'all',
    skills: 'all'
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/employees');
      setEmployees(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId) => {
    try {
      await api.delete(`/api/employees/${employeeId}`);
      toast.success('Employee deleted successfully');
      fetchEmployees();
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (score >= 75) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'inactive': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'on_leave': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getTrendIcon = (employee) => {
    const recentScore = employee.performanceScore;
    const previousScore = employee.previousScore || recentScore;
    
    if (recentScore > previousScore) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (recentScore < previousScore) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const filteredAndSortedEmployees = employees
    .filter(employee => {
      const matchesSearch = 
        employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || employee.isActive === (filters.status === 'active');
      const matchesPerformance = filters.performance === 'all' || 
        (filters.performance === 'high' && employee.performanceScore >= 90) ||
        (filters.performance === 'medium' && employee.performanceScore >= 75 && employee.performanceScore < 90) ||
        (filters.performance === 'low' && employee.performanceScore < 75);

      return matchesSearch && matchesStatus && matchesPerformance;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'performance':
          aValue = a.performanceScore;
          bValue = b.performanceScore;
          break;
        case 'skills':
          aValue = a.skills?.length || 0;
          bValue = b.skills?.length || 0;
          break;
        case 'projects':
          aValue = a.projects?.length || 0;
          bValue = b.projects?.length || 0;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const exportEmployees = () => {
    const csvContent = [
      ['Name', 'Email', 'Performance Score', 'Skills', 'Status', 'Projects'],
      ...filteredAndSortedEmployees.map(emp => [
        `${emp.firstName} ${emp.lastName}`,
        emp.email,
        emp.performanceScore,
        (emp.skills || []).map(s => (typeof s === 'string' ? s : s?.name)).filter(Boolean).join(', '),
        emp.isActive ? 'Active' : 'Inactive',
        emp.projects?.length || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Employees exported successfully');
  };

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
            Employee Database
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage employee information and performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportEmployees}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/add-employee')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Performance Filter */}
          <select
            value={filters.performance}
            onChange={(e) => setFilters({ ...filters, performance: e.target.value })}
            className="input-field"
          >
            <option value="all">All Performance</option>
            <option value="high">High (90%+)</option>
            <option value="medium">Medium (75-89%)</option>
            <option value="low">Low (&lt;75%)</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="input-field"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="performance-desc">Performance (High-Low)</option>
            <option value="performance-asc">Performance (Low-High)</option>
            <option value="skills-desc">Skills (Most-Fewest)</option>
            <option value="projects-desc">Projects (Most-Fewest)</option>
          </select>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {employees.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {employees.filter(e => e.isActive).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Performance</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(employees.reduce((acc, emp) => acc + emp.performanceScore, 0) / employees.length || 0)}%
              </p>
            </div>
            <Star className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Performers</p>
              <p className="text-2xl font-bold text-purple-600">
                {employees.filter(e => e.performanceScore >= 90).length}
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </motion.div>

      {/* Employees Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-4 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </motion.div>
          ))
        ) : (
          filteredAndSortedEmployees.map((employee, index) => (
            <motion.div
              key={employee._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-4 hover:shadow-lg transition-all duration-200"
            >
              {/* Employee Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {employee.firstName?.[0]}{employee.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {employee.email}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setSelectedEmployee(employee)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Performance Score */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Performance</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(employee.performanceScore)}`}>
                    {employee.performanceScore}%
                  </span>
                  {getTrendIcon(employee)}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {employee.skills?.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full"
                    >
                      {typeof skill === 'string' ? skill : (skill?.name || '')}
                    </span>
                  ))}
                  {employee.skills?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                      +{employee.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.isActive ? 'active' : 'inactive')}`}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowDetailsModal(true);
                    }}
                    className="p-1 text-blue-500 hover:text-blue-600"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/edit-employee/${employee._id}`)}
                    className="p-1 text-green-500 hover:text-green-600"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEmployeeToDelete(employee);
                      setShowDeleteModal(true);
                    }}
                    className="p-1 text-red-500 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Employee
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete {employeeToDelete?.firstName} {employeeToDelete?.lastName}? 
                This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(employeeToDelete._id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Employee Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Employee Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedEmployee.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedEmployee.email}
                      </span>
                    </div>
                    {selectedEmployee.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedEmployee.phone}
                        </span>
                      </div>
                    )}
                    {selectedEmployee.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedEmployee.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Performance Metrics
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Overall Score</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getPerformanceColor(selectedEmployee.performanceScore)}`}>
                          {selectedEmployee.performanceScore}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Skills Count</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedEmployee.skills?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Active Projects</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedEmployee.projects?.filter(p => p.isActive).length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Skills
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployee.skills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                        >
                          {typeof skill === 'string' ? skill : (skill?.name || '')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Projects Titles */}
              <div className="mt-6">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Assigned Projects</h5>
                <div className="flex flex-wrap gap-2">
                  {(selectedEmployee.projects || []).length > 0 ? (
                    selectedEmployee.projects.map((p, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                        {p.projectId?.title || 'Untitled Project'}{p.isActive ? '' : ' (ended)'}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No projects assigned</span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeDatabase; 