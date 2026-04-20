'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/helpbar/sidebar';
import NavAdmin from '@/components/admin/helpbar/nav-admin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'}`}>
        <NavAdmin onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}