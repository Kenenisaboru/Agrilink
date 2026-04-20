import json
import random
from datetime import datetime
from modules.cache import cache, TTL_MATCHING

# Simulated database of farmers and their crops
FARMERS_DB = [
    {
        "id": "farmer_001",
        "name": "Abebe Kebede",
        "location": "Harar",
        "crops": ["teff", "maize", "coffee"],
        "rating": 4.8,
        "phone": "+251911234567",
        "verified": True,
        "specialty": "organic_teff"
    },
    {
        "id": "farmer_002", 
        "name": "Fatuma Ahmed",
        "location": "Dire Dawa",
        "crops": ["chat", "sorghum", "barley"],
        "rating": 4.6,
        "phone": "+251912345678",
        "verified": True,
        "specialty": "chat_coffee"
    },
    {
        "id": "farmer_003",
        "name": "Kedir Jemal",
        "location": "East Hararghe",
        "crops": ["maize", "wheat", "onion"],
        "rating": 4.9,
        "phone": "+251913456789",
        "verified": True,
        "specialty": "onion_farming"
    },
    {
        "id": "farmer_004",
        "name": "Chaltu Tadesse",
        "location": "Haramaya",
        "crops": ["coffee", "fruits", "vegetables"],
        "rating": 4.7,
        "phone": "+251914567890",
        "verified": True,
        "specialty": "premium_coffee"
    }
]

# Simulated database of buyers
BUYERS_DB = [
    {
        "id": "buyer_001",
        "name": "Ethiopian Grain Corp",
        "location": "Addis Ababa",
        "needs": ["teff", "maize", "wheat"],
        "budget_range": "large",
        "verified": True,
        "payment_terms": "prompt"
    },
    {
        "id": "buyer_002",
        "name": "Harar Export Co",
        "location": "Harar",
        "needs": ["coffee", "chat"],
        "budget_range": "medium",
        "verified": True,
        "payment_terms": "net_30"
    },
    {
        "id": "buyer_003",
        "name": "Dire Dawa Foods",
        "location": "Dire Dawa", 
        "needs": ["vegetables", "fruits"],
        "budget_range": "medium",
        "verified": True,
        "payment_terms": "prompt"
    }
]

def calculate_match_score(farmer, buyer, crop_focus=None):
    """
    Calculate compatibility score between farmer and buyer
    """
    score = 0
    
    # Crop compatibility (40% weight)
    farmer_crops = set(farmer["crops"])
    buyer_needs = set(buyer["needs"])
    
    if crop_focus:
        if crop_focus.lower() in farmer_crops and crop_focus.lower() in buyer_needs:
            score += 40
    else:
        common_crops = farmer_crops.intersection(buyer_needs)
        score += len(common_crops) * 10
    
    # Location proximity (25% weight)
    if farmer["location"] == buyer["location"]:
        score += 25
    elif farmer["location"] in ["Harar", "Dire Dawa", "East Hararghe"] and buyer["location"] in ["Harar", "Dire Dawa", "East Hararghe"]:
        score += 15
    
    # Verification status (20% weight)
    if farmer["verified"] and buyer["verified"]:
        score += 20
    
    # Rating (15% weight)
    score += farmer["rating"] * 3
    
    return min(score, 100)  # Cap at 100

