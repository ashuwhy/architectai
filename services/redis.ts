// Browser-compatible caching service
// Note: Redis is not available in browser environment, using localStorage/sessionStorage as fallback

interface CacheItem {
  value: any;
  expiry: number;
  timestamp: number;
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Browser-compatible storage
const getStorage = () => {
  if (!isBrowser) return null;
  try {
    return localStorage;
  } catch {
    return sessionStorage;
  }
};

// Helper functions for browser storage
const setCacheItem = (key: string, value: any, ttl: number) => {
  if (!isBrowser) return false;
  const storage = getStorage();
  if (!storage) return false;
  
  try {
    const item: CacheItem = {
      value,
      expiry: Date.now() + (ttl * 1000),
      timestamp: Date.now()
    };
    storage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('❌ Failed to set cache item:', error);
    return false;
  }
};

const getCacheItem = (key: string) => {
  if (!isBrowser) return null;
  const storage = getStorage();
  if (!storage) return null;
  
  try {
    const itemStr = storage.getItem(key);
    if (!itemStr) return null;
    
    const item: CacheItem = JSON.parse(itemStr);
    
    // Check if expired
    if (Date.now() > item.expiry) {
      storage.removeItem(key);
      return null;
    }
    
    return item.value;
  } catch (error) {
    console.error('❌ Failed to get cache item:', error);
    return null;
  }
};

const removeCacheItem = (key: string) => {
  if (!isBrowser) return false;
  const storage = getStorage();
  if (!storage) return false;
  
  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error('❌ Failed to remove cache item:', error);
    return false;
  }
};

const incrementCounter = (key: string, window: number) => {
  if (!isBrowser) return { count: 1, resetTime: Date.now() + (window * 1000) };
  const storage = getStorage();
  if (!storage) return { count: 1, resetTime: Date.now() + (window * 1000) };
  
  try {
    const existing = storage.getItem(key);
    let data: RateLimitData;
    
    if (existing) {
      data = JSON.parse(existing);
      if (Date.now() > data.resetTime) {
        data = { count: 1, resetTime: Date.now() + (window * 1000) };
      } else {
        data.count++;
      }
    } else {
      data = { count: 1, resetTime: Date.now() + (window * 1000) };
    }
    
    storage.setItem(key, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('❌ Failed to increment counter:', error);
    return { count: 1, resetTime: Date.now() + (window * 1000) };
  }
};

// Mock Redis client for browser compatibility
const mockClient = {
  connected: true,
  connect: async () => {
    console.log('✅ Browser cache initialized (localStorage/sessionStorage)');
    return true;
  },
  setEx: async (key: string, ttl: number, value: string) => {
    return setCacheItem(key, value, ttl);
  },
  get: async (key: string) => {
    return getCacheItem(key);
  },
  del: async (key: string) => {
    return removeCacheItem(key);
  },
  incr: async (key: string) => {
    const data = incrementCounter(key, 3600); // Default 1 hour window
    return data.count;
  },
  expire: async (key: string, ttl: number) => {
    // Browser storage doesn't support TTL directly, handled in getCacheItem
    return true;
  },
  ttl: async (key: string) => {
    if (!isBrowser) return -1;
    const storage = getStorage();
    if (!storage) return -1;
    
    try {
      const itemStr = storage.getItem(key);
      if (!itemStr) return -2;
      
      const item: CacheItem = JSON.parse(itemStr);
      const remaining = Math.floor((item.expiry - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    } catch {
      return -1;
    }
  },
  lPush: async (key: string, value: string) => {
    if (!isBrowser) return 0;
    const storage = getStorage();
    if (!storage) return 0;
    
    try {
      const existing = storage.getItem(key);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(value);
      storage.setItem(key, JSON.stringify(list));
      return list.length;
    } catch {
      return 0;
    }
  },
  lRange: async (key: string, start: number, end: number) => {
    if (!isBrowser) return [];
    const storage = getStorage();
    if (!storage) return [];
    
    try {
      const existing = storage.getItem(key);
      if (!existing) return [];
      
      const list = JSON.parse(existing);
      return list.slice(start, end + 1);
    } catch {
      return [];
    }
  },
  lTrim: async (key: string, start: number, end: number) => {
    if (!isBrowser) return true;
    const storage = getStorage();
    if (!storage) return true;
    
    try {
      const existing = storage.getItem(key);
      if (!existing) return true;
      
      const list = JSON.parse(existing);
      const trimmed = list.slice(start, end + 1);
      storage.setItem(key, JSON.stringify(trimmed));
      return true;
    } catch {
      return false;
    }
  },
  hIncrBy: async (key: string, field: string, increment: number) => {
    if (!isBrowser) return 0;
    const storage = getStorage();
    if (!storage) return 0;
    
    try {
      const existing = storage.getItem(key);
      const hash = existing ? JSON.parse(existing) : {};
      hash[field] = (hash[field] || 0) + increment;
      storage.setItem(key, JSON.stringify(hash));
      return hash[field];
    } catch {
      return 0;
    }
  },
  hGetAll: async (key: string) => {
    if (!isBrowser) return {};
    const storage = getStorage();
    if (!storage) return {};
    
    try {
      const existing = storage.getItem(key);
      return existing ? JSON.parse(existing) : {};
    } catch {
      return {};
    }
  },
  keys: async (pattern: string) => {
    if (!isBrowser) return [];
    const storage = getStorage();
    if (!storage) return [];
    
    try {
      const keys = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.includes(pattern.replace('*', ''))) {
          keys.push(key);
        }
      }
      return keys;
    } catch {
      return [];
    }
  },
  info: async () => {
    return 'Browser Cache (localStorage/sessionStorage)';
  }
};

// Use mock client in browser environment
const client = mockClient;

// Initialize connection
client.connect();

// ==================== AI RESPONSE CACHING ====================

// Safe encoding function that handles Unicode characters
const safeEncode = (str: string): string => {
  try {
    // Use encodeURIComponent for Unicode-safe encoding
    return encodeURIComponent(str).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);
  } catch (error) {
    // Fallback to simple hash if encoding fails
    return str.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);
  }
};

