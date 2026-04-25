import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      products: 'Products',
      about: 'About',
      contact: 'Contact',
      login: 'Login',
      register: 'Register',
      dashboard: 'Dashboard',
      cart: 'Cart',
      logout: 'Logout'
    },
    // Hero
    hero: {
      title: 'Connect with East Hararghe Farmers',
      subtitle: 'Premium agricultural products directly from the source',
      cta: 'Start Shopping',
      secondaryCta: 'Sell Your Products'
    },
    // Common
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      all: 'All',
      price: 'Price',
      quantity: 'Quantity',
      total: 'Total',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous'
    },
    // Products
    products: {
      title: 'Agricultural Products',
      featured: 'Featured Products',
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      unit: 'per kg',
      farmer: 'Farmer',
      location: 'Location',
      category: 'Category'
    },
    // Cart
    cart: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      discount: 'Discount',
      total: 'Total',
      checkout: 'Checkout',
      remove: 'Remove',
      update: 'Update',
      continueShopping: 'Continue Shopping'
    },
    // Auth
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      phone: 'Phone Number',
      role: 'I am a',
      farmer: 'Farmer',
      buyer: 'Buyer',
      student: 'Student',
      expert: 'Agricultural Expert',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signUp: 'Sign Up',
      signIn: 'Sign In'
    },
    // Dashboard
    dashboard: {
      welcome: 'Welcome back',
      overview: 'Overview',
      myProducts: 'My Products',
      myOrders: 'My Orders',
      analytics: 'Analytics',
      settings: 'Settings',
      profile: 'Profile',
      notifications: 'Notifications',
      sales: 'Sales',
      revenue: 'Revenue',
      orders: 'Orders',
      views: 'Views',
      rating: 'Rating'
    },
    // Contact
    contact: {
      title: 'Contact Us',
      name: 'Your Name',
      email: 'Your Email',
      phone: 'Phone Number',
      subject: 'Subject',
      message: 'Message',
      sendMessage: 'Send Message',
      address: 'Address',
      hours: 'Business Hours'
    },
    // FAQ
    faq: {
      title: 'Frequently Asked Questions',
      search: 'Search FAQs...',
      general: 'General',
      ordering: 'Ordering & Delivery',
      farmers: 'For Farmers',
      technical: 'Technical Support',
      stillNeedHelp: 'Still Need Help?',
      contactSupport: 'Contact Support'
    }
  },
  am: {
    // Navigation
    nav: {
      home: 'መነሻ',
      products: 'ምርቶች',
      about: 'ስለ እኛ',
      contact: 'ያግኙን',
      login: 'ግባ',
      register: 'ምዝግባ',
      dashboard: 'ዳሽቦርድ',
      cart: 'የግዢ ማስቀመጫ',
      logout: 'ውጣ'
    },
    // Hero
    hero: {
      title: 'ከምስራቶች ጋር ይገናኙ',
      subtitle: 'የጥራዝ እርሻ ምርቶች በቀጥታ ከምንጭኩነቱ',
      cta: 'ግዢ ይጀምሩ',
      secondaryCta: 'ምርቶችዎን ይሽጹ'
    },
    // Common
    common: {
      loading: 'በመጫን ላይ...',
      error: 'ስህተት ተፈጥሯል',
      success: 'ተሳክቷል',
      cancel: 'ተው',
      save: 'አስቀምጥ',
      delete: 'ሰርዝ',
      edit: 'አርትዕ',
      view: 'ተመልከት',
      search: 'ፈልግ',
      filter: 'አጣራጭ',
      sort: 'አደራጭ',
      all: 'ሁሉም',
      price: 'ዋጋ',
      quantity: 'ብዛት',
      total: 'ድምር',
      submit: 'አስገባ',
      back: 'ተመለስ',
      next: 'ቀጣይ',
      previous: 'ቀዳሚ'
    },
    // Products
    products: {
      title: 'የእርሻ ምርቶች',
      featured: 'የተመረጡ ምርቶች',
      addToCart: 'ወደ ማስቀመጫ አክል',
      outOfStock: 'የለም',
      inStock: 'አለ',
      unit: 'በኪግ',
      farmer: 'አርሲ',
      location: 'አካባቢ',
      category: 'ምድብ'
    },
    // Cart
    cart: {
      title: 'የግዢ ማስቀመጫ',
      empty: 'ማስቀመጫዎ ባዶ ነው',
      subtotal: 'ንዑስ ድምር',
      shipping: 'ማስረክ',
      tax: 'ታክስ',
      discount: 'ቅናሽ',
      total: 'ድምር',
      checkout: 'መግቢያ',
      remove: 'አስወጣ',
      update: 'አዘምን',
      continueShopping: 'የግዢ ቀጠሮ ይቀጥሩ'
    },
    // Auth
    auth: {
      login: 'ግባ',
      register: 'ምዝግባ',
      email: 'ኢሜይል',
      password: 'የይለፍ ቃል',
      confirmPassword: 'የይለፍ ቃል ያረጋግጡ',
      fullName: 'ሙሉ ስም',
      phone: 'ስልክ ቁጥር',
      role: 'እኔ ነኝ',
      farmer: 'አርሲ',
      buyer: 'ገዢ',
      student: 'ተማሪ',
      expert: 'የእርሻ ሙያተኛ',
      forgotPassword: 'የይለፍ ቃል ረሳው?',
      noAccount: 'መለያ የሎትም?',
      hasAccount: 'መለያ አሎት?',
      signUp: 'ምዝግባ',
      signIn: 'ግባ'
    },
    // Dashboard
    dashboard: {
      welcome: 'እንኳን ደህና መጡ',
      overview: 'አጠቃቀም',
      myProducts: 'ምርቶቼ',
      myOrders: 'ትዕዛዛቴ',
      analytics: 'ትንታኔ',
      settings: 'ቅንብሮች',
      profile: 'መገለጫ',
      notifications: 'ማስታወሻዎች',
      sales: 'ሽውስቶች',
      revenue: 'ገቢዎች',
      orders: 'ትዕዛዛት',
      views: 'እይታዎች',
      rating: 'ንግስ'
    },
    // Contact
    contact: {
      title: 'ያግኙን',
      name: 'ስምዎ',
      email: 'ኢሜይል',
      phone: 'ስልክ ቁጥር',
      subject: 'ርዕስ',
      message: 'መልእክት',
      sendMessage: 'መልእክት ላክ',
      address: 'አድራሻ',
      hours: 'የስራ ሰዓት'
    },
    // FAQ
    faq: {
      title: 'በተወሰኑ የሚጠየቁ ጥያቄዎች',
      search: 'ጥያቄዎችን ፈልግ...',
      general: 'አጠቃቃም',
      ordering: 'ግዢ እና ማስረክ',
      farmers: 'ለአርሲዎች',
      technical: 'ቴክኒካዊ ድጋፍ',
      stillNeedHelp: 'እርስዎ አስተዋፋ ይፈልጋሉ?',
      contactSupport: 'ድጋፍ ያግኙ'
    }
  },
  or: {
    // Navigation
    nav: {
      home: 'Ganna',
      products: 'Mallattoota',
      about: 'Waa\'ee Keenya',
      contact: 'Nu Gargaaru',
      login: 'Seeni',
      register: 'Galmeessuu',
      dashboard: 'Daashibordii',
      cart: 'Gara Gatamee',
      logout: 'Bahi'
    },
    // Hero
    hero: {
      title: 'Qabxii Bultoota Harargee Bahaa Waliin',
      subtitle: 'Mallattoota qonnaa bultootaa irraa',
      cta: 'Gatii Jalqabuu',
      secondaryCta: 'Mallattoo Keessanii Galmeessuu'
    },
    // Common
    common: {
      loading: 'Fe\'amaa jira...',
      error: 'Dogoggora ta\'eera',
      success: 'Ergaa',
      cancel: 'Haqabuu',
      save: 'Qusachuu',
      delete: 'Haquu',
      edit: 'Gulaaluu',
      view: 'Ilaaluu',
      search: 'Barreessuu',
      filter: 'Qoodachiisu',
      sort: 'Sirreessuu',
      all: 'Hunduu',
      price: 'Gatii',
      quantity: 'Baay\'ina',
      total: 'Waliigaluu',
      submit: 'Erguu',
      back: 'Duubatti',
      next: 'Itti Aanee',
      previous: 'Iddoo'
    },
    // Products
    products: {
      title: 'Mallattoota Qonnaa',
      featured: 'Mallattoota Filataman',
      addToCart: 'Gara Gatamee Galchi',
      outOfStock: 'Hin jiru',
      inStock: 'Jira',
      unit: 'kiiloo irraa',
      farmer: 'Qonnaa',
      location: 'Bakka',
      category: 'Qooda'
    },
    // Cart
    cart: {
      title: 'Gara Gatamee',
      empty: 'Gara gatamee keessan bulaa',
      subtotal: 'Waliigaluu dhiiraa',
      shipping: 'Ergaa',
      tax: 'Taxii',
      discount: 'Dhiibbaa',
      total: 'Waliigaluu',
      checkout: 'Gatii',
      remove: 'Haquu',
      update: 'Haawa',
      continueShopping: 'Gatii itti fufuu'
    },
    // Auth
    auth: {
      login: 'Seeni',
      register: 'Galmeessuu',
      email: 'Iimeelii',
      password: 'Jecha Sirnaa',
      confirmPassword: 'Jecha Sirnaa Mirkaneessuu',
      fullName: 'Maqaa Guutuu',
      phone: 'Lakkoofsa Bilbila',
      role: 'Nooti',
      farmer: 'Qonnaa',
      buyer: 'Gatii',
      student: 'Barataa',
      expert: 'Qonnaa Jagoo',
      forgotPassword: 'Jecha Sirnaa hir\'aa?',
      noAccount: 'Hin qabne?',
      hasAccount: 'Qabda?',
      signUp: 'Galmeessuu',
      signIn: 'Seeni'
    },
    // Dashboard
    dashboard: {
      welcome: 'Baga nagaan dhufuttan',
      overview: 'Ilaalcha',
      myProducts: 'Mallattoo Kiyya',
      myOrders: 'Galmeessaa Kiyya',
      analytics: 'Qabxii',
      settings: 'Qindaa\'ina',
      profile: 'Madda',
      notifications: 'Beeksisota',
      sales: 'Gatii',
      revenue: 'Dhaabbii',
      orders: 'Galmeessaa',
      views: 'Ilaalcha',
      rating: 'Qabxii'
    },
    // Contact
    contact: {
      title: 'Nu Gargaaru',
      name: 'Maqaa Keessan',
      email: 'Iimeelii',
      phone: 'Lakkoofsa Bilbila',
      subject: 'Mataa',
      message: 'Ergaa',
      sendMessage: 'Ergaa Dhiyeessuu',
      address: 'Bakka',
      hours: 'Saattiin Saaytii'
    },
    // FAQ
    faq: {
      title: 'Gaaffiiwwan Beekamaan',
      search: 'Gaaffiiwwan barreessuu...',
      general: 'Garaa',
      ordering: 'Gatii fi Ergaa',
      farmers: 'Qonnaattotaaf',
      technical: 'Gargaarsa Teknikii',
      stillNeedHelp: 'Gargaarsa barbaaddaa?',
      contactSupport: 'Gargaarsa Gargaaru'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem('agrilink_language');
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('agrilink_language', lang);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
