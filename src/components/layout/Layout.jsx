import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import FloatingNewsButton from '../shared/FloatingNewsButton';

const Layout = ({ onLogout }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        onLogout={onLogout}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />

      {/* Floating News/Updates Button */}
      <FloatingNewsButton />

      {/* Main Content Area - adjusts margin based on sidebar state */}
      <div
        className={`transition-all duration-300 ${
          isSidebarExpanded ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <main className="min-h-screen pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
