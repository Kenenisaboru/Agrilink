import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_FLASK_API_URL || 'http://192.168.137.160:5001/api';

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const chatWithAI = async (message, sessionId = 'default') => {
  const response = await axios.post(`${API_BASE_URL}/chat`, { message, session_id: sessionId });
  return response.data;
};

export const clearChatHistory = async (sessionId) => {
  const response = await axios.post(`${API_BASE_URL}/chat/clear`, { session_id: sessionId });
  return response.data;
};

// ─── Price Prediction ─────────────────────────────────────────────────────────
export const predictPrice = async (crop, month, location = 'East Hararghe') => {
  const response = await axios.post(`${API_BASE_URL}/predict`, { crop, month, location });
  return response.data;
};

// ─── Recommendations ──────────────────────────────────────────────────────────
export const getRecommendations = async (userType, crop = '', location = 'East Hararghe') => {
  const response = await axios.post(`${API_BASE_URL}/recommend`, {
    user_type: userType, crop, location
  });
  return response.data;
};

// ─── Vision Crop Diagnosis ────────────────────────────────────────────────────
export const analyzeCropImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await axios.post(`${API_BASE_URL}/vision`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// ─── Weather Alert ────────────────────────────────────────────────────────────
export const getWeatherAlert = async (location = 'East Hararghe') => {
  const response = await axios.get(`${API_BASE_URL}/weather/alert`, { params: { location } });
  return response.data;
};

// ─── Feedback (👍 / 👎) ───────────────────────────────────────────────────────
export const submitFeedback = async ({ sessionId, rating, message, responseSnippet }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/feedback`, {
      session_id: sessionId,
      rating,                          // "positive" | "negative"
      message,
      response_snippet: responseSnippet
    });
    return response.data;
  } catch (error) {
    console.error('Feedback submission failed:', error.message);
    return null;
  }
};

// ─── Price Alerts ─────────────────────────────────────────────────────────────
export const createPriceAlert = async ({ userId, crop, targetPrice, condition, location }) => {
  const response = await axios.post(`${API_BASE_URL}/alerts`, {
    user_id: userId,
    crop,
    target_price: targetPrice,
    condition,                        // "above" | "below"
    location
  });
  return response.data;
};

export const getUserAlerts = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/alerts`, { params: { user_id: userId } });
  return response.data;
};

export const checkAlerts = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/alerts/check`, { params: { user_id: userId } });
  return response.data;
};

export const dismissAlert = async (alertId, userId) => {
  const response = await axios.delete(`${API_BASE_URL}/alerts/${alertId}`, {
    data: { user_id: userId }
  });
  return response.data;
};

// ─── Health Check ─────────────────────────────────────────────────────────────
export const getAIHealth = async () => {
  const response = await axios.get(`${API_BASE_URL}/health`);
  return response.data;
};
