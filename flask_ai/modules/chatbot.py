import re
try:
    from langdetect import detect
except ImportError:
    def detect(text):
        return 'en'

# Simple mock knowledge base for professional agricultural advice
KNOWLEDGE_BASE = {
    'en': {
        'demand': "Currently in East Ethiopia, Teff and Wheat are experiencing high demand due to seasonal shortfalls. Chat remains consistently profitable for export.",
        'best_time_maize': "The optimal time to sell maize is typically between December and February, right before the short rainy season (Belg) when local reserves begin to deplete. Storing properly and waiting until February can yield a 15-20% price premium.",
        'better_price': "To secure a better price: 1. Ensure proper drying to prevent aflatoxin. 2. Use hermetic storage bags. 3. Group your harvest with other farmers (cooperatives) to negotiate as bulk sellers. 4. Directly engage verified buyers on AgriLink to bypass middlemen.",
        'greeting': "Hello! I am your AgriLink AI Assistant. I can advise you on crop prices, market demand, and best selling practices. How can I help you today?",
        'default': "I specialize in agricultural market intelligence. Could you please specify if you're asking about crop demand, pricing, or selling strategies?"
    },
    'am': {
        'demand': "በአሁኑ ጊዜ በምስራቅ ኢትዮጵያ ጤፍ እና ስንዴ በወቅታዊ እጥረት ምክንያት ከፍተኛ ፍላጎት አላቸው:: ጫት ለውጭ ገበያ ሁልጊዜም አዋጭ ነው::",
        'best_time_maize': "በቆሎ ለመሸጥ የተሻለው ጊዜ ከታህሳስ እስከ የካቲት ነው:: በአግባቡ አከማችቶ እስከ የካቲት ማቆየት ከ15-20% የተሻለ ዋጋ ያስገኛል::",
        'better_price': "የተሻለ ዋጋ ለማግኘት፡ 1. በአግባቡ ማድረቅ 2. ዘመናዊ መከላከያ ከረጢት መጠቀም 3. ከሌሎች አርሶ አደሮች ጋር በመሆን በጅምላ መሸጥ 4. ደላላን በማስቀረት በቀጥታ አግሪሊንክ ላይ ለገዢዎች መሸጥ::",
        'greeting': "ሰላም! እኔ የአግሪሊንክ አርቴፊሻል ኢንተለጀንስ ረዳት ነኝ:: ስለ ሰብል ዋጋ እና ገበያ መረጃ ልሰጥዎ እችላለሁ::",
        'default': "እባክዎ ጥያቄዎን ግልፅ ያድርጉ (ለምሳሌ ስለ ገበያ ፍላጎት፣ ወይም በቆሎ መቼ መሸጥ እንዳለበት ይጠይቁ)::"
    },
    'om': {
        'demand': "Yeroo ammaa Baha Itoophiyaatti, Xaafii fi Qamadiin fedhii guddaa qabu. Jimaan gabaa alaa irratti yeroo hundumaa bu'a qabeessa.",
        'best_time_maize': "Bishingaa gurguruuf yeroon gaariin Muddee hanga Guraandhalaa ti. Haala gaariin kuusuun hanga Guraandhalaatti eeguun gatii %15-20 dabalata fida.",
        'better_price': "Gatii gaarii argachuuf: 1. Sirnaan gogsuu 2. Qodaa ammayyaa fayyadamuu 3. Qotee bultoota biroo waliin walta'uun jimlaan gurguruu 4. Namoota gidduu galan hambisuun kallattiin AgriLink irratti bittootaaf gurguruu.",
        'greeting': "Akkam! Ani gargaaraa teeknooloojii AgriLink ti. Waa'ee gatii midhaanii fi gabaa isin gargaaruu nan danda'a. Maal isin gargaaru?",
        'default': "Maaloo gaaffii keessan ifa godhaa (Fkn. waa'ee fedhii gabaa ykn yeroo bishingaa gurguruu gaafadhaa)."
    }
}

def detect_language(text):
    # Basic fallback heuristic if langdetect fails
    if re.search(r'[\u1200-\u137F]', text):
        return 'am' # Amharic Ethiopic script
    
    try:
        lang = detect(text)
        if lang in ['en', 'am', 'om']:
            return lang
        # Afaan Oromo detection is sometimes tricky with langdetect (often detected as 'so' or 'sw' or 'et')
        # We can do a rudimentary keyword search for Afaan Oromo
        oromo_keywords = ['akkam', 'bishingaa', 'gabaa', 'gati', 'gurguruu', 'maal', 'qamadiin', 'xaafii']
        if any(word in text.lower() for word in oromo_keywords):
            return 'om'
        return 'en'
    except:
        return 'en'

def get_intent(text):
    text = text.lower()
    
    if any(word in text for word in ['demand', 'ፍላጎት', 'fedhii', 'what crops', 'ምን ሰብሎች', 'midhaan kam']):
        return 'demand'
    if any(word in text for word in ['maize', 'በቆሎ', 'bishingaa', 'corn']) and any(word in text for word in ['time', 'ጊዜ', 'yeroo', 'when', 'መቼ']):
        return 'best_time_maize'
    if any(word in text for word in ['better price', 'ጥሩ ዋጋ', 'gatii gaarii', 'improve', 'ጨምር']):
        return 'better_price'
    if any(word in text for word in ['hello', 'hi', 'ሰላም', 'akkam']):
        return 'greeting'
        
    return 'default'

def get_chat_response(message):
    lang = detect_language(message)
    intent = get_intent(message)
    
    response = KNOWLEDGE_BASE.get(lang, KNOWLEDGE_BASE['en']).get(intent, KNOWLEDGE_BASE['en']['default'])
    
    return response, lang
