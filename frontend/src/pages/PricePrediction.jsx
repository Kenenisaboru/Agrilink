import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Plant, Calendar, CheckCircle2, ChevronRight, BrainCircuit, Activity } from 'lucide-react';
import { predictPrice, getRecommendations } from '../services/aiApi';

const CROPS = ['Maize', 'Wheat', 'Teff', 'Chat', 'Coffee'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const PricePrediction = () => {
  const [activeTab, setActiveTab] = useState('predict'); // 'predict' or 'recommend'
  
  // Prediction State
  const [crop, setCrop] = useState('');
  const [month, setMonth] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  // Recommendation State
  const [userType, setUserType] = useState('farmer');
  const [recCrop, setRecCrop] = useState('');
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!crop || !month) return;
    
    setIsPredicting(true);
    try {
      const response = await predictPrice(crop, month, "East Hararghe");
      setPredictionResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    setIsRecommending(true);
    try {
      const response = await getRecommendations(userType, recCrop, "East Hararghe");
      setRecommendations(response.recommendations);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecommending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center"
          >
            <BrainCircuit className="w-10 h-10 text-green-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Smart Farming <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">Insights</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Leverage Machine Learning to predict future crop prices and receive tailored actionable advice for your operations.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-white border border-slate-200 rounded-xl max-w-md mx-auto shadow-sm">
          <button
            onClick={() => setActiveTab('predict')}
            className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'predict' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Price Prediction
          </button>
          <button
            onClick={() => setActiveTab('recommend')}
            className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'recommend' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            AI Recommendations
          </button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'predict' && (
            <motion.div
              key="predict"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <form onSubmit={handlePredict} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Crop Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Plant className="w-4 h-4 text-green-500" /> Select Crop
                    </label>
                    <div className="relative">
                      <select
                        value={crop}
                        onChange={(e) => setCrop(e.target.value)}
                        required
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                      >
                        <option value="" disabled>Choose a crop...</option>
                        {CROPS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* Month Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" /> Target Month
                    </label>
                    <div className="relative">
                      <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        required
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                      >
                        <option value="" disabled>Choose a month...</option>
                        {MONTHS.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isPredicting || !crop || !month}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-slate-900/20"
                  >
                    {isPredicting ? (
                      <Activity className="w-5 h-5 animate-pulse" />
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                    {isPredicting ? 'Analyzing ML Models...' : 'Predict Price'}
                  </button>
                </div>
              </form>

              {/* Prediction Result Display */}
              <AnimatePresence>
                {predictionResult && !isPredicting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-8 overflow-hidden"
                  >
                    <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-6 md:p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp className="w-32 h-32 text-green-900" />
                      </div>
                      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-1">
                          <p className="text-green-800 font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Prediction Complete
                          </p>
                          <h3 className="text-4xl font-black text-slate-900">
                            {predictionResult.predicted_price_etb} <span className="text-xl text-slate-500 font-medium">ETB</span>
                          </h3>
                        </div>
                        <div className="bg-white/60 backdrop-blur rounded-xl p-4 md:max-w-xs border border-white">
                          <p className="text-sm text-slate-700 leading-relaxed font-medium">
                            {predictionResult.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'recommend' && (
            <motion.div
              key="recommend"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <form onSubmit={handleRecommend} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* User Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">I am a...</label>
                    <div className="flex p-1 bg-slate-50 border border-slate-200 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setUserType('farmer')}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                          userType === 'farmer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Farmer
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('buyer')}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                          userType === 'buyer' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Buyer
                      </button>
                    </div>
                  </div>

                  {/* Optional Crop */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Specific Crop (Optional)</label>
                    <select
                      value={recCrop}
                      onChange={(e) => setRecCrop(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    >
                      <option value="">Any Crop</option>
                      {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isRecommending}
                    className={`w-full text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg ${
                      userType === 'farmer' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30'
                    }`}
                  >
                    {isRecommending ? <Activity className="w-5 h-5 animate-pulse" /> : <BrainCircuit className="w-5 h-5" />}
                    Get Tailored Advice
                  </button>
                </div>
              </form>

              {/* Recommendations Result */}
              <AnimatePresence>
                {recommendations && !isRecommending && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-8 space-y-4"
                  >
                    {recommendations.map((rec, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className={`p-5 rounded-2xl border flex gap-4 ${
                          userType === 'farmer' ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'
                        }`}
                      >
                        <div className="mt-1">
                          <CheckCircle2 className={`w-5 h-5 ${userType === 'farmer' ? 'text-blue-500' : 'text-purple-500'}`} />
                        </div>
                        <div>
                          <h4 className={`font-semibold mb-1 ${userType === 'farmer' ? 'text-blue-900' : 'text-purple-900'}`}>
                            {rec.title}
                          </h4>
                          <p className="text-slate-700 text-sm leading-relaxed">{rec.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PricePrediction;
