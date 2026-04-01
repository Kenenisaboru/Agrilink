import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CropManagement from './pages/CropManagement';
import FarmerOrders from './pages/FarmerOrders';
import ChatPage from './pages/ChatPage';
import Navbar from './components/Navbar';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen flex flex-col selection:bg-agriGreen selection:text-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat" element={<ChatPage />} />
            
            {/* Protected Routes */}
            {user && user.role === 'Farmer' && (
              <>
                <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
                <Route path="/dashboard/farmer/crops" element={<CropManagement />} />
                <Route path="/dashboard/farmer/orders" element={<FarmerOrders />} />
              </>
            )}
            {user && user.role === 'Student' && (
              <Route path="/dashboard/student/*" element={<StudentDashboard />} />
            )}
            {user && user.role === 'Buyer' && (
              <Route path="/dashboard/buyer/*" element={<BuyerDashboard />} />
            )}
            {user && user.role === 'Admin' && (
              <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
            )}
          </Routes>
        </main>
        {/* Footer */}
        <footer className="bg-slate-900 text-white text-center p-8 mt-auto rounded-t-[3rem]">
          <div className="max-w-4xl mx-auto space-y-4">
             <h3 className="text-2xl font-black text-agriLight">AgriLink</h3>
             <p className="text-slate-400 text-sm font-medium">East Hararghe Farmer-Student Innovation Platform</p>
             <div className="h-px bg-slate-800 w-full"></div>
             <p className="text-slate-500 text-xs tracking-widest uppercase font-black italic mt-4">
               © {new Date().getFullYear()} Empowering Ethiopian Agriculture
             </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
