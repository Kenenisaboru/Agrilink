import requests
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

def get_recommendations(user_type, crop_interest='', location='East Hararghe'):
    try:
        # Ask Gemini to generate personalized recommendations
        prompt = f"As an agricultural advisor in Ethiopia, provide 3 short, high-impact recommendations for a {user_type} in {location} who is interested in {crop_interest if crop_interest else 'general farming'}. Return specifically in a JSON list format: [{{\"title\": \"...\", \"description\": \"...\"}}, ...]"
        
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        response = requests.post(GEMINI_URL, json=payload, timeout=5)
        
        if response.status_code == 200:
            import json
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            clean_text = text.strip().replace('```json', '').replace('```', '')
            return json.loads(clean_text)
    except:
        pass

    # Fallback to static if API fails
    return [
        {"title": "Sell Timing", "description": "Prices usually peak before the next harvest cycle."},
        {"title": "Market Access", "description": "Engage verified buyers directly on AgriLink for better margins."},
        {"title": "Logistics", "description": "Group your deliveries with others to save on transport costs."}
    ]
