import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Users, 
  LineChart, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  Globe,
  Zap
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
  >
    <div className="w-14 h-14 rounded-2xl bg-agriGreen/10 flex items-center justify-center text-agriGreen mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const Home = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute inset-0 -z-10 hero-pattern opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-100/40 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-agriGreen text-sm font-bold mb-8"
            >
              <Zap className="w-4 h-4" />
              <span>The Future of Ethiopian Agriculture</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tighter mb-8"
            >
              Connecting <span className="text-agriGreen">Farmers</span> with <span className="text-amber-600">Innovation</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              Empowering East Hararghe's agricultural landscape through a revolutionary platform for farmers, students, and buyers.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/register" className="btn-primary px-10 py-4 text-lg w-full sm:w-auto">
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="px-10 py-4 text-lg font-bold text-gray-600 hover:text-agriGreen transition-colors flex items-center gap-2">
                Learn More
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-agriDark text-white rounded-[4rem] mx-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Active Farmers', value: '2,500+' },
              { label: 'Student Experts', value: '450+' },
              { label: 'Tons Produced', value: '15.2k' },
              { label: 'Happy Buyers', value: '1,200+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl lg:text-5xl font-black mb-2">{stat.value}</div>
                <div className="text-agriLight/80 font-bold uppercase tracking-wider text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8 text-center lg:text-left">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                Designed for the <span className="text-agriGreen">Modern Ecosystem</span>
              </h2>
              <p className="text-lg text-gray-600">
                A comprehensive suite of tools built specifically for the needs of the East Hararghe agricultural community.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Globe}
              title="Market Access"
              description="Direct connection between local farmers and bulk buyers, ensuring fair pricing and reduced waste."
              delay={0.1}
            />
            <FeatureCard 
              icon={Users}
              title="Expert Guidance"
              description="Connect with agriculture students and experts for real-time advice and modern farming techniques."
              delay={0.2}
            />
            <FeatureCard 
              icon={LineChart}
              title="Yield Analytics"
              description="Track your crop performance and market trends with advanced data visualization tools."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto bg-amber-500 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 rounded-full blur-3xl opacity-50 -mr-20 -mt-20" />
          <div className="relative z-10 text-center lg:text-left">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Ready to Transform <br /> Your Harvest?
            </h2>
            <p className="text-amber-50 text-xl font-medium max-w-xl">
              Join thousands of farmers and buyers already using AgriLink to grow their business and the community.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="bg-white text-amber-600 px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-50 transition-colors shadow-xl shadow-amber-900/20 text-center">
              Join the Movement
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