def find_best_matches(user_type, crop=None, location=None, limit=5):
    """
    Find best matches for farmers or buyers
    """
    cache_key = f"matches:{user_type}:{crop}:{location}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    matches = []
    
    if user_type.lower() == "buyer":
        # Find farmers for buyers
        target_buyers = [b for b in BUYERS_DB if location and b["location"].lower() == location.lower() or not location]
        
        for buyer in target_buyers:
            farmer_matches = []
            for farmer in FARMERS_DB:
                if crop and crop.lower() not in farmer["crops"]:
                    continue
                    
                score = calculate_match_score(farmer, buyer, crop)
                if score > 30:  # Minimum threshold
                    farmer_matches.append({
                        **farmer,
                        "match_score": score,
                        "match_reason": get_match_reason(farmer, buyer, crop)
                    })
            
            # Sort by score and take top matches
            farmer_matches.sort(key=lambda x: x["match_score"], reverse=True)
            
            matches.append({
                "buyer": buyer,
                "matched_farmers": farmer_matches[:limit],
                "total_matches": len(farmer_matches)
            })
    
    elif user_type.lower() == "farmer":
        # Find buyers for farmers
        target_farmers = [f for f in FARMERS_DB if not location or f["location"].lower() == location.lower()]
        
        for farmer in target_farmers:
            buyer_matches = []
            for buyer in BUYERS_DB:
                if not any(crop_need.lower() in farmer["crops"] for crop_need in buyer["needs"]):
                    continue
                    
                score = calculate_match_score(farmer, buyer)
                if score > 30:  # Minimum threshold
                    buyer_matches.append({
                        **buyer,
                        "match_score": score,
                        "match_reason": get_match_reason(farmer, buyer, crop)
                    })
            
            # Sort by score and take top matches
            buyer_matches.sort(key=lambda x: x["match_score"], reverse=True)
            
            matches.append({
                "farmer": farmer,
                "matched_buyers": buyer_matches[:limit],
                "total_matches": len(buyer_matches)
            })
    
    # Cache result
    cache.set(cache_key, matches, TTL_MATCHING)
    
    return matches

def get_match_reason(farmer, buyer, crop=None):
    """
    Generate human-readable match reason
    """
    reasons = []
    
    # Crop compatibility
    farmer_crops = set(farmer["crops"])
    buyer_needs = set(buyer["needs"])
    common_crops = farmer_crops.intersection(buyer_needs)
    
    if common_crops:
        crop_list = ", ".join(common_crops)
        reasons.append(f"Both have interest in {crop_list}")
    
    # Location proximity
    if farmer["location"] == buyer["location"]:
        reasons.append(f"Same location ({farmer['location']})")
    elif farmer["location"] in ["Harar", "Dire Dawa", "East Hararghe"] and buyer["location"] in ["Harar", "Dire Dawa", "East Hararghe"]:
        reasons.append("Nearby locations in East Hararghe region")
    
    # Quality indicators
    if farmer["rating"] >= 4.5:
        reasons.append(f"High farmer rating ({farmer['rating']}/5.0)")
    
    if farmer["verified"] and buyer["verified"]:
        reasons.append("Both parties verified")
    
    return "; ".join(reasons) if reasons else "General compatibility"

def generate_connection_suggestion(match):
    """
    Generate actionable connection suggestion
    """
    suggestions = []
    
    if match.get("match_score", 0) > 70:
        suggestions.append("📞 Contact immediately - high compatibility")
        suggestions.append("📈 Expect favorable pricing due to strong match")
    
    if match.get("match_score", 0) > 50:
        suggestions.append("💬 Discuss payment terms upfront")
        suggestions.append("📍 Arrange farm visit if possible")
    
    # Add specific advice based on specialty
    specialty = match.get("specialty")
    if specialty:
        specialty_advice = {
            "organic_teff": "Ask for organic certification details",
            "chat_coffee": "Inquire about chat quality grades",
            "onion_farming": "Discuss storage and transport options",
            "premium_coffee": "Request cupping reports and samples"
        }
        suggestions.append(f"💡 {specialty_advice.get(specialty, 'Discuss specialty details')}")
    
    return suggestions

def get_market_insights(crop=None, location=None):
    """
    Get current market insights for matching context
    """
    insights = {
        "price_trends": {
            "teff": {"trend": "stable", "range": "9,000-11,500 ETB/quintal"},
            "maize": {"trend": "rising", "range": "4,000-4,800 ETB/quintal"},
            "coffee": {"trend": "rising", "range": "25,000-35,000 ETB/quintal"},
            "chat": {"trend": "stable", "range": "15,000-22,000 ETB/quintal"}
        },
        "seasonal_advice": {
            "current": "Bega season (Oct-Jan) - harvest time",
            "recommendation": "Good time to sell due to high demand",
            "next_season": "Belg (Feb-May) - secondary rains"
        },
        "location_insights": {
            "Harar": "Strong coffee and chat market",
            "Dire Dawa": "Major trading hub, good prices",
            "East Hararghe": "Growing agricultural zone",
            "Addis Ababa": "Largest consumer market"
        }
    }
    
    return insights
