/**
 * VAYUWISE AI - Main Layout Shell
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navigation/Navbar.js';
import { Sidebar } from '../components/Navigation/Sidebar.js';

export const AppShell: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-warm-bg text-forest-charcoal flex flex-col">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 md:pl-64 p-4 sm:p-6 lg:p-8 outline-none focus:outline-none"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Accessible Footer */}
      <footer className="md:pl-64 border-t border-sage-200/80 bg-white py-6 px-4 sm:px-8 text-xs text-forest-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <strong className="text-forest-800">VAYUWISE AI</strong> — Full-Stack GenAI Urban Air Quality Platform.
          <span className="block sm:inline sm:ml-1 text-[11px] text-forest-400">
            Hack2Skill Challenge 6 Submission.
          </span>
        </div>
        <div className="flex items-center gap-4 text-forest-600">
          <span>Standards: CPCB NAQI & US EPA</span>
          <span>•</span>
          <span>GenAI: Google Gemini</span>
        </div>
      </footer>
    </div>
  );
};
