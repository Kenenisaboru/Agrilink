import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages placeholders (we'll create these next)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Navbar from './components/Navbar';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            {user && user.role === 'Farmer' && (
              <Route path="/dashboard/farmer/*" element={<FarmerDashboard />} />
            )}
            {user && user.role === 'Student' && (
              <Route path="/dashboard/student/*" element={<StudentDashboard />} />
            )}
            {user && user.role === 'Buyer' && (
              <Route path="/dashboard/buyer/*" element={<BuyerDashboard />} />
            )}
          </Routes>
        </main>
        {/* Footer */}
        <footer className="bg-agriDark text-white text-center p-4 mt-auto">
          <p>© {new Date().getFullYear()} AgriLink - East Hararghe Innovation Platform</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
