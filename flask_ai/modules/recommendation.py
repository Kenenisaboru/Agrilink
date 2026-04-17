def get_recommendations(user_type, crop_interest='', location='East Hararghe'):
    crop = crop_interest.lower() if crop_interest else ''
    
    if user_type.lower() == 'farmer':
        # Recommendations for Farmers
        recs = [
            {
                "title": "Best Time to Sell",
                "description": f"For {crop if crop else 'most staple crops'} in {location}, the peak prices often hit between June and August before the next harvest." if crop != 'chat' else "Chat prices remain relatively high year-round, but demand peaks during major holidays and dry seasons."
            },
            {
                "title": "Recommended Buyers (Simulated)",
                "description": "Matching your location with top-rated local cooperatives and certified export agents in Dire Dawa and Harar."
            },
            {
                "title": "Market Insight",
                "description": "Consider bulk selling. Partnering with 2-3 neighboring farmers increases negotiation leverage by up to 15%."
            }
        ]
        return recs
        
    elif user_type.lower() == 'buyer':
        # Recommendations for Buyers
        recs = [
            {
                "title": "Best Crops to Source Right Now",
                "description": "Teff and Harar Coffee currently show high export demand margins. Maize is heavily demanded domestically."
            },
            {
                "title": "Optimal Sourcing Regions",
                "description": "Haramaya and West Hararghe are currently showing slight surplus, making them ideal sourcing locations for better procurement prices."
            },
            {
                "title": "Logistics Insight",
                "description": "Consolidating transport from East Hararghe out to central markets can reduce overhead costs by an estimated 12%."
            }
        ]
        return recs
        
    else:
        return [{"title": "Error", "description": "Invalid user type. Please specify 'farmer' or 'buyer'."}]
