"""
AgriLink RAG-Lite Knowledge Base
---------------------------------
A structured, local knowledge base of Ethiopian agricultural facts.
Used to inject grounded context into Gemini prompts, preventing hallucinations
and ensuring Ethiopia-specific accuracy.

This is "RAG-lite" — instead of vector embeddings, we use keyword matching
to retrieve the most relevant knowledge chunks for a given query.
"""

import re

# ─── Ethiopian Agricultural Knowledge Chunks ──────────────────────────────────
# Each entry: { "keywords": [...], "topic": "...", "content": "..." }

KNOWLEDGE_BASE = [

    # ── Crop Calendars ────────────────────────────────────────────────────────
    {
        "keywords": ["teff", "plant", "season", "when", "calendar"],
        "topic": "Teff Planting Calendar",
        "content": (
            "Teff is Ethiopia's most important cereal. Two planting windows: "
            "(1) Meher/Kiremt: plant mid-June to mid-July, harvest September–October. "
            "(2) Belg: plant February–March, harvest May–June. "
            "Optimal altitude: 1,500–2,800m above sea level. "
            "Seed rate: 15–20 kg/hectare. Do NOT plant in waterlogged soils."
        )
    },
    {
        "keywords": ["maize", "corn", "plant", "season", "when", "calendar"],
        "topic": "Maize Planting Calendar",
        "content": (
            "Maize is planted at the onset of Kiremt rains (June) in Ethiopia's highlands. "
            "In East Hararghe: plant June–July, harvest October–November. "
            "Common varieties: BH540, BHQPY545, Pioneer 30Y87. "
            "Plant spacing: 75cm × 25cm. Apply DAP at planting, Urea at knee-high stage."
        )
    },
    {
        "keywords": ["coffee", "harvest", "plant", "season", "buna", "ቡና"],
        "topic": "Ethiopian Coffee Harvest Calendar",
        "content": (
            "Ethiopian coffee harvest is October–January, with peak December. "
            "Harari coffee (Harar variety): drought-tolerant, natural process, "
            "harvested in higher zones of East Hararghe. "
            "Yirgacheffe and Sidama: December–January. "
            "Jimma/Kaffa: October–November. "
            "Specialty-grade cherry turns full red before picking. "
            "Natural dry process fetches 30–40% premium over wet-washed."
        )
    },
    {
        "keywords": ["wheat", "plant", "season", "when"],
        "topic": "Ethiopian Wheat Planting Guide",
        "content": (
            "Wheat is planted during Kiremt rains (June–July) or Belg rains (Feb–March). "
            "Main wheat belts: Arsi, Bale, West Shewa, Tigray. "
            "Common varieties: Kakaba, Danda'a, Lemu. "
            "Arsi Negele and Bekoji zones produce the highest-quality wheat for flour milling. "
            "Harvest in October–November for main season."
        )
    },
    {
        "keywords": ["sorghum", "plant", "season"],
        "topic": "Sorghum Planting Guide",
        "content": (
            "Sorghum is drought-tolerant and planted at the onset of Kiremt in lowland Ethiopia. "
            "East and West Hararghe, Somali Region, and Afar are key producing areas. "
            "Plant June–July, harvest November–December. "
            "Sorghum is 15–20% cheaper than maize as animal feed alternative."
        )
    },
    {
        "keywords": ["chat", "khat", "qat", "harvest", "season"],
        "topic": "Chat (Khat) Production Guide",
        "content": (
            "Chat (Catha edulis) is a perennial shrub — Ethiopia's highest-value export crop after coffee. "
            "East Hararghe (Harar, Fedis, Kombolcha zones) produces the majority of Ethiopia's chat. "
            "Leaves are harvested year-round but peak demand and prices are during religious celebrations. "
            "Fresh chat must reach market within 24–48 hours of harvest. "
            "Price range: 700–1,200 ETB/kg depending on grade and freshness."
        )
    },
    {
        "keywords": ["barley", "plant", "season"],
        "topic": "Barley Planting Guide",
        "content": (
            "Barley thrives at high altitudes (2,500–3,500m) in Ethiopia. "
            "Key producing zones: Bale, Arsi, West Shewa, North Gondar. "
            "Planted June–July (Kiremt), harvested October–November. "
            "Used for food, animal feed, and malting (Dashen beer). "
            "Average yield 15–20 quintals/hectare under improved practices."
        )
    },

    # ── Price Ranges & Market Data (ECX-style) ────────────────────────────────
    {
        "keywords": ["teff", "price", "market", "etb", "cost"],
        "topic": "Current Teff Market Price Range",
        "content": (
            "Teff market prices in Ethiopia (2025/2026 estimates): "
            "White teff (highest grade): 10,000–11,500 ETB/quintal. "
            "Mixed teff: 9,000–10,000 ETB/quintal. "
            "Red teff (lowest grade): 8,000–9,000 ETB/quintal. "
            "Prices peak June–August (Kiremt) when stock is low. "
            "Prices drop November–February post-harvest. "
            "ECX spot prices: Addis Ababa tend to be 5–8% higher than Harar regional hub."
        )
    },
    {
        "keywords": ["maize", "corn", "price", "market", "etb"],
        "topic": "Current Maize Market Price Range",
        "content": (
            "Maize prices in East Hararghe and Harar (2025/2026 estimates): "
            "Grade 1 (dry, clean): 4,500–5,200 ETB/quintal (Jun–Aug peak). "
            "Grade 2: 3,800–4,500 ETB/quintal. "
            "Post-harvest low: 3,500–4,000 ETB/quintal (November–January). "
            "Import parity price from neighboring countries affects local floor prices."
        )
    },
    {
        "keywords": ["coffee", "price", "market", "etb", "buna"],
        "topic": "Ethiopian Coffee Market Price Range",
        "content": (
            "Ethiopian coffee prices (2025/2026 estimates): "
            "Grade 1–2 (export-quality, Harar natural): 550–750 ETB/kg. "
            "Grade 3–4 (domestic, wet-washed): 380–480 ETB/kg. "
            "Grade 5+ (local market): 300–360 ETB/kg. "
            "ECX sets daily reference prices. Direct specialty buyers pay 20–40% above ECX. "
            "Global arabica price affects Ethiopian export coffee significantly."
        )
    },
    {
        "keywords": ["wheat", "price", "market", "etb"],
        "topic": "Ethiopian Wheat Market Price Range",
        "content": (
            "Wheat prices in Ethiopia (2025/2026 estimates): "
            "Grade 1 (hard white/red wheat): 6,000–7,000 ETB/quintal. "
            "Grade 2: 5,200–6,000 ETB/quintal. "
            "Grade 3: 4,500–5,200 ETB/quintal. "
            "Post-harvest (October–December) prices drop to 4,500–5,000 ETB/quintal. "
            "Import prices (gov't wheat): creates artificial price ceiling."
        )
    },
    {
        "keywords": ["price", "sell", "hold", "market", "when", "best"],
        "topic": "Optimal Sell Timing Strategy",
        "content": (
            "Ethiopian crop price strategy: "
            "AVOID selling immediately post-harvest — oversupply drops prices 15–25% below peak. "
            "IDEAL sell window: 6–10 weeks after harvest when glut clears. "
            "BEST months by crop: Teff → June–August; Maize → May–July; Wheat → May–August. "
            "STORAGE pays: proper grain storage can increase returns by 20–35% vs. immediate sale. "
            "Monitor ECX daily prices and AgriLink weekly trend data before committing to sale."
        )
    },

    # ── Seasons ────────────────────────────────────────────────────────────────
    {
        "keywords": ["kiremt", "rain", "rainy", "season", "june", "july", "august"],
        "topic": "Kiremt Rainy Season",
        "content": (
            "Kiremt is Ethiopia's main rainy season: June–September. "
            "Highest rainfall in Ethiopia's highlands (600–1,200mm). "
            "This is when 80% of Ethiopia's main crop production is grown. "
            "Farmers should: complete planting by end of June, apply fertilizers at emergence, "
            "watch for late blight (potatoes), stem borer (maize), and gray leaf spot. "
            "Road access becomes difficult — price prices RISE as supply movement slows."
        )
    },
    {
        "keywords": ["bega", "dry", "harvest", "season", "october", "november", "december"],
        "topic": "Bega Dry/Harvest Season",
        "content": (
            "Bega is Ethiopia's main dry and harvest season: October–January. "
            "Cool, dry conditions — ideal for threshing, drying, and transporting crops. "
            "Market prices for most crops FALL due to post-harvest oversupply. "
            "This is the best window for buyers to purchase in bulk. "
            "Coffee and chat harvest peaks during this period."
        )
    },
    {
        "keywords": ["belg", "short rain", "february", "march", "april"],
        "topic": "Belg Short Rain Season",
        "content": (
            "Belg is Ethiopia's short rainy season: February–May. "
            "Receives 20–40% of Kiremt rainfall. "
            "Key producing areas: Arsi, Bale, East Hararghe, Wollo. "
            "Belg crops include: Maize, Teff, Sorghum, Potato, and vegetables. "
            "Belg-season crops reach market May–July, providing mid-year supply buffer."
        )
    },

    # ── Pest & Disease ────────────────────────────────────────────────────────
    {
        "keywords": ["pest", "disease", "stem borer", "maize", "worm"],
        "topic": "Fall Armyworm & Stem Borer Control",
        "content": (
            "Fall Armyworm (FAW) is the #1 maize pest in Ethiopia since 2017. "
            "Identify: ragged leaf feeding, frass in whorl, damaged tassels. "
            "Control: Spray emamectin benzoate (0.5g/L) or spinetoram at whorl stage. "
            "Stem Borer: Look for 'dead heart' at seedling stage. "
            "Organic option: neem-based solutions, push-pull with Napier grass. "
            "Scout fields twice weekly during vegetative growth stage."
        )
    },
    {
        "keywords": ["rust", "wheat", "disease", "protection"],
        "topic": "Wheat Rust Disease Management",
        "content": (
            "Wheat rust (yellow/stem/leaf rust) is Ethiopia's top wheat threat. "
            "Ug99 stem rust race is present in Ethiopia — use resistant varieties. "
            "Resistant varieties: Kakaba, Danda'a are rust-resistant. "
            "Chemical control: propiconazole or tebuconazole fungicide at flag-leaf stage. "
            "Scout from tillering — look for orange/yellow pustules on leaves. "
            "Report outbreaks to local extension office for emergency response."
        )
    },
    {
        "keywords": ["coffee", "disease", "wilt", "berry", "pest"],
        "topic": "Coffee Berry Disease & Coffee Wilt",
        "content": (
            "Coffee Berry Disease (CBD): most damaging coffee pathogen in Ethiopia. "
            "Symptoms: dark lesions on green berries; causes 30–80% crop loss. "
            "Control: copper-based fungicide before rainy season. Remove infected berries. "
            "Coffee Wilt (Gibberella xylarioides): causes sudden wilting and death. "
            "No chemical cure — remove infected trees, plant resistant varieties (Jimma varieties). "
            "Coffee Berry Borer (CBB): drill holes in ripe berries. Spray beauveria bassiana fungus."
        )
    },

    # ── Storage & Post-Harvest ────────────────────────────────────────────────
    {
        "keywords": ["storage", "silo", "grain", "store", "warehouse", "weevil"],
        "topic": "Grain Storage Best Practices",
        "content": (
            "Proper grain storage is Ethiopia's most underused profit multiplier. "
            "Key rules: dry grain to <13.5% moisture before storage. "
            "Use hermetic bags (PICS, GrainPro) for maize/wheat storage — eliminates weevils without chemicals. "
            "Metal silos (200–3,000kg capacity) available through USAID/MoA programs. "
            "Monthly monitoring: check for mold, heating, insect activity. "
            "Proper storage enables farmers to sell 6–8 weeks after harvest for 20–30% more."
        )
    },

    # ── Buyer-Specific ────────────────────────────────────────────────────────
    {
        "keywords": ["buy", "bulk", "buyer", "purchase", "stock", "supplier"],
        "topic": "Bulk Buying Strategy for Traders",
        "content": (
            "Best practices for Ethiopian agricultural commodity buyers: "
            "Buy window: October–January (Bega) for lowest prices on cereals and pulses. "
            "Negotiate forward contracts in September before harvest — lock in below-market prices. "
            "East Hararghe: best source for Chat, Maize, Sorghum, Coffee. "
            "Arsi/Bale: best for Wheat and Barley. "
            "Quality verification: Grade 1 requires <12% moisture, <2% foreign matter. "
            "Use licensed warehouse receipt system (WRS) for financing and quality assurance."
        )
    },
]


def retrieve_context(query: str, max_chunks: int = 3) -> str:
    """
    RAG-lite retrieval: find the most relevant knowledge chunks for a query.
    Uses keyword matching - no vector embeddings required.
    
    Returns a formatted context string to inject into the AI prompt.
    """
    query_lower = query.lower()
    scored_chunks = []

    for chunk in KNOWLEDGE_BASE:
        # Score = number of matching keywords found in the query
        score = sum(1 for kw in chunk["keywords"] if kw in query_lower)
        if score > 0:
            scored_chunks.append((score, chunk))

    # Sort by relevance score descending
    scored_chunks.sort(key=lambda x: x[0], reverse=True)

    if not scored_chunks:
        return ""  # No relevant context found

    # Take top N chunks
    top_chunks = [chunk for _, chunk in scored_chunks[:max_chunks]]

    # Format as context block for injection into Gemini prompt
    context_lines = ["📚 **Relevant Agricultural Context (verified data):**"]
    for chunk in top_chunks:
        context_lines.append(f"\n**{chunk['topic']}:** {chunk['content']}")

    return "\n".join(context_lines)


def get_all_topics() -> list:
    """Return a list of all available knowledge topics."""
    return [chunk["topic"] for chunk in KNOWLEDGE_BASE]
