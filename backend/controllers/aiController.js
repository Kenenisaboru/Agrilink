const { getChatbotResponse } = require('../services/ai/chatbot');
const { getPricePrediction, getRecommendations } = require('../services/ai/pricePrediction');

const chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const response = await getChatbotResponse(message);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(503).json({ error: 'AI Assistant is currently unavailable' });
    }
};

const predictPrice = async (req, res) => {
    try {
        const { crop, month, location } = req.body;
        if (!crop || !month) {
            return res.status(400).json({ error: 'Crop and month are required' });
        }
        
        const response = await getPricePrediction(crop, month, location);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(503).json({ error: 'Priceprediction service is currently unavailable' });
    }
};

const getSmartRecommendations = async (req, res) => {
    try {
        const { user_type, crop, location } = req.body;
        if (!user_type) {
            return res.status(400).json({ error: 'User type is required' });
        }
        
        const response = await getRecommendations(user_type, crop, location);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(503).json({ error: 'Recommendation service is currently unavailable' });
    }
};

module.exports = {
    chat,
    predictPrice,
    getSmartRecommendations
};
