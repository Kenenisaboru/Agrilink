import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, X, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createPriceAlert, getUserAlerts, checkAlerts, dismissAlert } from '../../services/aiApi';

const CROPS = ['Maize', 'Wheat', 'Teff', 'Chat', 'Coffee', 'Sorghum', 'Barley', 'Onion', 'Potato'];

const PriceAlertPanel = ({ userId, isOpen, onClose }) => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    crop: '', targetPrice: '', condition: 'above', location: 'East Hararghe'
  });
  const [formError, setFormError] = useState('');

  // Load and check alerts on open
  useEffect(() => {
    if (isOpen && userId) {
      loadAlerts();
    }
  }, [isOpen, userId]);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const checked = await checkAlerts(userId);
      setAlerts(checked.alerts || []);
    } catch {
      try {
        const data = await getUserAlerts(userId);
        setAlerts(data.alerts || []);
      } catch (e) {
        console.error('Failed to load alerts:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.crop || !form.targetPrice) {
      setFormError('Please select a crop and enter a target price.');
      return;
    }
    setIsCreating(true);
    try {
      const result = await createPriceAlert({
        userId,
        crop: form.crop,
        targetPrice: parseFloat(form.targetPrice),
        condition: form.condition,
        location: form.location
      });
      if (result.error) { setFormError(result.error); return; }
      setForm({ crop: '', targetPrice: '', condition: 'above', location: 'East Hararghe' });
      setShowForm(false);
      await loadAlerts();
    } catch (e) {
      setFormError('Failed to create alert. Is the Flask server running?');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      await dismissAlert(alertId, userId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (e) {
      console.error('Dismiss failed:', e);
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'triggered') return 'bg-green-500/20 border-green-400/40 text-green-300';
    return 'bg-white/5 border-white/10 text-slate-300';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.25 }}
          className="fixed right-4 top-20 z-50 w-80 bg-[#0d1a2e]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-amber-900/30 to-orange-900/20">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-white font-semibold text-sm">Price Alerts</span>
              {alerts.filter(a => a.status === 'triggered').length > 0 && (
                <span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                  {alerts.filter(a => a.status === 'triggered').length} triggered
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowForm(!showForm)}
                className="p-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition"
                title="Create new alert"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-1 hover:bg-white/10 text-slate-400 rounded-lg transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {/* Create Alert Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleCreate} className="p-4 space-y-3 border-b border-white/10 bg-white/3">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">New Price Alert</p>

                    <select
                      value={form.crop}
                      onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
                      className="w-full bg-white/5 border border-white/15 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="">Select crop...</option>
                      {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <div className="flex gap-2">
                      <select
                        value={form.condition}
                        onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                        className="bg-white/5 border border-white/15 text-white text-sm rounded-lg py-2 px-2 focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="above">📈 Above</option>
                        <option value="below">📉 Below</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Target ETB..."
                        value={form.targetPrice}
                        onChange={e => setForm(f => ({ ...f, targetPrice: e.target.value }))}
                        className="flex-1 bg-white/5 border border-white/15 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-amber-500/50 placeholder-slate-500"
                      />
                    </div>

                    {formError && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isCreating}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                      {isCreating ? 'Creating...' : 'Set Alert'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Alert List */}
            <div className="p-3 space-y-2">
              {isLoading && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                </div>
              )}

              {!isLoading && alerts.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No active alerts</p>
                  <p className="text-slate-600 text-xs mt-1">Click + to set a price target</p>
                </div>
              )}

              {alerts.map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border p-3 relative ${getStatusStyle(alert.status)}`}
                >
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="absolute top-2 right-2 p-0.5 hover:bg-white/10 rounded-full transition"
                  >
                    <X className="w-3 h-3 text-slate-500" />
                  </button>

                  <div className="flex items-start gap-2 pr-4">
                    <div className="mt-0.5">
                      {alert.status === 'triggered'
                        ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                        : <Clock className="w-4 h-4 text-amber-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-sm">{alert.crop}</span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          alert.status === 'triggered'
                            ? 'bg-green-500/30 text-green-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {alert.condition === 'above' ? '📈' : '📉'} Notify when {alert.condition}{' '}
                        <span className="font-semibold text-white">{alert.target_price?.toLocaleString()} ETB</span>
                      </p>
                      {alert.current_price && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Current: <span className="text-slate-300 font-medium">{alert.current_price?.toLocaleString()} ETB</span>
                          {alert.gap_etb !== undefined && alert.gap_etb !== 0 && (
                            <span className={`ml-1 ${alert.gap_etb > 0 ? 'text-red-400' : 'text-green-400'}`}>
                              ({alert.gap_etb > 0 ? `${alert.gap_etb.toLocaleString()} to go` : '✓ Target met'})
                            </span>
                          )}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-600 mt-1">{alert.created_at}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          {alerts.length > 0 && (
            <div className="px-3 pb-3">
              <button
                onClick={loadAlerts}
                disabled={isLoading}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition"
              >
                {isLoading ? '⟳ Checking prices...' : '↻ Refresh prices'}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PriceAlertPanel;
