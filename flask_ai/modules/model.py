import random
import requests
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

# Base prices in ETB per Quintal (100KG) or per Kg
base_prices = {
    'maize': 4000, 'wheat': 5500, 'teff': 9000, 'chat': 800, 'coffee': 450
}

seasonality = {
    'January': 0.9, 'February': 0.85, 'March': 0.95, 'April': 1.05, 
    'May': 1.1, 'June': 1.15, 'July': 1.2, 'August': 1.25, 
    'September': 1.2, 'October': 1.1, 'November': 1.0, 'December': 0.95
}

def predict_price(crop, month, location="East Hararghe"):
    crop = crop.lower()
    month = month.capitalize()
    
    if crop not in base_prices:
        return 0, f"Crop '{crop}' not recognized. Try Maize, Wheat, Teff, Chat, or Coffee."
    
    try:
        base = base_prices[crop]
        season_mod = seasonality.get(month, 1.0)
        prediction = base * season_mod * random.uniform(0.98, 1.02)
        
        # Use Gemini to generate a professional market explanation
        prompt = f"As an Ethiopian agricultural economist, explain why the price of {crop} in {location} during the month of {month} is predicted to be around {round(prediction, 2)} ETB. Mention seasonal factors, local rainfall patterns, and market demand in Harar/Dire Dawa. Keep it to 2-3 sentences."
        
        explanation = "Market prediction successful."
        try:
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            response = requests.post(GEMINI_URL, json=payload, timeout=5)
            if response.status_code == 200:
                explanation = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        except:
            explanation = f"Prices for {crop} are influenced by {month} seasonal supply/demand cycles in {location}."

        return round(prediction, 2), explanation
    except Exception as e:
        return 0, f"Error: {str(e)}"
