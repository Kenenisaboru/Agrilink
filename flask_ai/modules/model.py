import random

# Base prices in ETB per Quintal (100KG) or per Kg (for Chat/Coffee)
base_prices = {
    'maize': 4000,   # ETB/Quintal
    'wheat': 5500,   # ETB/Quintal
    'teff': 9000,    # ETB/Quintal
    'chat': 800,     # ETB/Kg
    'coffee': 450    # ETB/Kg
}

# Seasonal multiplier index to simulate linear trends
seasonality = {
    'January': 0.9, 'February': 0.85, 'March': 0.95, 'April': 1.05, 
    'May': 1.1, 'June': 1.15, 'July': 1.2, 'August': 1.25, 
    'September': 1.2, 'October': 1.1, 'November': 1.0, 'December': 0.95
}

def predict_price(crop, month, location="East Hararghe"):
    crop = crop.lower()
    month = month.capitalize()
    
    if crop not in base_prices:
        return 0, f"Crop '{crop}' not recognized. Try Maize, Wheat, Teff, Chat, or Coffee."
    
    try:
        # Simulate realistic model inference
        base = base_prices[crop]
        season_mod = seasonality.get(month, 1.0)
        
        # Add realistic noise for the specific location vs national average
        loc_noise = 1.05 if location.lower() == 'dire dawa' else 1.0
        random_variance = random.uniform(0.95, 1.05)
        
        prediction = base * season_mod * loc_noise * random_variance
        
        # Generate an explanation based on typical demand patterns
        explanation = f"Based on our simulated market models, we predict a price of {prediction:.2f} ETB."
        
        if season_mod > 1.1:
            explanation += f" Prices for {crop} are typically higher in {month} due to low post-harvest supply."
        elif season_mod < 0.95:
            explanation += f" Prices for {crop} tend to drop in {month} as new harvests enter the market."
        else:
            explanation += f" {month} represents a relatively stable pricing period for {crop}."
            
        if crop in ['chat', 'coffee']:
            explanation += " Note: Price is estimated per Kg."
        else:
            explanation += " Note: Price is estimated per Quintal (100 Kg)."
            
        return round(prediction, 2), explanation
    except Exception as e:
        return 0, f"Error generating prediction: {str(e)}"
