import requests
import json
import os
import random
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

# Ethiopian seasonal weather patterns per month
SEASONAL_WEATHER = {
    'January':   {'type': 'Dry & Cool',    'urgency': 'Low',    'icon': 'sun',   'advice': 'Ideal conditions for harvesting and drying crops. Apply post-harvest storage treatments to protect stored grains.'},
    'February':  {'type': 'Dry & Warm',    'urgency': 'Low',    'icon': 'sun',   'advice': 'Water source levels are low. Irrigate water-sensitive crops. Good time for land tilling before Belg rains.'},
    'March':     {'type': 'Belg Rain Onset','urgency': 'Medium', 'icon': 'cloud', 'advice': 'First Belg rains approaching. Prepare seed beds and apply fertilizer. Watch for early fungal diseases.'},
    'April':     {'type': 'Light Rains',   'urgency': 'Medium', 'icon': 'cloud', 'advice': 'Belg rains active. Good window for planting teff and vegetables. Monitor for aphid outbreaks on young crops.'},
    'May':       {'type': 'Variable Rain', 'urgency': 'Medium', 'icon': 'cloud', 'advice': 'Sporadic rain may cause waterlogging. Ensure field drainage. Apply top-dressing fertilizer to growing crops.'},
    'June':      {'type': 'Kiremt Onset',  'urgency': 'High',   'icon': 'rain',  'advice': 'Heavy Kiremt rains beginning. Urgently complete planting. Install erosion barriers on slopes to protect topsoil.'},
    'July':      {'type': 'Heavy Rain',    'urgency': 'High',   'icon': 'rain',  'advice': '⚠️ Peak Kiremt rains. High flood risk in lowlands. Check crop drainage and monitor for stem borer and fungal blight.'},
    'August':    {'type': 'Heavy Rain',    'urgency': 'High',   'icon': 'rain',  'advice': 'Continued heavy rainfall. High humidity increases late blight risk in potatoes and tomatoes. Apply fungicides preventively.'},
    'September': {'type': 'Rain Tapering', 'urgency': 'Medium', 'icon': 'cloud', 'advice': 'Rains slowing — harvest window approaching. Prepare storage facilities and market contracts. Monitor maize for armyworm.'},
    'October':   {'type': 'Bega Onset',    'urgency': 'Low',    'icon': 'sun',   'advice': 'Main harvest season begins. Harvesting conditions are ideal. Prioritize teff and maize. Dry crops thoroughly before storage.'},
    'November':  {'type': 'Dry & Clear',   'urgency': 'Low',    'icon': 'sun',   'advice': 'Peak harvest and threshing season. Excellent drying conditions. Begin selling surplus crops while transport is easiest.'},
    'December':  {'type': 'Cold & Dry',    'urgency': 'Low',    'icon': 'sun',   'advice': 'Cold nights may affect frost-sensitive crops at altitude. Inspect stored grain for weevils and mold monthly.'},
}


def get_weather_alert(location="East Hararghe"):
    """
    Generate a seasonal weather alert with farming-specific advice.
    Uses Gemini for dynamic alerts, falls back to seasonal calendar data.
    """
    from datetime import datetime
    current_month = datetime.now().strftime('%B')
    seasonal_data = SEASONAL_WEATHER.get(current_month, {
        'type': 'Clear Skies',
        'urgency': 'Low',
        'icon': 'sun',
        'advice': 'Monitor local conditions and continue normal farming activities.'
    })

    try:
        if not GEMINI_API_KEY or GEMINI_API_KEY in ("your_api_key_here", ""):
            raise ValueError("No API key")

        prompt = f"""
Generate a practical farming weather alert for a smallholder farmer in {location}, Ethiopia for {current_month}.

Respond ONLY in this exact JSON format (no markdown, no extra text):
{{
  "type": "Weather condition name (e.g. 'Kiremt Rains', 'Dry Season', 'Belg Onset')",
  "message": "One practical sentence of farming advice specific to {location} in {current_month}. Mention crop impact.",
  "urgency": "High or Medium or Low",
  "icon": "rain or cloud or sun or alert",
  "season": "Kiremt or Bega or Belg",
  "action": "One immediate action the farmer should take today"
}}
"""
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.5, "maxOutputTokens": 200}
        }
        response = requests.post(GEMINI_URL, json=payload, timeout=8)

        if response.status_code == 200:
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            clean_text = text.strip().replace('```json', '').replace('```', '').strip()
            alert = json.loads(clean_text)
            # Validate required keys
            if 'type' in alert and 'message' in alert and 'urgency' in alert:
                return alert

    except Exception as e:
        print(f"[AgriLink Weather ERROR]: {str(e)}")

    # Return data-rich seasonal fallback
    return {
        "type": seasonal_data['type'],
        "message": seasonal_data['advice'],
        "urgency": seasonal_data['urgency'],
        "icon": seasonal_data['icon'],
        "season": "Current Season",
        "action": f"Check AgriLink market prices — {current_month} conditions directly affect crop values in {location}."
    }
