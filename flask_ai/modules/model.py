import random
import requests
import os
from dotenv import load_dotenv
from modules.cache import cache, TTL_PRICE_PREDICTION

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

# Base prices in ETB per Quintal (100kg), except Coffee & Chat which are per kg
# Updated for 2025/2026 Ethiopian market estimates
BASE_PRICES = {
    'maize':   {'price': 4200,  'unit': 'quintal', 'trend': 'seasonal'},
    'wheat':   {'price': 5600,  'unit': 'quintal', 'trend': 'stable'},
    'teff':    {'price': 9500,  'unit': 'quintal', 'trend': 'rising'},
    'chat':    {'price': 850,   'unit': 'kg',      'trend': 'volatile'},
    'coffee':  {'price': 480,   'unit': 'kg',      'trend': 'rising'},
    'sorghum': {'price': 3800,  'unit': 'quintal', 'trend': 'stable'},
    'barley':  {'price': 4800,  'unit': 'quintal', 'trend': 'seasonal'},
    'onion':   {'price': 1800,  'unit': 'quintal', 'trend': 'volatile'},
    'potato':  {'price': 2200,  'unit': 'quintal', 'trend': 'seasonal'},
}

# Monthly seasonality multipliers for Ethiopian agriculture
# Kiremt = Jun-Sep (rainy), Bega = Oct-Jan (dry/harvest), Belg = Feb-May (small rain)
SEASONALITY = {
    'January':   {'factor': 0.92, 'season': 'Bega', 'note': 'Post-harvest supply high, prices lower'},
    'February':  {'factor': 0.88, 'season': 'Bega', 'note': 'Supply still high from harvest, lowest prices'},
    'March':     {'factor': 0.93, 'season': 'Belg', 'note': 'Belg rains begin, supply stabilizing'},
    'April':     {'factor': 1.02, 'season': 'Belg', 'note': 'Stock depletion begins, prices start rising'},
    'May':       {'factor': 1.10, 'season': 'Belg', 'note': 'Pre-Kiremt supply gap, prices climbing'},
    'June':      {'factor': 1.18, 'season': 'Kiremt', 'note': 'Rainy season, low supply movement, prices high'},
    'July':      {'factor': 1.25, 'season': 'Kiremt', 'note': 'Peak Kiremt, highest prices of the year'},
    'August':    {'factor': 1.22, 'season': 'Kiremt', 'note': 'High demand, low supply continues'},
    'September': {'factor': 1.15, 'season': 'Kiremt', 'note': 'End of rains, anticipation of harvest'},
    'October':   {'factor': 1.05, 'season': 'Bega', 'note': 'Harvest beginning, prices starting to fall'},
    'November':  {'factor': 0.97, 'season': 'Bega', 'note': 'Main harvest season, supply flooding market'},
    'December':  {'factor': 0.94, 'season': 'Bega', 'note': 'Post-harvest excess supply, prices depressed'},
}

def get_price_trend(factor):
    """Return trend label and emoji based on seasonal factor."""
    if factor >= 1.10:
        return "📈 Rising", "HIGH — Good time to sell, hold back if possible"
    elif factor >= 0.99:
        return "➡️ Stable", "MEDIUM — Monitor weekly before selling"
    else:
        return "📉 Falling", "LOW — Consider holding until April-May when prices recover"

def predict_price(crop, month, location="East Hararghe"):
    """Predict crop price with trend analysis and actionable sell/buy advice."""
    crop = crop.lower().strip()
    month = month.capitalize().strip()

    # ── Cache check — serve instantly if already computed ─────────────────
    cache_key = f"predict:{crop}:{month}:{location.lower()}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    if crop not in BASE_PRICES:
        supported = ', '.join([c.capitalize() for c in BASE_PRICES.keys()])
        return 0, f"⚠️ Crop '{crop}' not recognized. Supported crops: {supported}"

    crop_data = BASE_PRICES[crop]
    season_data = SEASONALITY.get(month, {'factor': 1.0, 'season': 'Unknown', 'note': 'Seasonal data unavailable'})

    # Apply seasonal factor with slight market variation (±2%)
    factor = season_data['factor']
    variation = random.uniform(-0.02, 0.02)
    predicted_price = round(crop_data['price'] * (factor + variation), 2)

    trend_label, market_signal = get_price_trend(factor)
    unit = crop_data['unit']
    season_name = season_data['season']
    season_note = season_data['note']

    # Try to get AI-generated explanation
    explanation = None
    try:
        if GEMINI_API_KEY and GEMINI_API_KEY not in ("your_api_key_here", ""):
            prompt = (
                f"As an Ethiopian agricultural market analyst, write a concise 2-sentence explanation for why "
                f"the price of {crop} in {location} during {month} ({season_name} season) is predicted at "
                f"{predicted_price} ETB per {unit}. Mention the season ({season_note}), local demand in "
                f"Harar/Dire Dawa, and whether farmers should sell now or wait. Be specific and practical."
            )
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.6, "maxOutputTokens": 200}
            }
            response = requests.post(GEMINI_URL, json=payload, timeout=8)
            if response.status_code == 200:
                explanation = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        pass

    # Fallback explanation if API unavailable
    if not explanation:
        explanation = (
            f"During {month} ({season_name} season), {season_note.lower()}. "
            f"Market signal is **{market_signal}**. "
            f"In {location}, {crop} typically trades at {predicted_price} ETB per {unit}."
        )

    # Build full structured response
    full_explanation = (
        f"{trend_label} | {season_name} Season\n\n"
        f"{explanation}\n\n"
        f"📊 **Market Signal:** {market_signal}"
    )

    # ── Cache result for 30 minutes ──────────────────────────────────────
    cache.set(cache_key, (predicted_price, full_explanation), ttl=TTL_PRICE_PREDICTION)

    return predicted_price, full_explanation
