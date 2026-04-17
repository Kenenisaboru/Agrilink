const axios = require('axios');

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5001/api';

/**
 * Validates and requests a price prediction from the Flask backend.
 */
const getPricePrediction = async (crop, month, location = "East Hararghe") => {
    try {
        const response = await axios.post(`${FLASK_API_URL}/predict`, { crop, month, location });
        return response.data;
    } catch (error) {
        console.error('Error connecting to Flask AI Prediction endpoint:', error.message);
        throw new Error('Price prediction service is currently unavailable.');
    }
};

/**
 * Fetches AI recommendations based on user role from Flask.
 */
const getRecommendations = async (userType, crop = '', location = "East Hararghe") => {
    try {
        const response = await axios.post(`${FLASK_API_URL}/recommend`, { user_type: userType, crop, location });
        return response.data;
    } catch (error) {
        console.error('Error connecting to Flask AI Recommendation endpoint:', error.message);
        throw new Error('Recommendation service is currently unavailable.');
    }
};

module.exports = {
    getPricePrediction,
    getRecommendations
};
