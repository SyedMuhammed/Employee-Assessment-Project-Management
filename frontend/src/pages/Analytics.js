import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Star, 
  Award, 
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import api from '../api/http';
import toast from 'react-hot-toast';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-lg p-3 shadow-2xl"
        style={{
          border: '1px solid rgba(52, 152, 219, 0.3)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="text-white">
          <p className="font-semibold text-blue-400 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300">{entry.name}:</span>
              <span className="font-bold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }
  return null;
};

// Custom Pie Tooltip
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-lg p-3 shadow-2xl"
        style={{
          border: '1px solid rgba(52, 152, 219, 0.3)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="text-white">
          <p className="font-semibold text-blue-400 mb-1">{data.name}</p>
          <div className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.payload.fill }}
            />
            <span className="text-gray-300">Count:</span>
            <span className="font-bold text-white">{data.value}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {((data.value / data.payload.total) * 100).toFixed(1)}% of total
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

const Analytics = () => {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedChart, setSelectedChart] = useState('performance');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesRes, projectsRes] = await Promise.all([
        api.get('/api/employees'),
        api.get('/api/projects')
      ]);
      
      setEmployees(employeesRes.data.data || employeesRes.data || []);
      setProjects(projectsRes.data.data || projectsRes.data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Performance Distribution Data
  const performanceData = [
    { range: '90-100%', count: employees.filter(e => e.performanceScore >= 90).length, color: '#10B981' },
    { range: '80-89%', count: employees.filter(e => e.performanceScore >= 80 && e.performanceScore < 90).length, color: '#3B82F6' },
    { range: '70-79%', count: employees.filter(e => e.performanceScore >= 70 && e.performanceScore < 80).length, color: '#F59E0B' },
    { range: '60-69%', count: employees.filter(e => e.performanceScore >= 60 && e.performanceScore < 70).length, color: '#EF4444' },
    { range: '<60%', count: employees.filter(e => e.performanceScore < 60).length, color: '#DC2626' }
  ];

  // Skills Distribution
  const skillsData = employees.reduce((acc, employee) => {
    employee.skills?.forEach(skill => {
      acc[skill] = (acc[skill] || 0) + 1;
    });
    return acc;
  }, {});

  const topSkills = Object.entries(skillsData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  // Monthly Performance Trend
  const monthlyTrend = [
    { month: 'Jan', avg: 78, high: 92, low: 65 },
    { month: 'Feb', avg: 82, high: 95, low: 68 },
    { month: 'Mar', avg: 79, high: 89, low: 62 },
    { month: 'Apr', avg: 85, high: 96, low: 71 },
    { month: 'May', avg: 88, high: 98, low: 75 },
    { month: 'Jun', avg: 91, high: 99, low: 78 }
  ];

  // Project Status Distribution
  const projectStatusData = [
    { status: 'Open', count: projects.filter(p => p.status === 'open').length, color: '#10B981' },
    { status: 'In Progress', count: projects.filter(p => p.status === 'in-progress').length, color: '#F59E0B' },
    { status: 'Completed', count: projects.filter(p => p.status === 'completed').length, color: '#3B82F6' },
    { status: 'Cancelled', count: projects.filter(p => p.status === 'cancelled').length, color: '#EF4444' }
  ];

  // Employee Skills Radar Data
  const radarData = [
    { skill: 'Technical', value: 85 },
    { skill: 'Communication', value: 78 },
    { skill: 'Leadership', value: 72 },
    { skill: 'Problem Solving', value: 88 },
    { skill: 'Teamwork', value: 82 },
    { skill: 'Innovation', value: 75 }
  ];

  // Top Performers
  const topPerformers = employees
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 5)
    .map((emp, index) => ({
      name: `${emp.firstName} ${emp.lastName}`,
      score: emp.performanceScore,
      rank: index + 1
    }));

  // Project Budget vs Duration
  const projectBudgetData = projects.map(project => ({
    name: project.title,
    budget: project.budget,
    duration: project.duration,
    status: project.status
  }));

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Avg Performance',
      value: `${Math.round(employees.reduce((acc, emp) => acc + emp.performanceScore, 0) / employees.length || 0)}%`,
      change: '+5%',
      trend: 'up',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      title: 'Active Projects',
      value: projects.filter(p => p.status === 'in-progress' || p.status === 'open').length,
      change: '+3',
      trend: 'up',
      icon: Target,
      color: 'text-green-600'
    },
    {
      title: 'High Performers',
      value: employees.filter(e => e.performanceScore >= 90).length,
      change: '+8%',
      trend: 'up',
      icon: Award,
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

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
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Performance metrics and insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedChart('performance')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedChart === 'performance' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/30'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Performance</span>
          </button>
          <button
            onClick={() => setSelectedChart('trends')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedChart === 'trends' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/30'
            }`}
          >
            <LineChartIcon className="w-4 h-4" />
            <span>Trends</span>
          </button>
          <button
            onClick={() => setSelectedChart('distribution')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedChart === 'distribution' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/30'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            <span>Distribution</span>
          </button>
        </div>
      </motion.div>

      {/* Charts */}
      <AnimatePresence mode="wait">
        {selectedChart === 'performance' && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Performance Distribution */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3498db" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Skills */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Skills
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSkills} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="skill" type="category" width={80} stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#1abc9c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {selectedChart === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Monthly Performance Trend */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="avg" stroke="#3498db" strokeWidth={3} />
                  <Line type="monotone" dataKey="high" stroke="#1abc9c" strokeWidth={3} />
                  <Line type="monotone" dataKey="low" stroke="#f39c12" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Skills Radar */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Skills Overview
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="skill" stroke="#9CA3AF" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9CA3AF" />
                  <Radar name="Skills" dataKey="value" stroke="#3498db" fill="#3498db" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {selectedChart === 'distribution' && (
          <motion.div
            key="distribution"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Project Status Distribution */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Project Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#3498db"
                    dataKey="count"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Project Budget vs Duration */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Project Budget vs Duration
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={projectBudgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="budget" stackId="1" stroke="#3498db" fill="#3498db" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="duration" stackId="1" stroke="#1abc9c" fill="#1abc9c" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Performers
        </h3>
        <div className="space-y-3">
          {topPerformers.map((performer, index) => (
            <motion.div
              key={performer.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-500 text-white' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {performer.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Performance Score
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {performer.score}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics; 