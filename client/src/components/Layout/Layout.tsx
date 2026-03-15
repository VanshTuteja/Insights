import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { Toaster } from '@/components/ui/sonner';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:top-16 md:z-30">
          <Sidebar 
            isCollapsed={sidebarCollapsed} 
            onToggle={toggleSidebar}
          />
        </div>
        
        {/* Mobile Sidebar */}
        <MobileSidebar />
        
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}>
          <main className="container mx-auto px-4 py-6">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Layout;