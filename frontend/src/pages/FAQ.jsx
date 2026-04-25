import React, { useState } from 'react';
import { 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Search,
  HelpCircle,
  Mail,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategory, setOpenCategory] = useState('general');
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqData = {
    general: [
      {
        question: 'What is AgriLink?',
        answer: 'AgriLink is a comprehensive agricultural e-commerce platform that connects farmers directly with buyers in East Hararghe and across Ethiopia. We provide a marketplace for agricultural products, expert consultation services, and tools to help farmers succeed.'
      },
      {
        question: 'How do I create an account?',
        answer: 'Click on the "Sign Up" button in the top right corner of the homepage. You can register as a farmer, buyer, student, or agricultural expert. Fill in your details and verify your email to get started.'
      },
      {
        question: 'Is AgriLink free to use?',
        answer: 'Yes, creating an account and browsing products is completely free. We charge a small commission on successful transactions to maintain the platform and provide our services.'
      },
      {
        question: 'Where is AgriLink available?',
        answer: 'AgriLink currently serves the East Hararghe region and is expanding to cover all of Ethiopia. We plan to expand to other East African countries in the future.'
      }
    ],
    ordering: [
      {
        question: 'How do I place an order?',
        answer: 'Browse our products, add items to your cart, and proceed to checkout. You can pay using Telebirr, M-Pesa, CBE, or credit/debit cards. Once payment is confirmed, your order will be processed and shipped.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept multiple payment methods including Telebirr, M-Pesa, CBE Birr, and major credit/debit cards. All transactions are secure and encrypted.'
      },
      {
        question: 'How long does delivery take?',
        answer: 'Delivery times vary based on your location and the product. Generally, delivery takes 2-5 business days within East Hararghe and 5-7 business days for other regions in Ethiopia.'
      },
      {
        question: 'Can I track my order?',
        answer: 'Yes! Once your order is shipped, you will receive a tracking number. You can track your order status in real-time through your dashboard or our order tracking page.'
      },
      {
        question: 'What is your return policy?',
        answer: 'We accept returns within 7 days of delivery for perishable goods and 14 days for non-perishable items. Products must be in their original condition. Contact our support team to initiate a return.'
      }
    ],
    farmers: [
      {
        question: 'How do I sell my products on AgriLink?',
        answer: 'Register as a farmer, complete your profile verification, and start listing your products. You can add up to 5 images per product, set your prices, and manage your inventory all from your farmer dashboard.'
      },
      {
        question: 'What are the fees for selling on AgriLink?',
        answer: 'We charge a 5% commission on successful transactions. There are no listing fees or hidden charges. You only pay when you make a sale.'
      },
      {
        question: 'How do I get paid?',
        answer: 'Payments are transferred to your registered bank account or mobile money account within 3-5 business days after the order is delivered and confirmed by the buyer.'
      },
      {
        question: 'Can I edit my product listings?',
        answer: 'Yes, you can edit your product listings at any time from your farmer dashboard. You can update prices, quantities, images, and product descriptions.'
      },
      {
        question: 'How do I get expert consultation?',
        answer: 'Access our AI-powered agricultural assistant or connect with human experts through the chat feature. Experts can provide guidance on farming practices, market trends, and more.'
      }
    ],
    technical: [
      {
        question: 'Is my personal information secure?',
        answer: 'Yes, we take security seriously. All data is encrypted using industry-standard SSL encryption. We never share your personal information with third parties without your consent.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click on "Forgot Password" on the login page. Enter your email address, and we will send you a password reset link. Follow the instructions in the email to create a new password.'
      },
      {
        question: 'Can I use AgriLink on my mobile phone?',
        answer: 'Yes! AgriLink is fully responsive and works on all devices. We also have a mobile app available for download on Android and iOS for the best mobile experience.'
      },
      {
        question: 'What should I do if I encounter a bug?',
        answer: 'Please report any bugs or issues to our support team through the contact form or email us at support@agrilink.et. We appreciate your feedback and will work to resolve issues quickly.'
      }
    ]
  };

  const categories = [
    { id: 'general', name: 'General', icon: HelpCircle },
    { id: 'ordering', name: 'Ordering & Delivery', icon: MessageSquare },
    { id: 'farmers', name: 'For Farmers', icon: HelpCircle },
    { id: 'technical', name: 'Technical Support', icon: HelpCircle }
  ];

  const filteredFAQs = faqData[openCategory].filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-agriGreen text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black mb-4"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-agriLight"
          >
            Find answers to common questions about AgriLink
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium shadow-sm"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setOpenCategory(category.id);
                  setOpenQuestion(null);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                  openCategory === category.id
                    ? 'bg-agriGreen text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {category.name}
              </button>
            );
          })}
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No FAQs found</h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-900 pr-8">{faq.question}</span>
                  {openQuestion === index ? (
                    <ChevronUp className="w-5 h-5 text-agriGreen shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openQuestion === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </motion.div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-agriGreen to-green-600 rounded-3xl p-8 text-white text-center"
        >
          <h2 className="text-2xl font-black mb-4">Still Need Help?</h2>
          <p className="text-agriLight mb-6">Can't find the answer you're looking for? Our support team is here to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="flex items-center justify-center gap-2 bg-white text-agriGreen font-bold py-3 px-6 rounded-2xl hover:bg-gray-100 transition-colors">
              <Mail className="w-5 h-5" />
              Contact Support
            </a>
            <a href="tel:+251911123456" className="flex items-center justify-center gap-2 bg-white/20 text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/30 transition-colors">
              <Phone className="w-5 h-5" />
              Call Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
