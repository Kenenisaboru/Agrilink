import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

# ─── Static fallbacks by user type and crop ────────────────────────────────────

FARMER_DEFAULTS = [
    {
        "icon": "📈",
        "title": "Optimal Sell Window",
        "description": "Prices for most Ethiopian staple crops peak 4–6 weeks after harvest when initial oversupply clears. Avoid selling immediately post-harvest when prices are 15–25% below seasonal highs."
    },
    {
        "icon": "🌾",
        "title": "Top Crop This Season: Teff",
        "description": "Teff demand is consistently high with prices at 9,000–10,500 ETB/quintal. Export demand makes it Ethiopia's most valuable staple. Plant during Belg rains for best results."
    },
    {
        "icon": "🐛",
        "title": "Pest Alert: Stem Borer Season",
        "description": "Monitor maize and sorghum fields for stem borer during Kiremt rains. Early detection saves up to 40% of yield. Apply neem-based solutions or consult your local agro-input store."
    },
]

BUYER_DEFAULTS = [
    {
        "icon": "📦",
        "title": "Best Bulk Buying Window",
        "description": "October–February (Bega harvest season) offers the lowest grain prices of the year. Stock up on Maize, Wheat, and Teff when post-harvest supply is high."
    },
    {
        "icon": "🔄",
        "title": "Alternative to High-Price Crops",
        "description": "When Teff prices are elevated, consider Sorghum or Barley as cost-effective substitutes. Sorghum trades at 3,800 ETB/quintal — 60% cheaper than Teff."
    },
    {
        "icon": "🤝",
        "title": "Negotiate Forward Contracts",
        "description": "Connect with verified farmers on AgriLink before peak season to lock in guaranteed supply at pre-agreed prices. Forward contracts reduce your price risk by 20–30%."
    },
]

CROP_SPECIFIC = {
    'teff': {
        'farmer': [
            {"icon": "🌾", "title": "Teff Planting Window", "description": "Plant teff mid-June to mid-July for a September harvest. Avoid waterlogged soils — teff drowns in standing water. Use 15–20 kg/ha seed rate."},
            {"icon": "📈", "title": "Teff Price Peak", "description": "Teff prices peak June–August (9,500–11,000 ETB/quintal) when stocks are lowest. Store your harvest and sell during this window for maximum returns."},
            {"icon": "🧪", "title": "Soil Preparation", "description": "Teff thrives in well-drained vertisols and loamy soils. Apply DAP fertilizer at 100 kg/ha at planting for optimal yield of 15–20 quintals/ha."},
        ],
        'buyer': [
            {"icon": "📦", "title": "Buy Teff October–December", "description": "Post-harvest Teff prices dip to 8,500–9,000 ETB/quintal. This is your best window to stock up before May–August price spikes."},
            {"icon": "🔄", "title": "Teff Alternatives", "description": "Barley (4,800 ETB/q) and Sorghum (3,800 ETB/q) provide good nutritional substitutes when Teff prices are above 10,000 ETB/quintal."},
            {"icon": "🤝", "title": "Source from East Hararghe", "description": "East Hararghe and Arsi zones are top teff-producing regions. Direct sourcing from AgriLink farmers in these areas cuts intermediary costs by 15–20%."},
        ]
    },
    'maize': {
        'farmer': [
            {"icon": "🌽", "title": "Maize Planting Time", "description": "Plant maize with the first Kiremt rains (June) in East Hararghe. Use hybrid varieties (BH540, BHQPY545) for 30–50% higher yields. Space 75×25 cm."},
            {"icon": "📈", "title": "Best Maize Selling Window", "description": "Maize prices peak June–August (4,500–5,000 ETB/quintal). Sell before the October harvest when new-season supply floods the market."},
            {"icon": "🐛", "title": "Fall Armyworm Alert", "description": "Monitor maize from 3-week stage for fall armyworm. Early spray with emamectin benzoate prevents 30–50% yield loss. Check leaves weekly."},
        ],
        'buyer': [
            {"icon": "📦", "title": "Buy Maize November–February", "description": "Maize prices hit lows of 3,700–4,200 ETB/quintal post-harvest. Buy in bulk during this window for 15–25% savings."},
            {"icon": "🔄", "title": "Sorghum as Alternative", "description": "Sorghum is 10–15% cheaper than maize with similar caloric value. Consider it for bulk animal feed or food processing needs."},
            {"icon": "🌍", "title": "East Hararghe Suppliers", "description": "West Hararghe and Bale zones are top maize producers. Use AgriLink to connect directly with certified farmers for bulk supply."},
        ]
    },
    'coffee': {
        'farmer': [
            {"icon": "☕", "title": "Coffee Harvest Window", "description": "Harvest Harari/Jimma coffee October–January when cherries turn deep red. Selective picking yields 20–30% better prices than strip harvesting."},
            {"icon": "📈", "title": "Coffee Export Premium", "description": "Sun-dried (natural process) specialty coffee commands 600–800 ETB/kg vs 400–450 ETB for wet-washed. Invest in proper drying beds for premium pricing."},
            {"icon": "🌿", "title": "Shade Growing Advantage", "description": "Shade-grown coffee in East Hararghe forests produces premium beans. Shade-growing certification can increase export prices by 25–40%."},
        ],
        'buyer': [
            {"icon": "📦", "title": "Buy Coffee December–February", "description": "Post-harvest coffee prices dip to 420–460 ETB/kg. Stock aromatic Harari varietals before April when export demand drives prices up."},
            {"icon": "🤝", "title": "Source Certified Coffee", "description": "Harari, Yirgacheffe, and Sidama certified coffee commands 30–50% premium in export markets. AgriLink connects you with certified Farmer Cooperative Unions."},
            {"icon": "🔄", "title": "Grade for Price Optimization", "description": "Grade 1–2 export-quality coffee fetches 550–700 ETB/kg. Grade 3–5 domestic coffee trades at 350–420 ETB/kg. Know your grade before buying."},
        ]
    }
}


