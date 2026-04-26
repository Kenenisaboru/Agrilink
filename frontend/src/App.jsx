import React, { lazy, Suspense } from 'react';
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
import AIChatbotWidget from './components/common/AIChatbotWidget';

// Lazy Loaded Pages for Production Performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Blog = lazy(() => import('./pages/Blog'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const VoiceAIAssistant = lazy(() => import('./pages/VoiceAIAssistant'));
const Products = lazy(() => import('./pages/Products'));
const Cart = lazy(() => import('./pages/Cart'));
const OrderManagement = lazy(() => import('./pages/OrderManagement'));
const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const RepresentativeDashboard = lazy(() => import('./pages/RepresentativeDashboard'));
const CropManagement = lazy(() => import('./pages/CropManagement'));
const FarmerOrders = lazy(() => import('./pages/FarmerOrders'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const PricePrediction = lazy(() => import('./pages/PricePrediction'));
const Checkout = lazy(() => import('./pages/buyer/Checkout'));
const PaymentHistory = lazy(() => import('./pages/buyer/PaymentHistory'));
const PaymentVerify = lazy(() => import('./pages/buyer/PaymentVerify'));
const BuyerOrders = lazy(() => import('./pages/buyer/BuyerOrders'));

import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center">
    <Loader2 className="w-12 h-12 animate-spin text-agriGreen mb-4" />
    <p className="text-gray-500 font-medium">Loading page...</p>
  </div>
);

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
    <ErrorBoundary>
      <NotificationProvider>
        <LanguageProvider>
          <LayoutWrapper>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </LayoutWrapper>
          <AIChatbotWidget />
        </LanguageProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}
