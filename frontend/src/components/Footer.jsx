import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Briefcase,
  Send,
  Heart,
  Truck,
  Shield,
  Users
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Our Mission', path: '/about' },
      { name: 'Careers', path: '#' },
      { name: 'Contact', path: '#' }
    ],
    services: [
      { name: 'For Farmers', path: '/register' },
      { name: 'For Buyers', path: '/register' },
      { name: 'Marketplace', path: '#' },
      { name: 'Expert Consultation', path: '#' }
    ],
    resources: [
      { name: 'Blog', path: '#' },
      { name: 'Farmers Guide', path: '#' },
      { name: 'Market Insights', path: '#' },
      { name: 'Help Center', path: '#' }
    ],
    legal: [
      { name: 'Privacy Policy', path: '#' },
      { name: 'Terms of Service', path: '#' },
      { name: 'Cookie Policy', path: '#' },
      { name: 'Disclaimer', path: '#' }
    ]
  };

  const socialLinks = [
    { icon: Users, href: '#', label: 'Community' },
    { icon: Send, href: '#', label: 'Updates' },
    { icon: Camera, href: '#', label: 'Instagram' },
    { icon: Briefcase, href: '#', label: 'LinkedIn' }
  ];

  const contactInfo = [
    { icon: Mail, text: 'support@agrilink.com', href: 'mailto:support@agrilink.com' },
    { icon: Phone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: MapPin, text: '123 Farm Street, Agriville, ST 12345', href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 group"
            >
              <div className="bg-agriGreen p-3 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-green-400/20">
                <Leaf className="text-white w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tighter">
                  Agri<span className="text-amber-500">Link</span>
                </h3>
                <p className="text-gray-400 text-sm">Connecting Farms to Markets</p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-gray-300 leading-relaxed max-w-md"
            >
              Empowering farmers with technology, ensuring fair trade, and building sustainable agricultural communities worldwide.
            </motion.p>

            {/* Key Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Truck className="w-4 h-4 text-agriGreen" />
                <span>Direct Trade</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-agriGreen" />
                <span>Quality Assured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4 text-agriGreen" />
                <span>Community Driven</span>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex gap-3"
            >
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-agriGreen transition-colors duration-200 group"
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </a>
              ))}
            </motion.div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * categoryIndex }}
              className="space-y-4"
            >
              <h4 className="text-lg font-bold capitalize text-white">
                {category === 'company' ? 'Company' : 
                 category === 'services' ? 'Services' : 
                 category === 'resources' ? 'Resources' : 'Legal'}
              </h4>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-agriGreen transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((contact, index) => (
              <a
                key={index}
                href={contact.href}
                className="flex items-center gap-3 text-gray-400 hover:text-agriGreen transition-colors duration-200 group"
              >
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-agriGreen transition-colors duration-200">
                  <contact.icon className="w-5 h-5" />
                </div>
                <span className="text-sm">{contact.text}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>© {currentYear} AgriLink. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for farmers worldwide</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link to="#" className="text-gray-400 hover:text-agriGreen transition-colors duration-200">
                Privacy
              </Link>
              <Link to="#" className="text-gray-400 hover:text-agriGreen transition-colors duration-200">
                Terms
              </Link>
              <Link to="#" className="text-gray-400 hover:text-agriGreen transition-colors duration-200">
                Cookies
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
