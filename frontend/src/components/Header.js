import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  LogOut, 
  ChevronDown
} from 'lucide-react';

const Header = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  

  return (
    <motion.header 
      className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Greeting */}
        <div className="flex items-center space-x-6">
          {/* User Greeting */}
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold greeting-text">
              Hello {user?.firstName || 'Admin'} 👋
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 typewriter">
              Welcome back to your dashboard
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          {/* Removed theme toggle since theme is locked to dark */}
          <div className="hidden" />

          {/* Notifications removed */}

          {/* User menu */}
          <div className="relative" style={{ position: 'relative', zIndex: 10000 }}>
            <motion.button
              onClick={() => { setShowUserMenu(!showUserMenu); }}
              className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
              style={{
                background: 'rgba(44, 62, 80, 0.4)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(52, 152, 219, 0.3)'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user?.email || 'admin@company.com'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700"
                  style={{
                    background: 'rgba(44, 62, 80, 0.95)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(52, 152, 219, 0.3)',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                    zIndex: 10001,
                    position: 'absolute',
                    top: '100%',
                    right: 0
                  }}
                >
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-dark-700">
                      Signed in as <strong>{user?.email || 'admin@company.com'}</strong>
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          navigate('/dashboard/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 