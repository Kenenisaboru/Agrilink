import { Link } from 'react-router-dom';
import { Leaf, GraduationCap, ShoppingBasket } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-agriGreen to-agriDark rounded-3xl p-10 md:p-20 text-white shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            East Hararghe's Smart <span className="text-agriLight">Agricultural Platform</span>
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Connect farmers with student innovators and buyers. Sell crops directly, solve farming problems, and simulate M-Pesa payments instantly.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link to="/register" className="btn-secondary px-8 py-3 text-lg">Get Started</Link>
            <Link to="/login" className="px-8 py-3 text-lg bg-transparent border-2 border-agriLight hover:bg-agriLight hover:text-agriDark font-bold rounded shadow transition-colors duration-300">Login</Link>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          {/* Placeholder for Hero Img */}
          <div className="w-64 h-64 md:w-96 md:h-96 bg-agriLight rounded-full flex items-center justify-center shadow-2xl overflow-hidden relative border-8 border-white border-opacity-20 hover:scale-105 transition duration-500">
             <img src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=800" alt="Farmer in field" className="object-cover w-full h-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10">
        <h2 className="text-3xl font-bold text-center mb-10 text-agriDark">Who is AgriLink For?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="card p-8 text-center space-y-4 border-t-4 border-agriGreen">
            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-agriGreen">
              <Leaf size={32} />
            </div>
            <h3 className="text-2xl font-bold">Farmers</h3>
            <p className="text-gray-600">Sell maize, chat, coffee, and vegetables. Post farming struggles to get expert student advice.</p>
          </div>

          {/* Card 2 */}
          <div className="card p-8 text-center space-y-4 border-t-4 border-blue-500">
            <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-blue-600">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-2xl font-bold">Students</h3>
            <p className="text-gray-600">Haramaya University students can provide solutions to real local farming problems.</p>
          </div>

          {/* Card 3 */}
          <div className="card p-8 text-center space-y-4 border-t-4 border-agriEarth">
            <div className="mx-auto bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center text-agriEarth">
              <ShoppingBasket size={32} />
            </div>
            <h3 className="text-2xl font-bold">Buyers</h3>
            <p className="text-gray-600">Find fresh crops directly from local farmers in Harar, Dire Dawa, and Jigjiga. Pay securely with M-Pesa.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
