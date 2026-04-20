import requests
import os
from dotenv import load_dotenv
from modules.cache import cache

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

# Language name mapping
LANGUAGE_NAMES = {
    'en': 'English',
    'am': 'Amharic',
    'om': 'Afaan Oromo',
}

TRANSLATION_PROMPT = """You are an expert agricultural translator for the Agrilink platform.
Translate the following message from {sender_language} to {receiver_language}.
Ensure that all farming terms, crop names, fertilizers, and local measurements are translated accurately.
Only return the translated text, with no extra conversational text.

Message to translate:
{message}"""


def translate_message(message: str, sender_language: str, receiver_language: str) -> dict:
    """
    Translate a chat message using the Gemini API.
    
    Args:
        message: The text to translate
        sender_language: Language code of the sender (en, am, om)
        receiver_language: Language code of the receiver (en, am, om)
    
    Returns:
        dict with translated_text, sender_language, receiver_language
    """
    if not message or not message.strip():
        return {"error": "Message is required", "translated_text": ""}

    if sender_language == receiver_language:
        return {
            "translated_text": message,
            "sender_language": sender_language,
            "receiver_language": receiver_language,
            "note": "Same language — no translation needed"
        }

    # Check cache first
    cache_key = f"translate:{sender_language}:{receiver_language}:{message[:100].lower()}"
    cached = cache.get(cache_key)
    if cached:
        return {
            "translated_text": cached,
            "sender_language": sender_language,
            "receiver_language": receiver_language,
            "cached": True
        }

    if not GEMINI_API_KEY or GEMINI_API_KEY in ("your_api_key_here", ""):
        return {
            "error": "Gemini API key not configured",
            "translated_text": message
        }

    sender_name = LANGUAGE_NAMES.get(sender_language, sender_language)
    receiver_name = LANGUAGE_NAMES.get(receiver_language, receiver_language)

    prompt = TRANSLATION_PROMPT.format(
        sender_language=sender_name,
        receiver_language=receiver_name,
        message=message
    )

    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": prompt}]}
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 500,
            "topP": 0.8
        }
    }

    try:
        response = requests.post(GEMINI_URL, json=payload, timeout=15)
        response_data = response.json()

        if "candidates" not in response_data:
            err = response_data.get('error', {}).get('message', 'Unknown API error')
            raise Exception(f"Gemini API: {err}")

        translated_text = response_data["candidates"][0]["content"]["parts"][0]["text"].strip()

        # Cache the translation for 1 hour
        cache.set(cache_key, translated_text, ttl=3600)

        return {
            "translated_text": translated_text,
            "sender_language": sender_language,
            "receiver_language": receiver_language,
            "sender_language_name": sender_name,
            "receiver_language_name": receiver_name
        }

    except requests.exceptions.Timeout:
        return {
            "error": "Translation service timed out",
            "translated_text": message
        }
    except Exception as e:
        print(f"[Translation ERROR]: {str(e)}")
        return {
            "error": str(e),
            "translated_text": message
        }
