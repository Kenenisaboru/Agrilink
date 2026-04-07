import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Globe, Users } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="py-32 bg-gray-50/50 relative overflow-hidden border-t border-gray-100">
      <div className="absolute top-0 left-0 w-64 h-64 bg-agriGreen/5 rounded-full blur-3xl -ml-32 -mt-32" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-48 -mb-48" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight"
          >
            Our <span className="text-agriGreen">Mission</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 leading-relaxed font-medium"
          >
            To bridge the gap between farmers and markets, providing a comprehensive platform that 
            empowers farmers with technology, ensures fair trade, and promotes sustainable agricultural 
            practices for a better future in East Hararghe.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Leaf, title: "Farmer First", desc: "Prioritizing the welfare and success of local farmers." },
            { icon: ShieldCheck, title: "Quality Assurance", desc: "Highest standards for all agricultural products." },
            { icon: Globe, title: "Sustainability", desc: "Eco-friendly and sustainable farming practices." },
            { icon: Users, title: "Community", desc: "Strong connections between farmers, buyers, and experts." }
          ].map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-agriGreen/10 flex items-center justify-center text-agriGreen mb-6 group-hover:scale-110 transition-transform">
                <value.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">{value.title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
