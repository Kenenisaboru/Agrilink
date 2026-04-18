import requests
import os
import re
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

def get_chat_response(message):
    try:
        if not GEMINI_API_KEY or GEMINI_API_KEY == "your_api_key_here":
            return "Please configure your GEMINI_API_KEY in the .env file to enable the smart assistant.", "en"

        system_prompt = """
        You are 'AgriLink AI', a professional agricultural consultant specialized in East Ethiopian farming.
        Your goal is to help farmers and buyers with:
        1. Crop pricing and market trends (specifically for Teff, Wheat, Maize, Chat, Coffee).
        2. Technical advice on planting, pests, and harvesting.
        3. Local advice for Harar, Dire Dawa, and East Hararghe regions.
        
        Rules:
        - Respond in the SAME LANGUAGE as the user (English, Amharic, or Afaan Oromo).
        - Keep responses concise, helpful, and professional.
        - Use bold text for key terms.
        """

        payload = {
            "contents": [{
                "parts": [
                    {"text": f"{system_prompt}\n\nUser Question: {message}"}
                ]
            }]
        }

        response = requests.post(GEMINI_URL, json=payload)
        response_data = response.json()
        
        if "candidates" not in response_data:
            raise Exception("API Error")

        ai_response = response_data["candidates"][0]["content"]["parts"][0]["text"]
        
        # Simple language detection for the UI
        lang = "en"
        if re.search(r'[\u1200-\u137F]', ai_response):
            lang = "am"
        elif any(word in message.lower() for word in ['akkam', 'gabaa', 'oti']):
            lang = "om"

        return ai_response, lang

    except Exception as e:
        print(f"DEBUG CHATBOT ERROR: {str(e)}")
        return "I am currently performing some maintenance on my knowledge base. Please try again in a moment.", "en"
