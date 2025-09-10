import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ProjectRequirements from './ProjectRequirements';
import EmployeeDatabase from './EmployeeDatabase';
import AddEditEmployee from './AddEditEmployee';
import Analytics from './Analytics';
import Chatbot from '../components/Chatbot';
import AdminHome from './AdminHome';
import Profile from './Profile';
import BeautifulBackground from '../components/BeautifulBackground';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Guard: admin-only access. If a non-admin somehow reaches here, log out and redirect.
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      handleLogout();
    }
  }, [user]);

  // Admin dashboard with full features
  return (
    <BeautifulBackground>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden ml-64">
          {/* Header */}
          <Header 
            onLogout={handleLogout}
            user={user}
            theme={theme}
          />

          {/* Page content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6 w-full"
              >
                <Routes>
                  <Route path="/" element={<AdminHome />} />
                  <Route path="/projects" element={<ProjectRequirements />} />
                  <Route path="/employees" element={<EmployeeDatabase />} />
                  <Route path="/add-employee" element={<AddEditEmployee />} />
                  <Route path="/edit-employee/:id" element={<AddEditEmployee />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Chatbot */}
        <Chatbot />
      </div>
    </BeautifulBackground>
  );
};

export default Dashboard; 