import os
import requests
from typing import List, Dict, Optional

class GoogleMapsService:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_MAPS_API_KEY environment variable not set")
    
    def geocode_address(self, address: str) -> List[Dict]:
        """Convert address to coordinates"""
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            'address': address,
            'key': self.api_key
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get('results', [])
        except requests.RequestException as e:
            print(f"Geocoding error: {e}")
            return []
    
    def search_nearby_places(self, latitude: float, longitude: float, 
                           place_type: str = 'hospital', radius: int = 5000) -> List[Dict]:
        """Search for nearby places"""
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            'location': f"{latitude},{longitude}",
            'radius': radius,
            'type': place_type,
            'key': self.api_key
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get('results', [])
        except requests.RequestException as e:
            print(f"Places search error: {e}")
            return []
