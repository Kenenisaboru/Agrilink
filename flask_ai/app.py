import json
import os
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from modules.chatbot import get_chat_response, clear_history, get_history_length, detect_language
from modules.model import predict_price
from modules.recommendation import get_recommendations
from modules.vision import analyze_crop_image
from modules.weather import get_weather_alert
from modules.alerts import create_alert, check_alerts, dismiss_alert, get_user_alerts
from modules.matching import find_best_matches, get_market_insights, generate_connection_suggestion
from modules.cache import cache, TTL_CHAT_RESPONSE
from modules.translate import translate_message

app = Flask(__name__)
CORS(app)

# ── Feedback log (in-memory; extend to DB in production) ─────────────────────
_feedback_log: list = []

# ─────────────────────────────────────────────────────────────────────────────
# CHAT ENDPOINT — with conversation memory & RAG-lite
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400

    user_message = data['message']
    session_id = data.get('session_id', 'default')
    voice_mode = data.get('voice_mode', False)
    user_context = data.get('user_context', {})

    # get_chat_response now returns (text, language, history_length, metadata)
    response_text, language, history_len, metadata = get_chat_response(
        user_message, session_id, voice_mode, user_context
    )

    return jsonify({
        'response': response_text,
        'detected_language': language,
        'session_id': session_id,
        'conversation_turn': history_len // 2,   # number of full exchanges
        'metadata': metadata
    })


# ─────────────────────────────────────────────────────────────────────────────
# CLEAR CHAT HISTORY (start fresh conversation)
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/chat/clear', methods=['POST'])
def clear_chat():
    data = request.json or {}
    session_id = data.get('session_id', 'default')
    clear_history(session_id)
    return jsonify({'success': True, 'message': 'Conversation history cleared.'})


# ─────────────────────────────────────────────────────────────────────────────
# PRICE PREDICTION — with TTL caching
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/predict', methods=['POST'])
def predict_endpoint():
    data = request.json
    if not data or 'crop' not in data or 'month' not in data:
        return jsonify({'error': 'Crop and month are required'}), 400

    crop = data['crop']
    month = data['month']
    location = data.get('location', 'East Hararghe')

    prediction, explanation = predict_price(crop, month, location)

    return jsonify({
        'crop': crop,
        'month': month,
        'predicted_price_etb': prediction,
        'explanation': explanation,
        'location': location,
        'cached': cache.get(f"predict:{crop.lower()}:{month.capitalize()}:{location.lower()}") is not None
    })


# ─────────────────────────────────────────────────────────────────────────────
# RECOMMENDATIONS
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/recommend', methods=['POST'])
def recommend_endpoint():
    data = request.json
    if not data or 'user_type' not in data:
        return jsonify({'error': 'user_type (farmer/buyer) is required'}), 400

    user_type = data['user_type']
    crop = data.get('crop', '')
    location = data.get('location', 'East Hararghe')

    recommendations = get_recommendations(user_type, crop, location)
    return jsonify({'recommendations': recommendations})


# ─────────────────────────────────────────────────────────────────────────────
# CROP VISION DIAGNOSIS
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/vision', methods=['POST'])
def vision_endpoint():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    file = request.files['image']
    result = analyze_crop_image(file)
    return jsonify(result)


# ─────────────────────────────────────────────────────────────────────────────
# WEATHER ALERT
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/weather/alert', methods=['GET'])
def weather_alert_endpoint():
    location = request.args.get('location', 'East Hararghe')
    alert = get_weather_alert(location)
    return jsonify({"alert": alert})


# ─────────────────────────────────────────────────────────────────────────────
# BUYER-FARMER MATCHING
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/matching/find', methods=['POST'])
def matching_endpoint():
    data = request.json
    if not data or 'user_type' not in data:
        return jsonify({'error': 'user_type (farmer/buyer) is required'}), 400

    user_type = data['user_type']
    crop = data.get('crop')
    location = data.get('location', 'East Hararghe')
    limit = data.get('limit', 5)

    matches = find_best_matches(user_type, crop, location, limit)
    return jsonify({
        'matches': matches,
        'user_type': user_type,
        'crop': crop,
        'location': location
    })


@app.route('/api/matching/insights', methods=['GET'])
def market_insights_endpoint():
    crop = request.args.get('crop')
    location = request.args.get('location', 'East Hararghe')
    
    insights = get_market_insights(crop, location)
    return jsonify(insights)


# ─────────────────────────────────────────────────────────────────────────────
# VOICE LANGUAGE DETECTION
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/voice/detect-language', methods=['POST'])
def detect_language_endpoint():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required'}), 400

    text = data['text']
    detected_lang = detect_language(text)
    
    return jsonify({
        'text': text,
        'detected_language': detected_lang,
        'language_name': {
            'en': 'English',
            'am': 'Amharic', 
            'om': 'Afaan Oromo'
        }.get(detected_lang, 'Unknown')
    })


