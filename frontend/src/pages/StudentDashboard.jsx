import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Lightbulb, Info } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        // Here students fetch all open problems from all farmers
        const { data } = await axios.get('http://localhost:5000/api/problems');
        setProblems(data);
      } catch (err) {
        console.error("Error fetching problems:", err);
      }
    };
    fetchProblems();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hello, {user?.name}!</h1>
          <p className="text-blue-600 flex items-center gap-2 mt-2 font-medium">
            <Lightbulb size={18} /> Student Innovator Dashboard
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Urgent Farmer Problems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map(problem => (
             <div key={problem._id} className="card p-5 space-y-4 hover:border-blue-300 border-2 border-transparent transition-all">
               <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{problem.category}</span>
                    <h3 className="text-xl font-bold mt-1">{problem.title}</h3>
                  </div>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">Needs Solution</span>
               </div>
               <p className="text-gray-600 text-sm line-clamp-3">{problem.description}</p>
               
               <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                 <span className="text-xs text-gray-500 flex items-center gap-1">
                   <Info size={14}/> Farmer: {problem.farmer?.name || 'Local Farmer'}
                 </span>
                 <button className="text-blue-600 font-bold hover:underline text-sm flex items-center gap-1">
                   <Lightbulb size={16}/> Propose Solution
                 </button>
               </div>
             </div>
          ))}
          {problems.length === 0 && (
             <div className="col-span-full py-10 text-center text-gray-500 bg-gray-50 rounded-lg">
               No active problems found. Check back later!
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
