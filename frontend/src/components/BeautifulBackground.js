import React from 'react';

const BeautifulBackground = ({ children }) => {
  return (
    <div className="app-background min-h-screen">
      {/* Floating particles */}
      <div className="floating-particles">
        <div className="particle w-2 h-2"></div>
        <div className="particle w-1 h-1"></div>
        <div className="particle w-3 h-3"></div>
        <div className="particle w-1 h-1"></div>
        <div className="particle w-2 h-2"></div>
        <div className="particle w-1 h-1"></div>
        <div className="particle w-3 h-3"></div>
        <div className="particle w-1 h-1"></div>
        <div className="particle w-2 h-2"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BeautifulBackground;
