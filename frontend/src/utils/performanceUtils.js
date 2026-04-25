/**
 * Performance Optimization and Caching Utilities for AgriLink Platform
 * Provides caching, lazy loading, and performance optimization functions
 */

/**
 * Simple in-memory cache with TTL support
 */
class Cache {
  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * LocalStorage cache with automatic cleanup
 */
class LocalStorageCache {
  constructor(prefix = 'agrilink_') {
    this.prefix = prefix;
  }

  set(key, value, ttl = 5 * 60 * 1000) {
    const expiry = Date.now() + ttl;
    const item = { value, expiry };
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }

  get(key) {
    try {
      const item = JSON.parse(localStorage.getItem(this.prefix + key));
      if (!item) return null;

      if (Date.now() > item.expiry) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return item.value;
    } catch {
      return null;
    }
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    localStorage.removeItem(this.prefix + key);
  }

  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }

  // Clean up expired items
  cleanup() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && Date.now() > item.expiry) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      });
  }
}

/**
 * Image lazy loading with intersection observer
 */
export const lazyLoadImage = (imgElement, src, placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E') => {
  imgElement.src = placeholder;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        imgElement.src = src;
        imgElement.classList.add('loaded');
        observer.unobserve(imgElement);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  observer.observe(imgElement);
  return observer;
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Memoization cache for expensive computations
 */
export const memoize = (func, keyGenerator = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return (...args) => {
    const key = keyGenerator(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Prefetch resources for better performance
 */
export const prefetchResource = (url, type = 'fetch') => {
  if (type === 'fetch') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  } else if (type === 'script') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = url;
    document.head.appendChild(link);
  } else if (type === 'style') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = url;
    document.head.appendChild(link);
  }
};

/**
 * Measure performance metrics
 */
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then(res => {
      const end = performance.now();
      console.log(`${name} took ${(end - start).toFixed(2)}ms`);
      return res;
    });
  } else {
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  }
};

/**
 * Get performance metrics from Performance API
 */
export const getPerformanceMetrics = () => {
  if (!window.performance || !window.performance.timing) {
    return null;
  }

  const timing = window.performance.timing;
  const navigation = performance.getEntriesByType('navigation')[0];

  return {
    // Page load timing
    domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
    pageLoad: timing.loadEventEnd - timing.loadEventStart,
    
    // Network timing
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    request: timing.responseStart - timing.requestStart,
    response: timing.responseEnd - timing.responseStart,
    
    // Resource timing
    totalLoadTime: timing.loadEventEnd - timing.navigationStart,
    
    // Navigation timing (if available)
    navigationStart: navigation?.startTime,
    domInteractive: navigation?.domInteractive,
    domComplete: navigation?.domComplete,
    loadComplete: navigation?.loadEventEnd
  };
};

/**
 * Optimize images by using WebP format with fallback
 */
export const getOptimizedImageUrl = (originalUrl, width = 800, quality = 80) => {
  // This would typically use an image optimization service
  // For now, return the original URL
  return originalUrl;
};

/**
 * Batch API requests to reduce network calls
 */
export const batchRequests = async (requests, batchSize = 5) => {
  const results = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(request => request())
    );
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Virtual scroll helper for large lists
 */
export const virtualScroll = {
  calculateVisibleRange: (scrollTop, itemHeight, containerHeight, totalItems) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      totalItems - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight)
    );
    
    // Add buffer for smooth scrolling
    const buffer = 5;
    const visibleStart = Math.max(0, startIndex - buffer);
    const visibleEnd = Math.min(totalItems - 1, endIndex + buffer);
    
    return {
      startIndex: visibleStart,
      endIndex: visibleEnd,
      offsetY: visibleStart * itemHeight
    };
  }
};

/**
 * Service Worker registration for offline support
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

/**
 * Check if device is low-end for performance optimization
 */
export const isLowEndDevice = () => {
  // Check device memory if available
  if (navigator.deviceMemory && navigator.deviceMemory < 4) {
    return true;
  }
  
  // Check connection type
  if (navigator.connection) {
    const connection = navigator.connection;
    if (connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        connection.saveData) {
      return true;
    }
  }
  
  // Check hardware concurrency
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }
  
  return false;
};

/**
 * Adaptive quality based on device capabilities
 */
export const getAdaptiveQuality = () => {
  if (isLowEndDevice()) {
    return {
      imageQuality: 60,
      animationEnabled: false,
      lazyLoadThreshold: 0.1,
      prefetchEnabled: false
    };
  }
  
  return {
    imageQuality: 85,
    animationEnabled: true,
    lazyLoadThreshold: 0.01,
    prefetchEnabled: true
  };
};

/**
 * Cache management
 */
export const cacheManager = {
  memory: new Cache(),
  storage: new LocalStorageCache(),
  
  set: (key, value, options = {}) => {
    const { useStorage = false, ttl } = options;
    if (useStorage) {
      cacheManager.storage.set(key, value, ttl);
    } else {
      cacheManager.memory.set(key, value, ttl);
    }
  },
  
  get: (key, options = {}) => {
    const { useStorage = false } = options;
    if (useStorage) {
      return cacheManager.storage.get(key);
    } else {
      return cacheManager.memory.get(key);
    }
  },
  
  clear: () => {
    cacheManager.memory.clear();
    cacheManager.storage.clear();
  },
  
  cleanup: () => {
    cacheManager.storage.cleanup();
  }
};

/**
 * Performance monitoring
 */
export const performanceMonitor = {
  marks: new Map(),
  
  mark: (name) => {
    performance.mark(name);
    performanceMonitor.marks.set(name, performance.now());
  },
  
  measure: (name, startMark, endMark) => {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure.duration;
    } catch (error) {
      console.error('Performance measure error:', error);
      return null;
    }
  },
  
  getMetrics: () => {
    return getPerformanceMetrics();
  },
  
  clearMarks: () => {
    performanceMonitor.marks.clear();
    performance.clearMarks();
  }
};

export default {
  Cache,
  LocalStorageCache,
  lazyLoadImage,
  debounce,
  throttle,
  memoize,
  prefetchResource,
  measurePerformance,
  getPerformanceMetrics,
  getOptimizedImageUrl,
  batchRequests,
  virtualScroll,
  registerServiceWorker,
  isLowEndDevice,
  getAdaptiveQuality,
  cacheManager,
  performanceMonitor
};
