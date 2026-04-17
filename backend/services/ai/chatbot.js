const axios = require('axios');

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5001/api';

/**
 * Communicates with the Flask AI Backend to get chat responses.
 * @param {string} message - The message from the farmer/buyer.
 * @returns {Promise<Object>} - Format: { response: "...", detected_language: "en" }
 */
const getChatbotResponse = async (message) => {
    try {
        const response = await axios.post(`${FLASK_API_URL}/chat`, { message });
        return response.data;
    } catch (error) {
        console.error('Error connecting to Flask AI Chatbot endpoint:', error.message);
        throw new Error('AI Assistant is currently unavailable. Please try again later.');
    }
};

module.exports = {
    getChatbotResponse
};