export const cacheAIResponse = async (prompt: string, response: any, ttl?: number) => {
  try {
    const defaultTtl = parseInt(process.env.AI_RESPONSE_CACHE_TTL || '3600');
    const cacheTtl = ttl || defaultTtl;
    const cacheKey = `ai_response:${safeEncode(prompt)}`;
    await client.setEx(cacheKey, cacheTtl, JSON.stringify(response));
    console.log('💾 AI response cached:', cacheKey, `TTL: ${cacheTtl}s`);
    return true;
  } catch (error) {
    console.error('❌ Failed to cache AI response:', error);
    return false;
  }
};

export const getCachedAIResponse = async (prompt: string) => {
  try {
    const cacheKey = `ai_response:${safeEncode(prompt)}`;
    const cached = await client.get(cacheKey);
    if (cached) {
      console.log('⚡ AI response cache hit:', cacheKey);
      return JSON.parse(cached as string);
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to get cached AI response:', error);
    return null;
  }
};

// ==================== GEMINI API KEY CACHING ====================

export const cacheGeminiApiKey = async (userId: string, apiKey: string, ttl?: number) => {
  try {
    const defaultTtl = parseInt(process.env.GEMINI_API_KEY_CACHE_TTL || '300'); // 5 minutes default
    const cacheTtl = ttl || defaultTtl;
    const cacheKey = `gemini_api_key:${userId}`;
    
    // Encrypt or hash the API key before storing (basic obfuscation)
    const obfuscatedKey = encodeURIComponent(apiKey).split('').reverse().join('');
    await client.setEx(cacheKey, cacheTtl, obfuscatedKey);
    console.log('🔑 Gemini API key cached for user:', userId, `TTL: ${cacheTtl}s`);
    return true;
  } catch (error) {
    console.error('❌ Failed to cache Gemini API key:', error);
    return false;
  }
};

export const getCachedGeminiApiKey = async (userId: string) => {
  try {
    const cacheKey = `gemini_api_key:${userId}`;
    const cached = await client.get(cacheKey);
    if (cached) {
      // Deobfuscate the API key
      const apiKey = decodeURIComponent((cached as string).split('').reverse().join(''));
      console.log('🔑 Gemini API key cache hit for user:', userId);
      return apiKey;
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to get cached Gemini API key:', error);
    return null;
  }
};

export const clearCachedGeminiApiKey = async (userId: string) => {
  try {
    const cacheKey = `gemini_api_key:${userId}`;
    await client.del(cacheKey);
    console.log('🗑️ Cached Gemini API key cleared for user:', userId);
    return true;
  } catch (error) {
    console.error('❌ Failed to clear cached Gemini API key:', error);
    return false;
  }
};

// ==================== RATE LIMITING ====================

export const checkRateLimit = async (
  userId: string, 
  limit?: number, 
  window?: number
) => {
  try {
    // Use environment variables with fallbacks
    const defaultLimit = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_HOUR || '10');
    const defaultWindow = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '3600');
    
    const rateLimit = limit || defaultLimit;
    const timeWindow = window || defaultWindow;
    
    const key = `rate_limit:${userId}`;
    
    // Use browser-compatible rate limiting
    const data = incrementCounter(key, timeWindow);
    const current = data.count;
    const remaining = Math.max(0, rateLimit - current);
    const isAllowed = current <= rateLimit;
    const ttl = Math.floor((data.resetTime - Date.now()) / 1000);
    
    console.log(`🚦 Rate limit check - User: ${userId}, Used: ${current}/${rateLimit}, Remaining: ${remaining}, TTL: ${ttl}s, Allowed: ${isAllowed}`);
    
    return {
      allowed: isAllowed,
      used: current,
      remaining,
      limit: rateLimit,
      window: timeWindow,
      resetTime: data.resetTime,
      ttl: Math.max(0, ttl)
    };
  } catch (error) {
    console.error('❌ Rate limit check failed:', error);
    // Fail open - allow request if cache is unavailable
    const fallbackLimit = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_HOUR || '10');
    return { 
      allowed: true, 
      used: 0, 
      remaining: fallbackLimit,
      limit: fallbackLimit,
      window: parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '3600'),
      resetTime: Date.now() + 3600000,
      ttl: 3600,
      error: 'Rate limiting unavailable'
    };
  }
};

