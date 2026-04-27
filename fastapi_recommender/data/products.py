"""
Static product catalog for AgriLink – East Hararghe.
In production, this would be fetched from MongoDB/PostgreSQL.
"""

PRODUCTS = [
    # ── Coffee ──────────────────────────────────────────────────────────────
    {"id": "P001", "name": "Premium Harari Coffee (Natural)", "category": "coffee",
     "tags": ["coffee", "premium", "export", "natural", "harar"],
     "price_etb": 620, "unit": "kg", "location": "Harar",
     "farmer_id": "F001", "rating": 4.9, "stock": 500},
    {"id": "P002", "name": "Washed Harari Coffee Grade 1", "category": "coffee",
     "tags": ["coffee", "washed", "grade1", "export", "harar"],
     "price_etb": 580, "unit": "kg", "location": "Harar",
     "farmer_id": "F002", "rating": 4.8, "stock": 300},
    {"id": "P003", "name": "Jimma Forest Coffee", "category": "coffee",
     "tags": ["coffee", "forest", "organic", "specialty"],
     "price_etb": 490, "unit": "kg", "location": "Jimma",
     "farmer_id": "F003", "rating": 4.7, "stock": 200},
    # ── Khat / Jimaa ────────────────────────────────────────────────────────
    {"id": "P004", "name": "Awaday Premium Khat", "category": "khat",
     "tags": ["khat", "jimaa", "premium", "awaday", "export"],
     "price_etb": 320, "unit": "bundle", "location": "Awaday",
     "farmer_id": "F004", "rating": 4.8, "stock": 1000},
    {"id": "P005", "name": "Harar Khat Fresh Bundle", "category": "khat",
     "tags": ["khat", "jimaa", "fresh", "harar"],
     "price_etb": 280, "unit": "bundle", "location": "Harar",
     "farmer_id": "F005", "rating": 4.6, "stock": 800},
    # ── Grains ──────────────────────────────────────────────────────────────
    {"id": "P006", "name": "Organic White Teff", "category": "grains",
     "tags": ["teff", "organic", "grain", "staple", "gluten-free"],
     "price_etb": 9200, "unit": "quintal", "location": "East Hararghe",
     "farmer_id": "F006", "rating": 4.9, "stock": 150},
    {"id": "P007", "name": "Brown Teff – Arsi Grade A", "category": "grains",
     "tags": ["teff", "brown", "grain", "staple", "arsi"],
     "price_etb": 8800, "unit": "quintal", "location": "Arsi",
     "farmer_id": "F007", "rating": 4.7, "stock": 200},
    {"id": "P008", "name": "Yellow Maize BH540 Hybrid", "category": "grains",
     "tags": ["maize", "hybrid", "grain", "animal-feed"],
     "price_etb": 4200, "unit": "quintal", "location": "West Hararghe",
     "farmer_id": "F008", "rating": 4.5, "stock": 400},
    {"id": "P009", "name": "White Wheat – Bale Premium", "category": "grains",
     "tags": ["wheat", "grain", "staple", "bale"],
     "price_etb": 5600, "unit": "quintal", "location": "Bale",
     "farmer_id": "F009", "rating": 4.6, "stock": 250},
    {"id": "P010", "name": "Sorghum Red Variety", "category": "grains",
     "tags": ["sorghum", "grain", "drought-resistant", "animal-feed"],
     "price_etb": 3800, "unit": "quintal", "location": "East Hararghe",
     "farmer_id": "F010", "rating": 4.4, "stock": 600},
    {"id": "P011", "name": "Highland Barley", "category": "grains",
     "tags": ["barley", "grain", "highland", "staple"],
     "price_etb": 4800, "unit": "quintal", "location": "Bale",
     "farmer_id": "F011", "rating": 4.5, "stock": 180},
    # ── Vegetables ──────────────────────────────────────────────────────────
    {"id": "P012", "name": "Haramaya Tomatoes (1kg)", "category": "vegetables",
     "tags": ["tomatoes", "vegetables", "fresh", "haramaya"],
     "price_etb": 45, "unit": "kg", "location": "Haramaya",
     "farmer_id": "F012", "rating": 4.7, "stock": 2000},
    {"id": "P013", "name": "Green Pepper Bundle", "category": "vegetables",
     "tags": ["pepper", "vegetables", "fresh", "spicy"],
     "price_etb": 38, "unit": "kg", "location": "Haramaya",
     "farmer_id": "F013", "rating": 4.6, "stock": 1500},
    {"id": "P014", "name": "Onion Red – 10kg Sack", "category": "vegetables",
     "tags": ["onion", "vegetables", "staple", "bulk"],
     "price_etb": 350, "unit": "10kg", "location": "East Hararghe",
     "farmer_id": "F014", "rating": 4.5, "stock": 800},
    {"id": "P015", "name": "Ethiopian Potato (Washed)", "category": "vegetables",
     "tags": ["potato", "vegetables", "tuber", "staple"],
     "price_etb": 28, "unit": "kg", "location": "Bale",
     "farmer_id": "F015", "rating": 4.4, "stock": 3000},
    # ── Fruits ──────────────────────────────────────────────────────────────
    {"id": "P016", "name": "Harar Mango Basket (5kg)", "category": "fruits",
     "tags": ["mango", "fruits", "tropical", "harar", "seasonal"],
     "price_etb": 220, "unit": "5kg basket", "location": "Harar",
     "farmer_id": "F016", "rating": 4.8, "stock": 500},
    {"id": "P017", "name": "Banana Bunch – Dire Dawa", "category": "fruits",
     "tags": ["banana", "fruits", "tropical", "dire-dawa"],
     "price_etb": 85, "unit": "bunch", "location": "Dire Dawa",
     "farmer_id": "F017", "rating": 4.6, "stock": 700},
    {"id": "P018", "name": "Papaya Large (each)", "category": "fruits",
     "tags": ["papaya", "fruits", "tropical", "organic"],
     "price_etb": 55, "unit": "piece", "location": "Harar",
     "farmer_id": "F018", "rating": 4.5, "stock": 400},
    # ── Livestock ───────────────────────────────────────────────────────────
    {"id": "P019", "name": "Somali Sheep (Live)", "category": "livestock",
     "tags": ["sheep", "livestock", "meat", "somali-breed", "eid"],
     "price_etb": 8500, "unit": "head", "location": "East Hararghe",
     "farmer_id": "F019", "rating": 4.7, "stock": 50},
    {"id": "P020", "name": "Local Chicken (Live)", "category": "livestock",
     "tags": ["chicken", "poultry", "livestock", "local-breed"],
     "price_etb": 450, "unit": "head", "location": "Haramaya",
     "farmer_id": "F020", "rating": 4.5, "stock": 200},
    # ── Spices ──────────────────────────────────────────────────────────────
    {"id": "P021", "name": "Berbere Spice Mix (500g)", "category": "spices",
     "tags": ["berbere", "spices", "ethiopian", "cooking"],
     "price_etb": 180, "unit": "500g", "location": "Harar",
     "farmer_id": "F021", "rating": 4.9, "stock": 1000},
    {"id": "P022", "name": "Fenugreek Seeds (1kg)", "category": "spices",
     "tags": ["fenugreek", "spices", "seeds", "medicinal"],
     "price_etb": 120, "unit": "kg", "location": "East Hararghe",
     "farmer_id": "F022", "rating": 4.6, "stock": 600},
    {"id": "P023", "name": "Black Cumin (Tikur Azmud)", "category": "spices",
     "tags": ["cumin", "spices", "black-seed", "nigella", "medicinal"],
     "price_etb": 250, "unit": "kg", "location": "Haramaya",
     "farmer_id": "F023", "rating": 4.8, "stock": 300},
]

