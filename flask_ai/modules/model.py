import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# Simulate realistic agricultural dataset for East Ethiopia
np.random.seed(42)
crops = ['maize', 'wheat', 'teff', 'chat', 'coffee']
months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
locations = ['East Hararghe', 'West Hararghe', 'Dire Dawa', 'Haramaya']

# Base prices in ETB per Quintal (100KG) or per Kg (for Chat/Coffee)
base_prices = {
    'maize': 4000,   # ETB/Quintal
    'wheat': 5500,   # ETB/Quintal
    'teff': 9000,    # ETB/Quintal
    'chat': 800,     # ETB/Kg
    'coffee': 450    # ETB/Kg
}

# Seasonal multiplier index (simulated)
seasonality = {
    'January': 0.9, 'February': 0.85, 'March': 0.95, 'April': 1.05, 
    'May': 1.1, 'June': 1.15, 'July': 1.2, 'August': 1.25, 
    'September': 1.2, 'October': 1.1, 'November': 1.0, 'December': 0.95
}

# Generate synthetic dataset
data = []
for _ in range(500):
    crop = np.random.choice(crops)
    month = np.random.choice(months)
    loc = np.random.choice(locations)
    
    # Calculate price with some noise
    price = base_prices[crop] * seasonality[month]
    
    # Add random noise +/- 10%
    noise = np.random.uniform(0.9, 1.1)
    final_price = round(price * noise, 2)
    
    data.append([crop, month, loc, final_price])

df = pd.DataFrame(data, columns=['Crop', 'Month', 'Location', 'Price'])

# Train a Linear Regression Pipeline
categorical_features = ['Crop', 'Month', 'Location']
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                           ('regressor', LinearRegression())])

X = df.drop('Price', axis=1)
y = df['Price']

# Train the model once
pipeline.fit(X, y)

def predict_price(crop, month, location="East Hararghe"):
    crop = crop.lower()
    month = month.capitalize()
    
    # Simple formatting to match synthetic data
    input_data = pd.DataFrame([[crop, month, location]], columns=['Crop', 'Month', 'Location'])
    
    try:
        prediction = pipeline.predict(input_data)[0]
        # Generate an explanation based on typical demand patterns
        explanation = f"The model predicts a price of {prediction:.2f} ETB based on historical trends."
        
        if seasonality.get(month, 1.0) > 1.1:
            explanation += f" Prices for {crop} are typically higher in {month} due to low post-harvest supply."
        elif seasonality.get(month, 1.0) < 0.95:
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
