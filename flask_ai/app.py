from flask import Flask, request, jsonify
from flask_cors import CORS
from modules.chatbot import get_chat_response
from modules.model import predict_price
from modules.recommendation import get_recommendations

app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    user_message = data['message']
    response, language = get_chat_response(user_message)
    
    return jsonify({
        'response': response,
        'detected_language': language
    })

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
        'predicted_price_etb': prediction,
        'explanation': explanation,
        'location': location
    })

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

if __name__ == '__main__':
    app.run(debug=True, port=5001)
