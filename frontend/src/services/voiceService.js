// Voice Service for Multi-Language Support (English, Amharic, Oromo)
class VoiceService {
  constructor() {
    this.recognition = null;
    this.currentLanguage = 'en-US';
    this.voices = [];
    
    // Safely check support only if window is available
    this.isSupported = this.checkSupport();

    // Load available voices and listen for changes
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  get synthesis() {
    return typeof window !== 'undefined' ? window.speechSynthesis : null;
  }

  checkSupport() {
    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    return {
      recognition: !!speechRecognition,
      synthesis: !!speechSynthesis,
      full: !!(speechRecognition && speechSynthesis)
    };
  }

  loadVoices() {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
    }
  }

  // Language detection from text
  detectLanguage(text) {
    // Check for Amharic characters (U+1200 to U+137F)
    if (/[\u1200-\u137F]/.test(text)) {
      return 'am';
    }
    
    // Check for common Oromo words
    const oromoWords = ['akkam', 'gabaa', 'oti', 'lafa', 'mi\'eessaa', 'beekamsa', 
                      'qonnaan', 'gurgurtaa', 'biyyoo', 'rooba', 'yeroo', 'garuu'];
    const lowerText = text.toLowerCase();
    if (oromoWords.some(word => lowerText.includes(word))) {
      return 'om';
    }
    
    // Default to English
    return 'en';
  }

  // Get language configuration for speech
  getLanguageConfig(languageCode) {
    const configs = {
      'en': {
        recognition: 'en-US',
        synthesis: 'en-US',
        name: 'English',
        voiceFilter: (voice) => voice.lang.startsWith('en')
      },
      'am': {
        recognition: 'am-ET',
        synthesis: 'am-ET', 
        name: 'Amharic',
        voiceFilter: (voice) => voice.lang.startsWith('am')
      },
      'om': {
        recognition: 'om-ET',
        synthesis: 'om-ET',
        name: 'Afaan Oromo', 
        voiceFilter: (voice) => voice.lang.startsWith('om')
      }
    };
    
    return configs[languageCode] || configs['en'];
  }

  // Start voice recognition
  startRecognition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      const config = this.getLanguageConfig(options.language || this.currentLanguage);
      
      this.recognition.lang = config.recognition;
      this.recognition.continuous = options.continuous || false;
      this.recognition.interimResults = options.interimResults || false;
      this.recognition.maxAlternatives = options.maxAlternatives || 1;

      this.recognition.onstart = () => {
        if (options.onStart) options.onStart();
      };

      let isResolved = false;

      this.recognition.onresult = (event) => {
        isResolved = true;
        const results = Array.from(event.results).map(result => ({
          transcript: result[0].transcript,
          confidence: result[0].confidence,
          isFinal: result.isFinal
        }));
        
        resolve({
          results,
          transcript: results[results.length - 1]?.transcript || '',
          confidence: results[results.length - 1]?.confidence || 0,
          detectedLanguage: this.detectLanguage(results[results.length - 1]?.transcript || '')
        });
      };

      this.recognition.onerror = (event) => {
        isResolved = true;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        if (options.onEnd) options.onEnd();
        if (!isResolved) {
          resolve({
            results: [],
            transcript: '',
            confidence: 0,
            detectedLanguage: this.currentLanguage
          });
        }
      };

      this.recognition.start();
    });
  }

  // Stop voice recognition
  stopRecognition() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }

  // Text to speech
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const detectedLang = options.language || this.detectLanguage(text);
      const config = this.getLanguageConfig(detectedLang);
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      utterance.lang = config.synthesis;
      
      // Find appropriate voice
      if (options.preferredVoice) {
        const voice = this.voices.find(v => v.name === options.preferredVoice);
        if (voice) utterance.voice = voice;
      } else {
        const voice = this.voices.find(config.voiceFilter);
        if (voice) utterance.voice = voice;
      }

      // Configure speech parameters
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      utterance.onstart = () => {
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  // Stop speaking
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Get available voices for a language
  getVoicesForLanguage(languageCode) {
    const config = this.getLanguageConfig(languageCode);
    return this.voices.filter(config.voiceFilter);
  }

  // Set current language
  setLanguage(languageCode) {
    this.currentLanguage = languageCode;
  }

  // Get current language
  getLanguage() {
    return this.currentLanguage;
  }
}

// Export singleton instance
const voiceService = new VoiceService();
export default voiceService;
