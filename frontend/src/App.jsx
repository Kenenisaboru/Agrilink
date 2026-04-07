import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import FarmerLayout from './layout/FarmerLayout/FarmerLayout';
import BuyerLayout from './layout/BuyerLayout/BuyerLayout';
import StudentLayout from './layout/StudentLayout/StudentLayout';
import AdminLayout from './layout/AdminLayout/AdminLayout';
import RepresentativeLayout from './layout/RepresentativeLayout/RepresentativeLayout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import FarmerDashboard from './pages/FarmerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RepresentativeDashboard from './pages/RepresentativeDashboard';
import CropManagement from './pages/CropManagement';
import FarmerOrders from './pages/FarmerOrders';
import ChatPage from './pages/ChatPage';
import Checkout from './pages/buyer/Checkout';
import PaymentHistory from './pages/buyer/PaymentHistory';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const LayoutWrapper = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const publicPaths = ['/', '/about', '/login', '/register'];
  const isPublicPath = publicPaths.includes(location.pathname);

  if (isPublicPath || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-agriBg">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // Role-based layouts
  switch (user.role) {
    case 'Farmer':
      return <FarmerLayout>{children}</FarmerLayout>;
    case 'Buyer':
      return <BuyerLayout>{children}</BuyerLayout>;
    case 'Student':
      return <StudentLayout>{children}</StudentLayout>;
    case 'Admin':
      return <AdminLayout>{children}</AdminLayout>;
    case 'Representative':
      return <RepresentativeLayout>{children}</RepresentativeLayout>;
    default:
      return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-grow">{children}</main><Footer /></div>;
  }
};

function App() {
  return (
    <div style={{ padding: '100px', textAlign: 'center', fontSize: '40px', color: '#2E7D32' }}>
      AgriLink is Loading... Check Console if Blank
    </div>
  );
}

export default App;