def get_recommendations(user_type, crop_interest='', location='East Hararghe'):
    """
    Generate personalized, actionable AI recommendations for farmers or buyers.
    Falls back to rich static recommendations if Gemini API is unavailable.
    """
    user_type = (user_type or 'farmer').lower()
    crop_key = (crop_interest or '').lower().strip()

    # Check for crop-specific static recommendations first
    if crop_key in CROP_SPECIFIC:
        role_key = 'buyer' if user_type == 'buyer' else 'farmer'
        static_fallback = CROP_SPECIFIC[crop_key][role_key]
    else:
        static_fallback = BUYER_DEFAULTS if user_type == 'buyer' else FARMER_DEFAULTS

    try:
        if not GEMINI_API_KEY or GEMINI_API_KEY in ("your_api_key_here", ""):
            return static_fallback

        crop_context = f"with a focus on {crop_interest}" if crop_interest else "for general farming operations"

        buyer_farmer_context = (
            "a crop buyer who wants to optimize purchasing timing, find quality suppliers, "
            "and reduce procurement costs" if user_type == 'buyer'
            else
            "a farmer who wants to increase crop yield, sell at the best price, "
            "and reduce pest/disease risk"
        )

        prompt = f"""
You are AgriLink AI, an agricultural intelligence expert for Ethiopia.

Generate exactly 3 highly specific, actionable recommendations for {buyer_farmer_context},
located in {location}, {crop_context}.

Each recommendation must follow this JSON format:
[
  {{
    "icon": "emoji",
    "title": "Short title (4-6 words)",
    "description": "2-3 sentences of practical, data-driven advice. Include specific ETB prices, percentages, timeframes, or Ethiopian seasonal references (Kiremt/Bega/Belg) where relevant."
  }}
]

Rules:
- For FARMERS: focus on sell timing, planting windows, pest prevention, yield improvement
- For BUYERS: focus on buy timing, bulk purchasing, alternative crops, supplier sourcing
- Use specific Ethiopian crops: Teff, Maize, Wheat, Coffee, Chat, Sorghum, Barley
- Reference local markets: Harar, Dire Dawa, East Hararghe, Addis when possible
- Return ONLY valid JSON array, no markdown, no extra text
"""
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.65, "maxOutputTokens": 500}
        }
        response = requests.post(GEMINI_URL, json=payload, timeout=10)

        if response.status_code == 200:
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            clean_text = text.strip().replace('```json', '').replace('```', '').strip()
            parsed = json.loads(clean_text)
            # Validate structure
            if isinstance(parsed, list) and len(parsed) >= 1 and 'title' in parsed[0]:
                return parsed

    except Exception as e:
        print(f"[AgriLink Recommendation ERROR]: {str(e)}")

    return static_fallback
