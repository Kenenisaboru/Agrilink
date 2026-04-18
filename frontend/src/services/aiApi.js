import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const chatWithAI = async (message) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, { message });
    return response.data;
  } catch (error) {
    console.error("AI Chat Error:", error);
    throw error;
  }
};

export const predictPrice = async (crop, month, location) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict`, { crop, month, location });
    return response.data;
  } catch (error) {
    console.error("AI Prediction Error:", error);
    throw error;
  }
};

export const getRecommendations = async (userType, crop, location) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/recommend`, { user_type: userType, crop, location });
    return response.data;
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    throw error;
  }
};

export const analyzeCropImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await axios.post(`${API_BASE_URL}/vision`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error("AI Vision Error:", error);
    throw error;
  }
};

export const getWeatherAlert = async (location = 'East Hararghe') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather/alert`, { params: { location } });
    return response.data;
  } catch (error) {
    console.error("Weather Alert Error:", error);
    throw error;
  }
};
