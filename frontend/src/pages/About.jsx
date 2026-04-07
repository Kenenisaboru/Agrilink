import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Leaf, 
  Heart, 
  Target, 
  Award,
  Globe,
  Truck,
  Shield,
  TrendingUp
} from 'lucide-react';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const values = [
    {
      icon: Heart,
      title: "Farmer First",
      description: "We prioritize the welfare and success of farmers in everything we do."
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Ensuring the highest standards for all agricultural products and services."
    },
    {
      icon: Globe,
      title: "Sustainability",
      description: "Promoting environmentally friendly and sustainable farming practices."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building strong connections between farmers, buyers, and agricultural experts."
    }
  ];

  const features = [
    {
      icon: Truck,
      title: "Direct Trade",
      description: "Connect farmers directly with buyers, eliminating middlemen and ensuring fair prices."
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description: "Real-time market data and analytics to help farmers make informed decisions."
    },
    {
      icon: Award,
      title: "Expert Support",
      description: "Access to agricultural experts and resources for better farming practices."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-agriGreen to-green-600 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              About <span className="text-amber-400">AgriLink</span>
            </h1>
            <p className="text-xl md:text-2xl text-green-50 max-w-3xl mx-auto leading-relaxed">
              Empowering farmers, connecting communities, and revolutionizing agriculture through technology.
            </p>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-amber-400/20 rounded-full blur-xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-green-400/20 rounded-full blur-xl" />
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
            >
              Our <span className="text-agriGreen">Mission</span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
            >
              To bridge the gap between farmers and markets, providing a comprehensive platform that 
              empowers farmers with technology, ensures fair trade, and promotes sustainable agricultural 
              practices for a better future.
            </motion.p>
          </motion.div>

          {/* Values Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="bg-agriGreen/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-agriGreen" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              What We <span className="text-agriGreen">Offer</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive solutions designed to transform the agricultural ecosystem.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-agriGreen to-green-600 rounded-3xl p-12 text-white text-center"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-12">Our Impact</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: "10,000+", label: "Farmers Connected" },
                { number: "50,000+", label: "Transactions Processed" },
                { number: "100+", label: "Expert Consultants" },
                { number: "25+", label: "Regions Covered" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="text-4xl md:text-5xl font-black text-amber-400">
                    {stat.number}
                  </div>
                  <div className="text-green-50 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              Join Our <span className="text-agriGreen">Agricultural Revolution</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Be part of a community that's transforming agriculture for the better. 
              Whether you're a farmer, buyer, or agricultural expert, there's a place for you at AgriLink.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary py-4 px-8 text-lg font-bold shadow-lg hover:shadow-xl transition-shadow">
                Join as Farmer
              </button>
              <button className="btn-secondary py-4 px-8 text-lg font-bold border-2 border-agriGreen text-agriGreen hover:bg-agriGreen hover:text-white transition-colors">
                Join as Buyer
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
