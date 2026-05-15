import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  LineChart, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  Eye,
  Star,
  Target,
  Award,
  Zap,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, trend, trendValue, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`} />
    <div className="flex items-start justify-between mb-6 relative z-10">
      <div className={`p-4 rounded-2xl bg-opacity-10 ${color.replace('bg-', 'text-')} ${color}`}>
        <Icon className="w-8 h-8" />
      </div>
      {trendValue && (
        <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'} text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="space-y-1 relative z-10">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">{label}</h3>
      <p className="text-4xl font-black text-gray-900">{value}</p>
    </div>
  </motion.div>
);

const FarmerAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState({ revenue: 0, orders: 0, views: 0, conversion: '3.2%' });
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [marketTrends, setMarketTrends] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        
        const [ordersRes, cropsRes] = await Promise.all([
          axios.get('/api/orders/farmer/orders', config),
          axios.get('/api/crops/farmer/mycrops', config),
        ]);

        const revenue = ordersRes.data
          .filter(o => o.paymentStatus === 'Paid')
          .reduce((acc, order) => acc + (order.totalPrice || 0), 0);
        
        const totalViews = cropsRes.data.reduce((acc, crop) => acc + (crop.views || 0), 0);

        setStats({
          revenue: revenue,
          orders: ordersRes.data.length,
          views: totalViews,
          conversion: '4.8%'
        });

        // Mock Analytics Data for Harar/Ethiopia Region
        setSalesData([
          { date: 'Mon', sales: 4500, orders: 5 },
          { date: 'Tue', sales: 6200, orders: 8 },
          { date: 'Wed', sales: 3800, orders: 4 },
          { date: 'Thu', sales: 8900, orders: 12 },
          { date: 'Fri', sales: 7200, orders: 9 },
          { date: 'Sat', sales: 11500, orders: 18 },
          { date: 'Sun', sales: 9400, orders: 14 }
        ]);

        setTopProducts([
          { name: 'Premium Coffee', sales: 32500, orders: 42, growth: '+15%', stock: 'High' },
          { name: 'Organic Teff', sales: 24200, orders: 31, growth: '+10%', stock: 'Medium' },
          { name: 'Fresh Khat', sales: 18800, orders: 24, growth: '+22%', stock: 'Low' },
          { name: 'White Onion', sales: 12400, orders: 18, growth: '+5%', stock: 'High' }
        ]);

        setMarketTrends([
          { crop: 'Coffee', trend: 'Rising', demand: 'High', suggestedPrice: '+10%' },
          { crop: 'Teff', trend: 'Stable', demand: 'Medium', suggestedPrice: 'Hold' },
          { crop: 'Khat', trend: 'Rising', demand: 'Very High', suggestedPrice: '+15%' },
          { crop: 'Onion', trend: 'Falling', demand: 'Low', suggestedPrice: '-5%' }
        ]);

      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3"
          >
            <BarChart3 className="w-10 h-10 text-agriGreen" />
            Market Insights
          </motion.h1>
          <p className="text-gray-500 font-medium">Detailed performance analytics for your farm business.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem]">
            {['week', 'month', 'year'].map((range) => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all capitalize ${
                  timeRange === range 
                    ? 'bg-white shadow-sm text-agriGreen' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 text-gray-600 transition-colors shadow-sm">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={`ETB ${stats.revenue.toLocaleString()}`} 
          trend="up" 
          trendValue="+24.5%" 
          color="bg-green-500" 
          delay={0.1} 
        />
        <StatCard 
          icon={ShoppingBag} 
          label="Total Orders" 
          value={stats.orders} 
          trend="up" 
          trendValue="+12.8%" 
          color="bg-blue-500" 
          delay={0.2} 
        />
        <StatCard 
          icon={Eye} 
          label="Product Visibility" 
          value={stats.views.toLocaleString()} 
          trend="up" 
          trendValue="+18.2%" 
          color="bg-purple-500" 
          delay={0.3} 
        />
        <StatCard 
          icon={Target} 
          label="Conversion Rate" 
          value={stats.conversion} 
          trend="up" 
          trendValue="+0.8%" 
          color="bg-amber-500" 
          delay={0.4} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sales Performance Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <LineChart className="text-agriGreen w-6 h-6" />
              Revenue Growth
            </h2>
            <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-agriGreen rounded-full" />
                <span>Current Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded-full" />
                <span>Last Period</span>
              </div>
            </div>
          </div>

          <div className="h-80 flex items-end justify-between px-4">
            {salesData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.sales / 12000) * 100}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 1 }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-agriGreen to-green-300 rounded-t-xl group relative"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      ETB {data.sales.toLocaleString()}
                    </div>
                  </motion.div>
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">{data.date}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Market Predictions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm"
        >
          <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <Zap className="text-amber-500 w-6 h-6" />
            AI Predictions
          </h2>
          <div className="space-y-6">
            {marketTrends.map((trend, i) => (
              <div key={i} className="p-5 bg-gray-50 rounded-3xl border border-transparent hover:border-gray-200 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-black text-gray-900">{trend.crop}</p>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                    trend.trend === 'Rising' ? 'bg-green-100 text-green-700' : 
                    trend.trend === 'Falling' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {trend.trend}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Demand:</span>
                    <span className="text-xs font-black text-gray-700">{trend.demand}</span>
                  </div>
                  <div className="flex items-center gap-1 text-agriGreen font-black text-xs">
                    {trend.suggestedPrice}
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 btn-primary py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
            Detailed Market Report
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Top Performing Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm"
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Award className="text-agriGreen w-6 h-6" />
            Best Sellers
          </h2>
          <button className="text-agriGreen font-black text-sm hover:underline flex items-center gap-1">
            See all products <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topProducts.map((product, i) => (
            <div key={i} className="bg-gray-50 rounded-[2rem] p-6 border border-transparent hover:border-agriGreen/20 transition-all hover:bg-white hover:shadow-xl group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-agriGreen text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-green-100">
                  {i + 1}
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${
                  product.stock === 'High' ? 'bg-green-100 text-green-700' :
                  product.stock === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {product.stock} Stock
                </span>
              </div>
              <h3 className="font-black text-gray-900 mb-1 group-hover:text-agriGreen transition-colors">{product.name}</h3>
              <p className="text-xs text-gray-400 font-bold uppercase mb-4">{product.orders} total orders</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-lg font-black text-gray-900">ETB {product.sales.toLocaleString()}</p>
                <p className="text-xs font-black text-green-500">{product.growth}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FarmerAnalytics;
