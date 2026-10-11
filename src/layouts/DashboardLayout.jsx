import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[650px] h-[650px] rounded-full bg-purple-600/10 blur-[160px]" />
        <div className="absolute top-[40%] right-[20%] w-[500px] h-[500px] rounded-full bg-cyan-600/8 blur-[180px]" />
      </div>

      {/* Sidebar (Desktop sticky & Mobile drawer) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen relative z-10">
        {/* Top Navigation Bar */}
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
        />

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}
