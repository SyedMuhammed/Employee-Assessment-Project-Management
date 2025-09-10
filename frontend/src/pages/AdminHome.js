import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api/http';

const COLORS = ['#6366F1', '#A21CAF', '#F59E42', '#10B981', '#F43F5E'];

const AdminHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ employees: 0, projects: 0, avgPerformance: 0 });
  const [projectData, setProjectData] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    // Fetch stats and recent activity
    const fetchStats = async () => {
      try {
        const empRes = await api.get('/api/employees/stats/overview');
        const projRes = await api.get('/api/projects/stats/overview');
        const recentRes = await api.get('/api/projects?limit=5');
        setStats({
          employees: empRes.data.data?.totalEmployees ?? empRes.data.data?.total ?? 0,
          projects: projRes.data.data?.totalProjects ?? projRes.data.data?.total ?? 0,
          avgPerformance: Math.round(empRes.data.data?.avgPerformance || 0)
        });
        setProjectData([
          { name: 'Open', value: projRes.data.data?.openProjects || 0 },
          { name: 'In Progress', value: projRes.data.data?.inProgressProjects || 0 },
          { name: 'Completed', value: projRes.data.data?.completedProjects || 0 }
        ]);
        setRecent((recentRes.data.data || recentRes.data || []).map(p => ({
          title: p.title,
          status: p.status
        })));
      } catch (e) {
        // fallback demo data
        setStats({ employees: 12, projects: 7, avgPerformance: 87 });
        setProjectData([
          { name: 'Open', value: 3 },
          { name: 'In Progress', value: 2 },
          { name: 'Completed', value: 2 }
        ]);
        setRecent([
          { title: 'Project Alpha', status: 'open' },
          { title: 'Project Beta', status: 'Completed' }
        ]);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Welcome, Admin!</h1>
          <p className="text-gray-600 dark:text-gray-400">Here’s an overview of your organization’s performance and activity.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/dashboard/projects')}
            className="btn-primary flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Manage Projects
          </button>
          <button 
            onClick={() => navigate('/dashboard/employees')}
            className="btn-primary flex items-center gap-2"
          >
            <Users className="w-4 h-4" /> Manage Employees
          </button>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="card flex flex-col items-center p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Users className="w-8 h-8 text-primary-500 mb-2" />
          <div className="text-2xl font-bold">{stats.employees}</div>
          <div className="text-gray-500">Employees</div>
        </motion.div>
        <motion.div className="card flex flex-col items-center p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <FileText className="w-8 h-8 text-purple-500 mb-2" />
          <div className="text-2xl font-bold">{stats.projects}</div>
          <div className="text-gray-500">Projects</div>
        </motion.div>
        <motion.div className="card flex flex-col items-center p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
          <div className="text-2xl font-bold">{stats.avgPerformance}%</div>
          <div className="text-gray-500">Avg. Performance</div>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div className="card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Project Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={projectData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {projectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div className="card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="w-5 h-5" /> Recent Projects</h2>
          <ul className="space-y-2">
            {recent.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{item.title}</span>
                <span className={`ml-auto px-2 py-1 rounded-full text-xs ${item.status === 'open' || item.status === 'in-progress' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{item.status}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminHome;