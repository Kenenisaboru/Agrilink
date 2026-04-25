import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/chat`;
const FLASK_AI_URL = import.meta.env.VITE_FLASK_API_URL || `${import.meta.env.VITE_API_URL}/api`;

// Enhanced AI API service with voice and matching support
class VoiceApiService {
  // Enhanced chat with voice mode and user context
  async chatWithAI(message, sessionId, voiceMode = false, userContext = {}) {
    try {
      const response = await axios.post(`${FLASK_AI_URL}/chat`, {
        message,
        session_id: sessionId,
        voice_mode: voiceMode,
        user_context: userContext
      });
      return response.data;
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw error;
    }
  }

  // Detect language from text
  async detectLanguage(text) {
    try {
      const response = await axios.post(`${FLASK_AI_URL}/voice/detect-language`, {
        text
      });
      return response.data;
    } catch (error) {
      console.error('Language Detection Error:', error);
      // Fallback to basic detection
      return {
        text,
        detected_language: this.basicLanguageDetection(text),
        language_name: this.getLanguageName(this.basicLanguageDetection(text))
      };
    }
  }

  // Find buyer-farmer matches
  async findMatches(userType, crop = null, location = 'East Hararghe', limit = 5) {
    try {
      const response = await axios.post(`${FLASK_AI_URL}/matching/find`, {
        user_type: userType,
        crop,
        location,
        limit
      });
      return response.data;
    } catch (error) {
      console.error('Matching Error:', error);
      throw error;
    }
  }

  // Get market insights
  async getMarketInsights(crop = null, location = 'East Hararghe') {
    try {
      const response = await axios.get(`${FLASK_AI_URL}/matching/insights`, {
        params: { crop, location }
      });
      return response.data;
    } catch (error) {
      console.error('Market Insights Error:', error);
      throw error;
    }
  }

  // Basic language detection fallback
  basicLanguageDetection(text) {
    // Check for Amharic characters (U+1200 to U+137F)
    if (/[\u1200-\u137F]/.test(text)) {
      return 'am';
    }
    
    // Check for common Oromo words
    const oromoWords = ['akkam', 'gabaa', 'oti', 'lafa', 'mi\'eessaa', 'beekamsa', 
                      'qonnaan', 'gurgurtaa', 'biyyoo', 'rooba', 'yeroo'];
    const lowerText = text.toLowerCase();
    if (oromoWords.some(word => lowerText.includes(word))) {
      return 'om';
    }
    
    // Default to English
    return 'en';
  }

  // Get language display name
  getLanguageName(languageCode) {
    const names = {
      'en': 'English',
      'am': 'Amharic',
      'om': 'Afaan Oromo'
    };
    return names[languageCode] || 'English';
  }

  // Analyze crop image (existing)
  async analyzeCropImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(`${FLASK_AI_URL}/vision`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Image Analysis Error:', error);
      throw error;
    }
  }

  // Get weather alert (existing)
  async getWeatherAlert(location = 'East Hararghe') {
    try {
      const response = await axios.get(`${FLASK_AI_URL}/weather/alert`, {
        params: { location }
      });
      return response.data.alert;
    } catch (error) {
      console.error('Weather Alert Error:', error);
      throw error;
    }
  }

  // Submit feedback (existing)
  async submitFeedback(feedback) {
    try {
      const response = await axios.post(`${FLASK_AI_URL}/feedback`, feedback);
      return response.data;
    } catch (error) {
      console.error('Feedback Error:', error);
      throw error;
    }
  }

  // Clear chat history (existing)
  async clearChatHistory(sessionId) {
    try {
      const response = await axios.post(`${FLASK_AI_URL}/chat/clear`, {
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Clear History Error:', error);
      throw error;
    }
  }

  // Get price prediction (existing)
  async getPricePrediction(crop, month, location = 'East Hararghe') {
    try {
      const response = await axios.post(`${FLASK_AI_URL}/predict`, {
        crop,
        month,
        location
      });
      return response.data;
    } catch (error) {
      console.error('Price Prediction Error:', error);
      throw error;
    }
  }

  // Get recommendations (existing)
  async getRecommendations(userType, crop = null, location = 'East Hararghe') {
    try {
      const response = await axios.post(`${FLASK_AI_URL}/recommend`, {
        user_type: userType,
        crop,
        location
      });
      return response.data;
    } catch (error) {
      console.error('Recommendations Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const voiceApiService = new VoiceApiService();
export default voiceApiService;
