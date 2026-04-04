import React from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';

const RepresentativeLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar role="Representative" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RepresentativeLayout;
