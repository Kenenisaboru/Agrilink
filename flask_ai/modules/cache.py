"""
AgriLink TTL Cache
------------------
Simple in-memory cache with time-to-live expiry.
Prevents redundant Gemini API calls for identical queries.

Usage:
    from modules.cache import cache
    
    result = cache.get("predict:teff:July")
    if result is None:
        result = expensive_call()
        cache.set("predict:teff:July", result, ttl=1800)  # 30 min TTL
"""

import time
import threading
from typing import Any, Optional


class TTLCache:
    """Thread-safe in-memory cache with per-key TTL expiry."""

    def __init__(self):
        self._store: dict = {}           # key → {"value": ..., "expires_at": float}
        self._lock = threading.Lock()
        self._hits = 0
        self._misses = 0

    def get(self, key: str) -> Optional[Any]:
        """Return cached value if it exists and hasn't expired."""
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                self._misses += 1
                return None
            if time.time() > entry["expires_at"]:
                del self._store[key]
                self._misses += 1
                return None
            self._hits += 1
            return entry["value"]

    def set(self, key: str, value: Any, ttl: int = 1800) -> None:
        """Store a value with a TTL in seconds (default: 30 minutes)."""
        with self._lock:
            self._store[key] = {
                "value": value,
                "expires_at": time.time() + ttl
            }

    def delete(self, key: str) -> None:
        """Remove a specific key from the cache."""
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> None:
        """Flush all cached entries."""
        with self._lock:
            self._store.clear()

    def stats(self) -> dict:
        """Return cache performance statistics."""
        with self._lock:
            total = self._hits + self._misses
            hit_rate = round(self._hits / total * 100, 1) if total > 0 else 0
            return {
                "entries": len(self._store),
                "hits": self._hits,
                "misses": self._misses,
                "hit_rate_percent": hit_rate
            }

    def cleanup_expired(self) -> int:
        """Remove all expired entries. Returns count of evicted entries."""
        now = time.time()
        with self._lock:
            expired_keys = [k for k, v in self._store.items() if now > v["expires_at"]]
            for key in expired_keys:
                del self._store[key]
            return len(expired_keys)


# ── Global singleton instance ─────────────────────────────────────────────────
cache = TTLCache()

# TTL constants (seconds)
TTL_PRICE_PREDICTION = 1800   # 30 min — prices don't change that fast
TTL_WEATHER_ALERT    = 3600   # 60 min — weather context is stable
TTL_RECOMMENDATIONS  = 2700   # 45 min — recommendations are semi-static
TTL_CHAT_RESPONSE    = 300    # 5 min  — only cache very common identical queries
