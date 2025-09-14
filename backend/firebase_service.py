import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

class FirebaseService:
    def __init__(self):
        if not firebase_admin._apps:
            cred = credentials.Certificate('firebase-credentials.json')
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
    
    def add_program(self, program_data):
        """Add a single program to Firestore"""
        try:
            doc_ref = self.db.collection('programs').document()
            doc_ref.set(program_data)
            return doc_ref.id
        except Exception as e:
            print(f"Error adding program: {e}")
            return None
    
    def add_programs_batch(self, programs_list):
        """Add multiple programs to Firestore"""
        try:
            batch = self.db.batch()
            for program in programs_list:
                doc_ref = self.db.collection('programs').document()
                batch.set(doc_ref, program)
            batch.commit()
            return True
        except Exception as e:
            print(f"Error adding programs batch: {e}")
            return False
    
    def get_programs(self, filters=None):
        """Get programs from Firestore with optional filters"""
        try:
            query = self.db.collection('programs')
            
            if filters:
                if 'zip' in filters:
                    # Add zip-based filtering logic here
                    pass
                if 'max_price' in filters:
                    query = query.where('priceMonthly', '<=', filters['max_price'])
            
            docs = query.stream()
            programs = []
            for doc in docs:
                program = doc.to_dict()
                program['id'] = doc.id
                programs.append(program)
            
            return programs
        except Exception as e:
            print(f"Error getting programs: {e}")
            return []
    
    def get_user_data(self, user_id):
        """Get user data from Firestore"""
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            else:
                print(f"No user found with ID: {user_id}")
                return None
        except Exception as e:
            print(f"Error getting user data: {e}")
            return None
    
    def save_user_data(self, user_id, user_data):
        """Save user data to Firestore"""
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc_ref.set(user_data, merge=True)
            return True
        except Exception as e:
            print(f"Error saving user data: {e}")
            return False