# ── Synthetic interaction log ─────────────────────────────────────────────────
# Format: (user_id, product_id, interaction_type, weight)
#   view=1, wishlist=2, cart=3, purchase=5
INTERACTIONS = [
    # Buyer B001 – coffee & khat enthusiast
    ("B001","P001",5), ("B001","P002",3), ("B001","P004",5), ("B001","P005",2),
    ("B001","P021",3),
    # Buyer B002 – grain bulk buyer
    ("B002","P006",5), ("B002","P007",5), ("B002","P008",3), ("B002","P009",3),
    ("B002","P010",2), ("B002","P011",2),
    # Buyer B003 – fresh produce lover
    ("B003","P012",5), ("B003","P013",5), ("B003","P014",3), ("B003","P015",3),
    ("B003","P016",3), ("B003","P017",2),
    # Buyer B004 – export trader (coffee + spices)
    ("B004","P001",5), ("B004","P002",5), ("B004","P003",3), ("B004","P021",5),
    ("B004","P022",3), ("B004","P023",5),
    # Buyer B005 – livestock buyer
    ("B005","P019",5), ("B005","P020",3), ("B005","P010",2),
    # Buyer B006 – mixed buyer
    ("B006","P006",3), ("B006","P012",3), ("B006","P016",3), ("B006","P001",2),
    ("B006","P004",2),
    # Buyer B007 – organic only
    ("B007","P001",5), ("B007","P006",5), ("B007","P023",3), ("B007","P003",5),
    ("B007","P018",3),
    # Buyer B008 – spice merchant
    ("B008","P021",5), ("B008","P022",5), ("B008","P023",5), ("B008","P013",3),
    # Buyer B009 – fruit market
    ("B009","P016",5), ("B009","P017",5), ("B009","P018",5), ("B009","P012",2),
    # Buyer B010 – animal feed buyer
    ("B010","P008",5), ("B010","P010",5), ("B010","P011",3), ("B010","P019",2),
]
