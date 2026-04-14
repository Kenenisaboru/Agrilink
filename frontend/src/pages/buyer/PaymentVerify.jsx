import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, Loader2, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentVerify = () => {
  const { tx_ref } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await axios.get(`/api/payments/verify/${tx_ref}`);
        if (response.data.success) {
          setStatus('success');
          setMessage('Your payment has been successfully processed!');
        } else {
          setStatus('failed');
          setMessage('Payment verification failed.');
        }
      } catch (error) {
        setStatus('failed');
        setMessage(error.response?.data?.message || 'An error occurred during verification.');
      }
    };

    verifyPayment();
  }, [tx_ref]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl border border-gray-100"
      >
        {status === 'verifying' && (
          <div className="space-y-6">
            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <Loader2 size={56} className="animate-spin" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Verifying...</h2>
            <p className="text-gray-500 font-medium mb-8">
              Please wait while we confirm your payment with Chapa.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-24 h-24 bg-green-50 text-agriGreen rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle2 size={56} />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Payment Approved!</h2>
            <p className="text-gray-500 font-medium mb-8">{message}</p>
            <div className="bg-gray-50 rounded-3xl p-6 mb-8">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest text-left">Transaction Ref</p>
              <p className="text-gray-900 font-black text-left">{tx_ref}</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/buyer')}
              className="w-full btn-primary py-4 rounded-2xl text-lg font-black flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Go to Dashboard
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-6">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <XCircle size={56} />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Payment Failed</h2>
            <p className="text-red-500 font-medium mb-8">{message}</p>
            <button 
              onClick={() => navigate('/dashboard/buyer')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl text-lg font-black transition-all"
            >
              Return Home
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentVerify;