// ==================== REAL-TIME STATUS ====================

export const setGenerationStatus = async (userId: string, docId: string, status: any) => {
  try {
    const key = `generation:${userId}:${docId}`;
    await client.setEx(key, 1800, JSON.stringify({
      ...status,
      timestamp: Date.now(),
      userId,
      docId
    }));
    console.log('📊 Generation status updated:', key, status);
    return true;
  } catch (error) {
    console.error('❌ Failed to set generation status:', error);
    return false;
  }
};

export const getGenerationStatus = async (userId: string, docId: string) => {
  try {
    const key = `generation:${userId}:${docId}`;
    const status = await client.get(key);
    return status ? JSON.parse(status as string) : null;
  } catch (error) {
    console.error('❌ Failed to get generation status:', error);
    return null;
  }
};

export const clearGenerationStatus = async (userId: string, docId: string) => {
  try {
    const key = `generation:${userId}:${docId}`;
    await client.del(key);
    console.log('🗑️ Generation status cleared:', key);
    return true;
  } catch (error) {
    console.error('❌ Failed to clear generation status:', error);
    return false;
  }
};

// ==================== USER ANALYTICS ====================

export const trackUserActivity = async (userId: string, activity: any) => {
  try {
    const key = `activity:${userId}`;
    const activityData = {
      ...activity,
      timestamp: Date.now(),
      userId
    };
    
    // Add to activity list (keep last 100 activities)
    await client.lPush(key, JSON.stringify(activityData));
    await client.lTrim(key, 0, 99);
    // Note: Browser storage doesn't support automatic expiration, handled in getCacheItem
    
    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `stats:${userId}:${today}`;
    await client.hIncrBy(statsKey, activity.type || 'unknown', 1);
    
    console.log('📈 User activity tracked:', activity.type, userId);
    return true;
  } catch (error) {
    console.error('❌ Failed to track user activity:', error);
    return false;
  }
};

export const getUserActivity = async (userId: string, limit: number = 50) => {
  try {
    const key = `activity:${userId}`;
    const activities = await client.lRange(key, 0, limit - 1);
    return activities.map(activity => JSON.parse(activity as string));
  } catch (error) {
    console.error('❌ Failed to get user activity:', error);
    return [];
  }
};

export const getUserStats = async (userId: string, days: number = 7) => {
  try {
    const stats = {};
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const key = `stats:${userId}:${dateStr}`;
      const dayStats = await client.hGetAll(key);
      stats[dateStr] = dayStats;
    }
    
    return stats;
  } catch (error) {
    console.error('❌ Failed to get user stats:', error);
    return {};
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const getRedisInfo = async () => {
  try {
    const info = await client.info();
    return { info };
  } catch (error) {
    console.error('❌ Failed to get cache info:', error);
    return null;
  }
};

export const clearUserData = async (userId: string) => {
  try {
    const keys = await client.keys(`*:${userId}:*`) as string[];
    if (keys.length > 0) {
      for (const key of keys) {
        await client.del(key);
      }
      console.log('🗑️ Cleared user data:', keys.length, 'keys');
    }
    return true;
  } catch (error) {
    console.error('❌ Failed to clear user data:', error);
    return false;
  }
};

export default client;
