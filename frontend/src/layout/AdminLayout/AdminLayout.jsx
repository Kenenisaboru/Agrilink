import React from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/Footer';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="Admin" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
