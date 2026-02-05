"""Response caching utility for FastAPI endpoints"""
from functools import wraps
from time import time
from typing import Any, Callable, Dict, Optional, Tuple
import json
import hashlib
import logging

logger = logging.getLogger(__name__)


class ResponseCache:
    """In-memory cache for API responses with TTL support"""
    
    def __init__(self):
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self._hit_count = 0
        self._miss_count = 0
    
    def cache_response(self, ttl_seconds: int = 300):
        """
        Decorator to cache function responses
        
        Args:
            ttl_seconds: Time-to-live for cached responses in seconds (default: 5 minutes)
        """
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Create cache key from function name and arguments
                cache_key = self._make_cache_key(func.__name__, args, kwargs)
                
                # Check if cached and not expired
                if cache_key in self._cache:
                    cached_data, timestamp = self._cache[cache_key]
                    age = time() - timestamp
                    
                    if age < ttl_seconds:
                        self._hit_count += 1
                        logger.info(f"✅ Cache HIT for {func.__name__} (age: {age:.1f}s, hit rate: {self.get_hit_rate():.1%})")
                        return cached_data
                    else:
                        # Expired, remove from cache
                        del self._cache[cache_key]
                
                # Cache miss - call function
                self._miss_count += 1
                logger.info(f"❌ Cache MISS for {func.__name__} (hit rate: {self.get_hit_rate():.1%})")
                
                result = await func(*args, **kwargs)
                
                # Store in cache with timestamp
                self._cache[cache_key] = (result, time())
                
                return result
            
            return wrapper
        return decorator
    
    def _make_cache_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Create a unique cache key from function name and arguments"""
        try:
            # Filter out 'self' from args for class methods
            filtered_args = args[1:] if args and hasattr(args[0], '__dict__') else args
            
            key_data = {
                "func": func_name,
                "args": str(filtered_args),
                "kwargs": str(sorted(kwargs.items()))
            }
            key_string = json.dumps(key_data, sort_keys=True)
            return hashlib.md5(key_string.encode()).hexdigest()
        except Exception as e:
            logger.warning(f"Failed to create cache key: {e}, using fallback")
            return hashlib.md5(f"{func_name}_{time()}".encode()).hexdigest()
    
    def clear_cache(self):
        """Clear all cached responses"""
        count = len(self._cache)
        self._cache.clear()
        logger.info(f"🧹 Cleared {count} cached responses")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self._hit_count + self._miss_count
        hit_rate = self._hit_count / total_requests if total_requests > 0 else 0
        
        return {
            "cache_size": len(self._cache),
            "total_requests": total_requests,
            "cache_hits": self._hit_count,
            "cache_misses": self._miss_count,
            "hit_rate": f"{hit_rate:.1%}",
            "memory_items": len(self._cache)
        }
    
    def get_hit_rate(self) -> float:
        """Get current hit rate as a float between 0 and 1"""
        total = self._hit_count + self._miss_count
        return self._hit_count / total if total > 0 else 0
    
    def cleanup_expired(self, ttl_seconds: int = 300):
        """Remove expired entries from cache"""
        current_time = time()
        expired_keys = [
            key for key, (_, timestamp) in self._cache.items()
            if current_time - timestamp > ttl_seconds
        ]
        
        for key in expired_keys:
            del self._cache[key]
        
        if expired_keys:
            logger.info(f"🧹 Cleaned up {len(expired_keys)} expired cache entries")


# Global cache instance
response_cache = ResponseCache()
