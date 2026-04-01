import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, MapPin, Search } from 'lucide-react';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/crops');
        setCrops(data);
      } catch (err) {
        console.error("Error fetching crops:", err);
      }
    };
    fetchCrops();
  }, []);

  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    crop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-agriEarth flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-amber-50 to-white">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
          <p className="text-agriEarth flex items-center gap-2 mt-2 font-medium">
            <ShoppingCart size={18} /> Marketplace Dashboard
          </p>
        </div>
        
        <div className="relative w-full md:w-1/3">
           <Search size={20} className="absolute left-3 top-3 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search crops or locations..." 
             className="input-field pl-10"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div>
         <h2 className="text-2xl font-bold mb-4">Available Real-time Crops</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {filteredCrops.map(crop => (
              <div key={crop._id} className="card overflow-hidden flex flex-col h-full">
                <div className="h-48 bg-gray-200">
                  {crop.image 
                    ? <img src={crop.image} alt={crop.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium bg-gradient-to-br from-green-100 to-green-50">Crop Image</div>
                  }
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="text-xl font-bold">{crop.name}</h3>
                     <span className="bg-green-100 text-agriGreen text-xs font-bold px-2 py-1 rounded">{crop.category}</span>
                  </div>
                  <p className="text-2xl font-black text-gray-800 my-2">{crop.pricePerUnit} ETB <span className="text-sm text-gray-500 font-normal">/ {crop.unit}</span></p>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin size={16} className="mr-1" /> {crop.location}
                  </div>
                  
                  <div className="mt-auto space-y-2">
                    <p className="text-sm font-medium text-gray-700">Available: {crop.quantity} {crop.unit}</p>
                    <button className="btn-primary w-full flex justify-center items-center gap-2">
                      <ShoppingCart size={18} /> Buy with M-Pesa
                    </button>
                  </div>
                </div>
              </div>
           ))}
           {filteredCrops.length === 0 && (
              <div className="col-span-full py-10 text-center text-gray-500 border border-dashed rounded-lg">
                No crops found matching your search.
              </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