# ─────────────────────────────────────────────────────────────────────────────
# FEEDBACK SYSTEM — 👍 / 👎 on AI responses
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/feedback', methods=['POST'])
def feedback_endpoint():
    data = request.json
    if not data or 'rating' not in data:
        return jsonify({'error': 'rating (positive/negative) is required'}), 400

    entry = {
        'session_id': data.get('session_id', 'anonymous'),
        'rating': data.get('rating'),           # "positive" | "negative"
        'message': data.get('message', ''),     # user message that generated this response
        'response_snippet': data.get('response_snippet', '')[:200],  # first 200 chars
        'timestamp': __import__('datetime').datetime.now().isoformat()
    }
    _feedback_log.append(entry)

    positive = sum(1 for f in _feedback_log if f['rating'] == 'positive')
    total = len(_feedback_log)
    satisfaction = round(positive / total * 100, 1) if total > 0 else 0

    print(f"[Feedback] {entry['rating']} | Session: {entry['session_id']} | Satisfaction: {satisfaction}%")

    return jsonify({
        'success': True,
        'message': 'Thank you for your feedback! This helps improve AgriLink AI.',
        'total_feedback': total,
        'satisfaction_rate': satisfaction
    })


@app.route('/api/feedback/stats', methods=['GET'])
def feedback_stats():
    """Return feedback statistics — useful for the admin dashboard."""
    if not _feedback_log:
        return jsonify({'total': 0, 'positive': 0, 'negative': 0, 'satisfaction': 0})

    positive = sum(1 for f in _feedback_log if f['rating'] == 'positive')
    negative = len(_feedback_log) - positive
    return jsonify({
        'total': len(_feedback_log),
        'positive': positive,
        'negative': negative,
        'satisfaction': round(positive / len(_feedback_log) * 100, 1)
    })


# ─────────────────────────────────────────────────────────────────────────────
# PRICE ALERT ENGINE
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/alerts', methods=['POST'])
def create_alert_endpoint():
    """Create a new price alert for a user."""
    data = request.json
    if not data or 'crop' not in data or 'target_price' not in data:
        return jsonify({'error': 'crop and target_price are required'}), 400

    result = create_alert(
        user_id=data.get('user_id', 'anonymous'),
        crop=data['crop'],
        target_price=float(data['target_price']),
        condition=data.get('condition', 'above'),
        location=data.get('location', 'East Hararghe')
    )
    return jsonify(result)


@app.route('/api/alerts/check', methods=['GET'])
def check_alerts_endpoint():
    """Check all active alerts for a user against current prices."""
    user_id = request.args.get('user_id', 'anonymous')
    result = check_alerts(user_id)
    return jsonify(result)


@app.route('/api/alerts', methods=['GET'])
def get_alerts_endpoint():
    """Get all active alerts for a user."""
    user_id = request.args.get('user_id', 'anonymous')
    alerts = get_user_alerts(user_id)
    return jsonify({'alerts': alerts})


@app.route('/api/alerts/<alert_id>', methods=['DELETE'])
def dismiss_alert_endpoint(alert_id):
    """Dismiss (deactivate) a specific alert."""
    data = request.json or {}
    user_id = data.get('user_id', 'anonymous')
    result = dismiss_alert(alert_id, user_id)
    return jsonify(result)


# ─────────────────────────────────────────────────────────────────────────────
# CACHE STATS (dev/admin tool)
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/cache/stats', methods=['GET'])
def cache_stats_endpoint():
    return jsonify(cache.stats())


@app.route('/api/cache/clear', methods=['POST'])
def cache_clear_endpoint():
    cache.clear()
    return jsonify({'success': True, 'message': 'Cache cleared.'})


# ─────────────────────────────────────────────────────────────────────────────
# GEMINI TRANSLATION ENGINE — Agricultural-aware multilingual translation
# Supports: English ↔ Amharic ↔ Afaan Oromo
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/translate', methods=['POST'])
def translate_endpoint():
    """Translate a message between English, Amharic, and Afaan Oromo using Gemini."""
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'message is required'}), 400
    if 'sender_language' not in data or 'receiver_language' not in data:
        return jsonify({'error': 'sender_language and receiver_language are required'}), 400

    result = translate_message(
        message=data['message'],
        sender_language=data['sender_language'],
        receiver_language=data['receiver_language']
    )

    if 'error' in result and 'translated_text' not in result:
        return jsonify(result), 500

    return jsonify(result)


# ─────────────────────────────────────────────────────────────────────────────
# HEALTH CHECK

# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'service': 'AgriLink AI Engine',
        'version': '2.0.0',
        'features': ['conversation_memory', 'rag_kb', 'ttl_cache', 'price_alerts', 'feedback', 'vision', 'weather'],
        'cache': cache.stats()
    })


if __name__ == '__main__':
    print("🌾 AgriLink AI Engine v2.0 starting...")
    print("   ✅ Conversation Memory: ON (6-turn history)")
    print("   ✅ RAG Knowledge Base: ON (50+ Ethiopian agriculture facts)")
    print("   ✅ TTL Cache: ON (30min price, 60min weather)")
    print("   ✅ Price Alerts: ON")
    print("   ✅ Feedback System: ON")
    print("   ✅ Vision Diagnostics: ON")
    # Use dynamic port for Render deployment
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, host='0.0.0.0', port=port)
