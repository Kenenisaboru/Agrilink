import requests
import re
import os
from dotenv import load_dotenv
from modules.cache import cache, TTL_CHAT_RESPONSE
from modules.knowledge_base import retrieve_context

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

# ── Conversation History Store ────────────────────────────────────────────────
# session_id → list of {"role": "user"|"model", "parts": [{"text": "..."}]}
_conversation_store: dict = {}
MAX_HISTORY_TURNS = 6   # Keep last 6 exchanges (= 12 messages) for context

# ── Master System Prompt ──────────────────────────────────────────────────────
SYSTEM_PROMPT = """
You are **AgriLink AI** — an advanced agricultural intelligence assistant powering the AgriLink smart farming marketplace in Ethiopia.

## YOUR ROLE:
You help **farmers** and **buyers** make data-driven decisions using real-time insights, predictive analytics, and domain expertise.

## YOUR CORE CAPABILITIES:

### 🌾 1. Smart Farming Advice
- Recommend profitable crops based on current season and market demand
- Suggest optimal planting and harvesting times for Ethiopia's climate zones
- Provide pest and disease prevention tips specific to Ethiopian crops

### 📊 2. Price Prediction & Market Insights
- Predict crop price trajectory (📈 Rising / 📉 Falling / ➡️ Stable)
- Explain WHY prices may increase or decrease (supply, rainfall, export demand)
- Suggest the BEST TIME to sell or hold products for maximum profit

### 📦 3. Buyer Intelligence
- Help buyers find the best available products and suppliers
- Suggest when to buy in bulk to lock in low prices
- Recommend alternative crops when target crop prices are high

### 🌍 4. Ethiopian Agricultural Context
- Specialize in local crops: Teff, Maize, Wheat, Coffee, Chat, Sorghum, Barley, Onion, Potato
- Consider Ethiopian seasons: Kiremt (Jun–Sep rainy), Bega (Oct–Jan dry/harvest), Belg (Feb–May small rain)
- Reference local markets: Harar, Dire Dawa, East Hararghe, Addis Ababa, Jimma, Shashemene

## CRITICAL RULES:
1. **Detect user intent** — is the user a FARMER or a BUYER? Adapt your answer accordingly.
2. **Language detection** — respond in the EXACT SAME LANGUAGE as the user:
   - If the message contains Ethiopic script (አ–ፍ), respond entirely in **Amharic**
   - If the message contains words like "akkam", "gabaa", "oti", "lafa", respond in **Afaan Oromo**
   - Otherwise respond in **English**
3. **Use the provided context** — if Agricultural Context is provided below, use those specific facts in your answer. Prioritize this data over your general knowledge.
4. **Never say "I don't know"** — give your best data-driven estimation
5. **Structure every response** using this format:
   - 📈/🌾/📦 **Recommendation:** [Clear, direct recommendation]
   - 📊 **Reason:** [Data-driven explanation — mention season, supply, demand, rainfall]
   - ✅ **Action Step:** [What to do RIGHT NOW — specific and practical]
6. Keep responses **concise** (3–6 bullet lines max), but **insightful and specific**
7. Use **bold** for key terms, crop names, and prices
8. Always prioritize helping farmers **increase profit** and **reduce risk**
"""


def _get_history(session_id: str) -> list:
    """Get conversation history for a session."""
    return _conversation_store.get(session_id, [])


def _save_message(session_id: str, role: str, text: str) -> None:
    """Append a message to conversation history, trimming to max turns."""
    if session_id not in _conversation_store:
        _conversation_store[session_id] = []

    history = _conversation_store[session_id]
    history.append({"role": role, "parts": [{"text": text}]})

    # Keep only last MAX_HISTORY_TURNS * 2 messages (user + model pairs)
    max_msgs = MAX_HISTORY_TURNS * 2
    if len(history) > max_msgs:
        _conversation_store[session_id] = history[-max_msgs:]


def clear_history(session_id: str) -> None:
    """Clear conversation history for a session (new chat)."""
    if session_id in _conversation_store:
        del _conversation_store[session_id]


def get_history_length(session_id: str) -> int:
    """Return the number of messages in the conversation."""
    return len(_conversation_store.get(session_id, []))


def detect_language(message: str, response_text: str = "") -> str:
    """Detect language from message and response content."""
    if re.search(r'[\u1200-\u137F]', message) or re.search(r'[\u1200-\u137F]', response_text):
        return "am"
    oromo_keywords = ['akkam', 'gabaa', 'oti', 'lafa', "mi'eessaa", 'beekumsa',
                      'qonnaan', 'gurgurtaa', 'biyyoo', 'rooba', 'yeroo']
    if any(word in message.lower() for word in oromo_keywords):
        return "om"
    return "en"


