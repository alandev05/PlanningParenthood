import json
import logging
from typing import Any, Optional
from app import redis_client

logger = logging.getLogger(__name__)

class CacheService:
    """Redis-based caching service for recommendations and session data"""
    
    def __init__(self):
        self.redis = redis_client
        self.default_ttl = 3600  # 1 hour default TTL
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.redis:
            return None
        
        try:
            value = self.redis.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            logger.warning(f"Cache get error for key {key}: {e}")
        
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL"""
        if not self.redis:
            return False
        
        try:
            ttl = ttl or self.default_ttl
            serialized_value = json.dumps(value, default=str)
            return self.redis.setex(key, ttl, serialized_value)
        except Exception as e:
            logger.warning(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.redis:
            return False
        
        try:
            return bool(self.redis.delete(key))
        except Exception as e:
            logger.warning(f"Cache delete error for key {key}: {e}")
            return False
    
    def get_recommendations(self, family_id: str) -> Optional[list]:
        """Get cached recommendations for a family"""
        return self.get(f"recommendations:{family_id}")
    
    def set_recommendations(self, family_id: str, recommendations: list, ttl: int = 7200) -> bool:
        """Cache recommendations for a family (2 hour TTL by default)"""
        return self.set(f"recommendations:{family_id}", recommendations, ttl)
    
    def invalidate_recommendations(self, family_id: str) -> bool:
        """Invalidate cached recommendations when family profile changes"""
        return self.delete(f"recommendations:{family_id}")
    
    def get_chat_history(self, family_id: str) -> Optional[list]:
        """Get cached chat history for a family"""
        return self.get(f"chat_history:{family_id}")
    
    def set_chat_history(self, family_id: str, messages: list, ttl: int = 86400) -> bool:
        """Cache chat history for a family (24 hour TTL)"""
        return self.set(f"chat_history:{family_id}", messages, ttl)
    
    def append_chat_message(self, family_id: str, message: dict) -> bool:
        """Append a new message to chat history"""
        history = self.get_chat_history(family_id) or []
        history.append(message)
        
        # Keep only last 50 messages
        if len(history) > 50:
            history = history[-50:]
        
        return self.set_chat_history(family_id, history)

# Global cache service instance
cache_service = CacheService()