import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Plus, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/projects', icon: FileText, label: 'Project Requirements' },
    { path: '/dashboard/employees', icon: Users, label: 'Employee Database' },
    { path: '/dashboard/add-employee', icon: Plus, label: 'Add Employee' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <div
      className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-800 shadow-xl border-r border-gray-200 dark:border-dark-700 h-full flex flex-col"
      aria-label="Sidebar navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">EA System</span>
        </motion.div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2" aria-label="Sidebar menu">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              variants={itemVariants}
              initial="closed"
              animate="open"
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={`sidebar-item group relative focus:outline-none focus:ring-2 focus:ring-primary-500 ${isActive ? 'active' : ''}`}
                tabIndex={0}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-l-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-700">
        <motion.button
          onClick={logout}
          className="sidebar-item w-full justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-400"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar; 