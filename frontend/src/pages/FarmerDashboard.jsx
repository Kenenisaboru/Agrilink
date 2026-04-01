import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Search, Sprout, AlertCircle } from 'lucide-react';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [problems, setProblems] = useState([]);
  const [activeTab, setActiveTab] = useState('crops'); // 'crops' or 'problems'

  useEffect(() => {
    // In a real app, this would fetch only the farmer's crops/problems
    // For now we will mock the fetched data layout
    const fetchDashboardData = async () => {
      try {
        const cropRes = await axios.get('http://localhost:5000/api/crops');
        // Filter crops for current farmer
        setCrops(cropRes.data.filter(c => c.farmer._id === user._id || c.farmer === user._id));
        
        const probRes = await axios.get('http://localhost:5000/api/problems');
        setProblems(probRes.data.filter(p => p.farmer._id === user._id || p.farmer === user._id));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (user?.token) {
       axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
       fetchDashboardData();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-agriGreen flex justify-between items-center bg-gradient-to-r from-agriBg to-white">
        <div>
          <h1 className="text-3xl font-bold text-agriDark">Welcome, {user?.name}!</h1>
          <p className="text-gray-600 flex items-center gap-2 mt-2">
            <Sprout size={18} className="text-agriGreen"/> East Hararghe Farmer Area 
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PlusCircle size={20} />
          {activeTab === 'crops' ? 'Add Crop' : 'Post Problem'}
        </button>
      </div>

      <div className="flex space-x-4 border-b pb-2">
        <button 
          onClick={() => setActiveTab('crops')}
          className={`text-lg font-bold px-4 py-2 rounded-t-lg transition ${activeTab === 'crops' ? 'bg-agriGreen text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          My Crops
        </button>
        <button 
          onClick={() => setActiveTab('problems')}
          className={`text-lg font-bold px-4 py-2 rounded-t-lg transition ${activeTab === 'problems' ? 'bg-agriEarth text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          My Problems
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'crops' && crops.length === 0 && (
          <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">You haven't listed any crops yet.</p>
          </div>
        )}
        
        {activeTab === 'crops' && crops.map(crop => (
          <div key={crop._id} className="card p-4 space-y-2">
             <div className="bg-gray-200 h-40 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                {crop.image ? <img src={crop.image} alt={crop.name} className="object-cover h-full w-full rounded-lg" /> : 'No Image'}
             </div>
             <h3 className="text-xl font-bold">{crop.name}</h3>
             <p className="text-gray-600 font-semibold">{crop.pricePerUnit} ETB / {crop.unit}</p>
             <p className="text-sm text-gray-500">Quantity: {crop.quantity} {crop.unit}</p>
             <div className="pt-2 flex justify-between">
                <button className="text-blue-600 hover:underline">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
             </div>
          </div>
        ))}

        {activeTab === 'problems' && problems.length === 0 && (
          <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">You haven't posted any problems.</p>
          </div>
        )}

        {activeTab === 'problems' && problems.map(problem => (
          <div key={problem._id} className="card p-5 space-y-3 border-l-4 border-red-500">
             <div className="flex items-start justify-between">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <AlertCircle size={20} className="text-red-500"/>
                 {problem.title}
               </h3>
               <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">{problem.status}</span>
             </div>
             <p className="text-gray-600 line-clamp-3">{problem.description}</p>
             <Link to={`/problem/${problem._id}`} className="block text-center mt-4 text-agriGreen font-bold hover:underline">View Student Solutions</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FarmerDashboard;
