from datetime import datetime
import uuid
from typing import Dict, List, Optional, Any

class FirestoreModel:
    """Base class for Firestore models"""
    
    def __init__(self, data: Dict = None, doc_id: str = None):
        if data:
            self.from_dict(data)
        if doc_id:
            self.id = doc_id
    
    def to_dict(self) -> Dict:
        """Convert model to dictionary for Firestore"""
        raise NotImplementedError
    
    def from_dict(self, data: Dict):
        """Populate model from dictionary"""
        raise NotImplementedError
    
    @classmethod
    def collection_name(cls) -> str:
        """Return Firestore collection name"""
        raise NotImplementedError

class Family(FirestoreModel):
    """Family profile model storing intake form data"""
    
    def __init__(self, data: Dict = None, doc_id: str = None):
        self.id = doc_id or str(uuid.uuid4())
        self.zip_code = None
        self.child_age = None
        self.budget = None
        self.availability = None
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        super().__init__(data, doc_id)
    
    @classmethod
    def collection_name(cls) -> str:
        return 'families'
    
    def to_dict(self) -> Dict:
        return {
            'zip_code': self.zip_code,
            'child_age': self.child_age,
            'budget': self.budget,
            'availability': self.availability,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    def from_dict(self, data: Dict):
        self.zip_code = data.get('zip_code')
        self.child_age = data.get('child_age')
        self.budget = data.get('budget')
        self.availability = data.get('availability')
        self.created_at = data.get('created_at', datetime.utcnow())
        self.updated_at = data.get('updated_at', datetime.utcnow())
    
    def save(self):
        """Save family to Firestore"""
        from app import db
        if not db:
            raise Exception("Firestore not initialized")
        
        self.updated_at = datetime.utcnow()
        doc_ref = db.collection(self.collection_name()).document(self.id)
        doc_ref.set(self.to_dict())
        return self.id
    
    @classmethod
    def get(cls, family_id: str) -> Optional['Family']:
        """Get family by ID"""
        from app import db
        if not db:
            return None
        
        doc_ref = db.collection(cls.collection_name()).document(family_id)
        doc = doc_ref.get()
        
        if doc.exists:
            return cls(doc.to_dict(), doc.id)
        return None

class FamilyPriorities(FirestoreModel):
    """Family priority values for happiness, success, social, health"""
    
    def __init__(self, data: Dict = None, doc_id: str = None):
        self.family_id = None
        self.happiness = 0.0
        self.success = 0.0
        self.social = 0.0
        self.health = 0.0
        self.updated_at = datetime.utcnow()
        super().__init__(data, doc_id)
    
    @classmethod
    def collection_name(cls) -> str:
        return 'family_priorities'
    
    def to_dict(self) -> Dict:
        return {
            'family_id': self.family_id,
            'happiness': self.happiness,
            'success': self.success,
            'social': self.social,
            'health': self.health,
            'updated_at': self.updated_at
        }
    
    def from_dict(self, data: Dict):
        self.family_id = data.get('family_id')
        self.happiness = data.get('happiness', 0.0)
        self.success = data.get('success', 0.0)
        self.social = data.get('social', 0.0)
        self.health = data.get('health', 0.0)
        self.updated_at = data.get('updated_at', datetime.utcnow())
    
    def save(self):
        """Save priorities to Firestore"""
        from app import db
        if not db:
            raise Exception("Firestore not initialized")
        
        self.updated_at = datetime.utcnow()
        # Use family_id as document ID for easy lookup
        doc_ref = db.collection(self.collection_name()).document(self.family_id)
        doc_ref.set(self.to_dict())
        return self.family_id
    
    @classmethod
    def get_by_family(cls, family_id: str) -> Optional['FamilyPriorities']:
        """Get priorities by family ID"""
        from app import db
        if not db:
            return None
        
        doc_ref = db.collection(cls.collection_name()).document(family_id)
        doc = doc_ref.get()
        
        if doc.exists:
            return cls(doc.to_dict(), doc.id)
        return None

class KidTraits(FirestoreModel):
    """Child personality traits from quiz responses"""
    
    def __init__(self, data: Dict = None, doc_id: str = None):
        self.family_id = None
        self.creativity = 0.0
        self.sociability = 0.0
        self.outdoors = 0.0
        self.energy = 0.0
        self.curiosity = 0.0
        self.kinesthetic = 0.0
        self.completed_at = datetime.utcnow()
        super().__init__(data, doc_id)
    
    @classmethod
    def collection_name(cls) -> str:
        return 'kid_traits'
    
    def to_dict(self) -> Dict:
        return {
            'family_id': self.family_id,
            'creativity': self.creativity,
            'sociability': self.sociability,
            'outdoors': self.outdoors,
            'energy': self.energy,
            'curiosity': self.curiosity,
            'kinesthetic': self.kinesthetic,
            'completed_at': self.completed_at
        }
    
    def from_dict(self, data: Dict):
        self.family_id = data.get('family_id')
        self.creativity = data.get('creativity', 0.0)
        self.sociability = data.get('sociability', 0.0)
        self.outdoors = data.get('outdoors', 0.0)
        self.energy = data.get('energy', 0.0)
        self.curiosity = data.get('curiosity', 0.0)
        self.kinesthetic = data.get('kinesthetic', 0.0)
        self.completed_at = data.get('completed_at', datetime.utcnow())
    
    def save(self):
        """Save traits to Firestore"""
        from app import db
        if not db:
            raise Exception("Firestore not initialized")
        
        # Use family_id as document ID for easy lookup
        doc_ref = db.collection(self.collection_name()).document(self.family_id)
        doc_ref.set(self.to_dict())
        return self.family_id
    
    @classmethod
    def get_by_family(cls, family_id: str) -> Optional['KidTraits']:
        """Get traits by family ID"""
        from app import db
        if not db:
            return None
        
        doc_ref = db.collection(cls.collection_name()).document(family_id)
        doc = doc_ref.get()
        
        if doc.exists:
            return cls(doc.to_dict(), doc.id)
        return None

class Activity(FirestoreModel):
    """Available activities and programs"""
    
    def __init__(self, data: Dict = None, doc_id: str = None):
        self.id = doc_id or str(uuid.uuid4())
        self.title = None
        self.description = None
        self.category = None
        self.price_monthly = None
        self.age_min = None
        self.age_max = None
        self.latitude = None
        self.longitude = None
        self.address = None
        self.phone = None
        self.website = None
        self.created_at = datetime.utcnow()
        super().__init__(data, doc_id)
    
    @classmethod
    def collection_name(cls) -> str:
        return 'activities'
    
    def to_dict(self) -> Dict:
        return {
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'price_monthly': self.price_monthly,
            'age_min': self.age_min,
            'age_max': self.age_max,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'address': self.address,
            'phone': self.phone,
            'website': self.website,
            'created_at': self.created_at
        }
    
    def from_dict(self, data: Dict):
        self.title = data.get('title')
        self.description = data.get('description')
        self.category = data.get('category')
        self.price_monthly = data.get('price_monthly')
        self.age_min = data.get('age_min')
        self.age_max = data.get('age_max')
        self.latitude = data.get('latitude')
        self.longitude = data.get('longitude')
        self.address = data.get('address')
        self.phone = data.get('phone')
        self.website = data.get('website')
        self.created_at = data.get('created_at', datetime.utcnow())
    
    def save(self):
        """Save activity to Firestore"""
        from app import db
        if not db:
            raise Exception("Firestore not initialized")
        
        doc_ref = db.collection(self.collection_name()).document(self.id)
        doc_ref.set(self.to_dict())
        return self.id
    
    @classmethod
    def get_all(cls) -> List['Activity']:
        """Get all activities"""
        from app import db
        if not db:
            return []
        
        activities = []
        docs = db.collection(cls.collection_name()).stream()
        
        for doc in docs:
            activities.append(cls(doc.to_dict(), doc.id))
        
        return activities
    
    @classmethod
    def get_by_category(cls, category: str) -> List['Activity']:
        """Get activities by category"""
        from app import db
        if not db:
            return []
        
        activities = []
        docs = db.collection(cls.collection_name()).where('category', '==', category).stream()
        
        for doc in docs:
            activities.append(cls(doc.to_dict(), doc.id))
        
        return activities

class Recommendation(FirestoreModel):
    """AI-generated recommendations linking families to activities"""
    
    def __init__(self, data: Dict = None, doc_id: str = None):
        self.id = doc_id or str(uuid.uuid4())
        self.family_id = None
        self.activity_id = None
        self.category = None
        self.match_score = 0.0
        self.ai_explanation = None
        self.generated_at = datetime.utcnow()
        super().__init__(data, doc_id)
    
    @classmethod
    def collection_name(cls) -> str:
        return 'recommendations'
    
    def to_dict(self) -> Dict:
        return {
            'family_id': self.family_id,
            'activity_id': self.activity_id,
            'category': self.category,
            'match_score': self.match_score,
            'ai_explanation': self.ai_explanation,
            'generated_at': self.generated_at
        }
    
    def from_dict(self, data: Dict):
        self.family_id = data.get('family_id')
        self.activity_id = data.get('activity_id')
        self.category = data.get('category')
        self.match_score = data.get('match_score', 0.0)
        self.ai_explanation = data.get('ai_explanation')
        self.generated_at = data.get('generated_at', datetime.utcnow())
    
    def save(self):
        """Save recommendation to Firestore"""
        from app import db
        if not db:
            raise Exception("Firestore not initialized")
        
        doc_ref = db.collection(self.collection_name()).document(self.id)
        doc_ref.set(self.to_dict())
        return self.id
    
    @classmethod
    def get_by_family(cls, family_id: str) -> List['Recommendation']:
        """Get recommendations by family ID"""
        from app import db
        if not db:
            return []
        
        recommendations = []
        docs = db.collection(cls.collection_name()).where('family_id', '==', family_id).stream()
        
        for doc in docs:
            recommendations.append(cls(doc.to_dict(), doc.id))
        
        return recommendations

class SuccessStory(FirestoreModel):
    """Success stories from families with similar backgrounds"""
    
    def __init__(self, data: Dict = None, doc_id: str = None):
        self.id = doc_id or str(uuid.uuid4())
        self.title = None
        self.summary = None
        self.full_story = None
        self.child_age_start = None
        self.child_age_end = None
        self.family_budget_range = None
        self.key_strategies = []
        self.outcomes = []
        self.geographic_region = None
        self.socioeconomic_tags = []
        self.trait_profile = {}
        self.created_at = datetime.utcnow()
        super().__init__(data, doc_id)
    
    @classmethod
    def collection_name(cls) -> str:
        return 'success_stories'
    
    def to_dict(self) -> Dict:
        return {
            'title': self.title,
            'summary': self.summary,
            'full_story': self.full_story,
            'child_age_start': self.child_age_start,
            'child_age_end': self.child_age_end,
            'family_budget_range': self.family_budget_range,
            'key_strategies': self.key_strategies,
            'outcomes': self.outcomes,
            'geographic_region': self.geographic_region,
            'socioeconomic_tags': self.socioeconomic_tags,
            'trait_profile': self.trait_profile,
            'created_at': self.created_at
        }
    
    def from_dict(self, data: Dict):
        self.title = data.get('title')
        self.summary = data.get('summary')
        self.full_story = data.get('full_story')
        self.child_age_start = data.get('child_age_start')
        self.child_age_end = data.get('child_age_end')
        self.family_budget_range = data.get('family_budget_range')
        self.key_strategies = data.get('key_strategies', [])
        self.outcomes = data.get('outcomes', [])
        self.geographic_region = data.get('geographic_region')
        self.socioeconomic_tags = data.get('socioeconomic_tags', [])
        self.trait_profile = data.get('trait_profile', {})
        self.created_at = data.get('created_at', datetime.utcnow())
    
    def save(self):
        """Save success story to Firestore"""
        from app import db
        if not db:
            raise Exception("Firestore not initialized")
        
        doc_ref = db.collection(self.collection_name()).document(self.id)
        doc_ref.set(self.to_dict())
        return self.id
    
    @classmethod
    def get_all(cls) -> List['SuccessStory']:
        """Get all success stories"""
        from app import db
        if not db:
            return []
        
        stories = []
        docs = db.collection(cls.collection_name()).stream()
        
        for doc in docs:
            stories.append(cls(doc.to_dict(), doc.id))
        
        return stories