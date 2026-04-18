import requests
import base64
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

def analyze_crop_image(image_file):
    try:
        if not GEMINI_API_KEY or GEMINI_API_KEY == "your_api_key_here":
            raise ValueError("Gemini API Key is missing. Please add it to your .env file.")

        # Read raw image bytes and encode to base64
        img_content = image_file.read()
        encoded_string = base64.b64encode(img_content).decode('utf-8')

        payload = {
            "contents": [{
                "parts": [
                    {"text": "You are an expert agricultural pathologist. Analyze this crop image and provide: 1. Disease Name, 2. Primary Pest/Cause, 3. Confidence level (0-1), 4. Organic treatment, 5. Chemical treatment (availability in Ethiopia). Respond ONLY in a structured JSON format with these exact keys: {\"disease\": \"...\", \"pest\": \"...\", \"confidence\": 0.0, \"treatment_organic\": \"...\", \"treatment_chemical\": \"...\"}"},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": encoded_string
                        }
                    }
                ]
            }]
        }

        response = requests.post(GEMINI_URL, json=payload)
        response_data = response.json()
        
        if "candidates" not in response_data:
            err_msg = response_data.get('error', {}).get('message', 'Unknown API Error')
            raise Exception(f"Gemini API Error: {err_msg}")

        text_response = response_data["candidates"][0]["content"]["parts"][0]["text"]
        
        import json
        clean_response = text_response.strip().replace('```json', '').replace('```', '')
        result = json.loads(clean_response)
        
        return {
            "status": "success",
            "analysis": result,
            "message": f"Gemini AI analyzed the crop and detected **{result['disease']}**."
        }
    except Exception as e:
        return {
            "status": "partial_success",
            "error": str(e),
            "message": f"AI analysis failed. Using backup diagnosis.",
            "analysis": {
                "disease": "Unknown Stress",
                "pest": "Monitoring required",
                "confidence": 0.5,
                "treatment_organic": "Ensure proper irrigation",
                "treatment_chemical": "Visit nearest agro-input store"
            }
        }
