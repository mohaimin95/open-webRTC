import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4 md:p-8">
        <Outlet />
      </main>
      <footer className="bg-indigo-950/50 text-white/70 text-center py-4 text-sm">
        <p>WebRTC Communication Platform © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Layout;