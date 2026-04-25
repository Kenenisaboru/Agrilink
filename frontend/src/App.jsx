import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layouts
import FarmerLayout from './layout/FarmerLayout/FarmerLayout';
import BuyerLayout from './layout/BuyerLayout/BuyerLayout';
import AdminLayout from './layout/AdminLayout/AdminLayout';
import RepresentativeLayout from './layout/RepresentativeLayout/RepresentativeLayout';
import StudentLayout from './layout/StudentLayout/StudentLayout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import AIAssistant from './pages/AIAssistant';
import VoiceAIAssistant from './pages/VoiceAIAssistant';
import Products from './pages/Products';
import Cart from './pages/Cart';
import OrderManagement from './pages/OrderManagement';
import FarmerDashboard from './pages/FarmerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RepresentativeDashboard from './pages/RepresentativeDashboard';
import CropManagement from './pages/CropManagement';
import FarmerOrders from './pages/FarmerOrders';
import ChatPage from './pages/ChatPage';
import PricePrediction from './pages/PricePrediction';
import Checkout from './pages/buyer/Checkout';
import PaymentHistory from './pages/buyer/PaymentHistory';
import PaymentVerify from './pages/buyer/PaymentVerify';
import BuyerOrders from './pages/buyer/BuyerOrders';

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

export default function App() {
  return (
    <NotificationProvider>
      <LanguageProvider>
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/voice-ai" element={<VoiceAIAssistant />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/*Protected Routes  */}
            <Route
              path="/chat"
              element={<ProtectedRoute><ChatPage /></ProtectedRoute>}
            />
            <Route
              path="/ai-assistant"
              element={<ProtectedRoute><AIAssistant /></ProtectedRoute>}
            />
            <Route
              path="/price-prediction"
              element={<ProtectedRoute><PricePrediction /></ProtectedRoute>}
            />

            <Route
              path="/dashboard/farmer"
              element={<ProtectedRoute allowedRoles={['Farmer']}><FarmerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/farmer/crops"
              element={<ProtectedRoute allowedRoles={['Farmer']}><CropManagement /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/farmer/orders"
              element={<ProtectedRoute allowedRoles={['Farmer']}><FarmerOrders /></ProtectedRoute>}
            />

            <Route
              path="/dashboard/student"
              element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>}
            />

            <Route
              path="/dashboard/buyer"
              element={<ProtectedRoute allowedRoles={['Buyer']}><BuyerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/checkout"
              element={<ProtectedRoute allowedRoles={['Buyer']}><Checkout /></ProtectedRoute>}
            />
            <Route
              path="/payment/verify/:tx_ref"
              element={<ProtectedRoute allowedRoles={['Buyer']}><PaymentVerify /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/buyer/orders"
              element={<ProtectedRoute allowedRoles={['Buyer']}><BuyerOrders /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/buyer/payments"
              element={<ProtectedRoute allowedRoles={['Buyer']}><PaymentHistory /></ProtectedRoute>}
            />

            <Route
              path="/dashboard/admin"
              element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>}
            />

            <Route
              path="/dashboard/representative"
              element={<ProtectedRoute allowedRoles={['Representative']}><RepresentativeDashboard /></ProtectedRoute>}
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </LayoutWrapper>
      </LanguageProvider>
    </NotificationProvider>
  );
}