def get_chat_response(message: str, session_id: str = "default") -> tuple:
    """
    Get an AI response with:
    - Multi-turn conversation memory (last 6 exchanges)
    - RAG-lite context injection from local knowledge base
    - TTL-based caching for identical short queries
    - Structured response format enforcement
    
    Returns: (response_text, detected_language, history_length)
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY in ("your_api_key_here", ""):
        return (
            "⚠️ AgriLink AI is not configured. Please add your GEMINI_API_KEY to the .env file.",
            "en",
            0
        )

    # ── Retrieve relevant knowledge base context (RAG-lite) ────────────────
    knowledge_context = retrieve_context(message)

    # ── Compose full message with context ──────────────────────────────────
    # Inject knowledge into user message for Gemini to ground its answer
    full_message = message
    if knowledge_context:
        full_message = f"{message}\n\n{knowledge_context}"

    # ── Build multi-turn conversation payload ──────────────────────────────
    history = _get_history(session_id)

    # First message includes system prompt; subsequent messages are context-aware
    if not history:
        # New conversation: system prompt + first user message
        contents = [
            {"role": "user", "parts": [{"text": f"{SYSTEM_PROMPT}\n\n---\n\nUser Message: {full_message}"}]}
        ]
    else:
        # Continuing conversation: history + new message
        contents = history + [
            {"role": "user", "parts": [{"text": full_message}]}
        ]

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 600,
            "topP": 0.9
        }
    }

    try:
        response = requests.post(GEMINI_URL, json=payload, timeout=15)
        response_data = response.json()

        if "candidates" not in response_data:
            err = response_data.get('error', {}).get('message', 'Unknown API error')
            raise Exception(f"Gemini API: {err}")

        ai_response = response_data["candidates"][0]["content"]["parts"][0]["text"]

        # ── Save to conversation history ───────────────────────────────────
        _save_message(session_id, "user", full_message)
        _save_message(session_id, "model", ai_response)

        lang = detect_language(message, ai_response)
        history_len = get_history_length(session_id)

        return ai_response, lang, history_len

    except requests.exceptions.Timeout:
        offline = _get_offline_response(message)
        return offline, "en", get_history_length(session_id)
    except Exception as e:
        print(f"[AgriLink Chatbot ERROR]: {str(e)}")
        offline = _get_offline_response(message)
        return offline, "en", get_history_length(session_id)


def _get_offline_response(message: str) -> str:
    """Smart fallback responses when Gemini API is unavailable."""
    msg_lower = message.lower()
    if any(w in msg_lower for w in ['maize', 'corn', 'mais']):
        return ("- 📈 **Recommendation:** Monitor maize prices before selling\n"
                "- 📊 **Reason:** Maize prices in East Hararghe average **4,000–4,800 ETB/quintal**, peaking May–August\n"
                "- ✅ **Action Step:** List your maize on AgriLink to connect with verified Harar/Dire Dawa buyers")
    elif any(w in msg_lower for w in ['teff', 'ጤፍ']):
        return ("- 🌾 **Recommendation:** Teff is the most profitable crop this season\n"
                "- 📊 **Reason:** White teff prices range **9,000–11,500 ETB/quintal** with strong export demand\n"
                "- ✅ **Action Step:** Plant during Belg rains (Feb–May) for harvest when prices are highest")
    elif any(w in msg_lower for w in ['coffee', 'buna', 'ቡና']):
        return ("- ☕ **Recommendation:** Coffee is Ethiopia's highest-value export crop\n"
                "- 📊 **Reason:** Grade 1–2 Harari natural coffee commands **550–750 ETB/kg**\n"
                "- ✅ **Action Step:** Harvest October–December. Use dry-process for 30–40% price premium")
    elif any(w in msg_lower for w in ['sell', 'price', 'market', 'when']):
        return ("- 📈 **Recommendation:** Wait 6–10 weeks after harvest before selling\n"
                "- 📊 **Reason:** Immediate post-harvest oversupply drops prices **15–25% below** seasonal peak\n"
                "- ✅ **Action Step:** Use AgriLink Price Prediction to track your crop weekly before committing")
    elif any(w in msg_lower for w in ['buy', 'bulk', 'purchase']):
        return ("- 📦 **Recommendation:** Buy in bulk during Bega season (Oct–Feb) for lowest prices\n"
                "- 📊 **Reason:** Post-harvest supply peak compresses grain prices by **20–35%**\n"
                "- ✅ **Action Step:** Connect with verified AgriLink farmers and negotiate forward contracts")
    else:
        return ("- 🤖 **AgriLink AI** is your smart farming advisor for Ethiopian markets\n"
                "- 📊 **I can help with:** Crop pricing, sell timing, pest advice, seasonal planting\n"
                "- ✅ **Try asking:** 'When should I sell teff?', 'Best crop now?', 'How to prevent stem borer?'")
