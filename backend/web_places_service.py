import os
import time
import logging
from typing import List, Dict, Any, Optional
import requests

logger = logging.getLogger(__name__)

GOOGLE_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
YELP_KEY = os.getenv("YELP_API_KEY", "")


def _retry_request(method, url, headers=None, params=None, timeout=12, retries=3, backoff=0.6):
    for i in range(retries):
        try:
            resp = requests.request(method, url, headers=headers, params=params, timeout=timeout)
            if resp.status_code == 200:
                return resp
            logger.warning(f"HTTP {resp.status_code} for {url}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"Request error (attempt {i+1}/{retries}): {e}")
        time.sleep(backoff * (2 ** i))
    return None


def _price_level_to_monthly(price_level: Optional[int]) -> int:
    mapping = {0: 0, 1: 20, 2: 60, 3: 120, 4: 220}
    if price_level is None:
        return 40
    return mapping.get(price_level, 40)


def _distance_radius_by_transport(transport: str) -> int:
    t = (transport or "").lower()
    if "walk" in t or "bike" in t:
        return 2500
    if "public" in t:
        return 7000
    if "rideshare" in t:
        return 8000
    return 10000


CATEGORY_KEYWORDS = {
    "physical": [
        "kids gymnastics", "youth soccer club", "children swim lessons",
        "youth martial arts", "kids dance studio", "trampoline park"
    ],
    "cognitive": [
        "stem classes kids", "coding classes kids", "math tutoring kids",
        "robotics club kids", "library storytime"
    ],
    "social": [
        "playgroup", "after school program", "youth community center",
        "scouts", "kids meetup"
    ],
    "emotional": [
        "music classes kids", "art classes kids", "mindfulness kids",
        "theater kids", "drama club kids"
    ],
}


class WebPlacesService:
    def __init__(self):
        if not GOOGLE_KEY:
            logger.warning("GOOGLE_MAPS_API_KEY not set; Google Places search will be disabled.")
        if not YELP_KEY:
            logger.info("YELP_API_KEY not set; Yelp search disabled (optional).")

    def search_activities(
        self,
        lat: float,
        lng: float,
        transport: str,
        child_age: int,
        max_monthly_budget: int,
        priorities_ranked: Optional[List[str]] = None,
        open_now: bool = False,
        min_rating: float = 4.0,
        per_category_limit: int = 6,
    ) -> List[Dict[str, Any]]:
        radius = _distance_radius_by_transport(transport)
        results: List[Dict[str, Any]] = []

        for category, queries in CATEGORY_KEYWORDS.items():
            for q in queries[:4]:
                g = self._google_text_search(q, lat, lng, radius, open_now=open_now)
                if g:
                    normalized = [
                        self._normalize_google_place(
                            p,
                            query=q,
                            category_hint=category,
                            child_age=child_age,
                            max_monthly_budget=max_monthly_budget,
                        )
                        for p in g
                    ]
                    normalized = [n for n in normalized if n and n.get("match_score", 0) >= 0]
                    normalized.sort(key=lambda x: x.get("match_score", 0), reverse=True)
                    results.extend(normalized[:per_category_limit])

        dedup: Dict[str, Dict[str, Any]] = {}
        for r in results:
            key = r.get("id") or f"{r.get('title','')}|{r.get('address','')}"
            if key not in dedup:
                dedup[key] = r
        return list(dedup.values())

    def _google_text_search(
        self, query: str, lat: float, lng: float, radius_m: int, open_now: bool = False
    ) -> Optional[List[Dict[str, Any]]]:
        if not GOOGLE_KEY:
            return None
        base = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {
            "query": query,
            "location": f"{lat},{lng}",
            "radius": radius_m,
            "key": GOOGLE_KEY,
        }
        if open_now:
            params["opennow"] = "true"
        resp = _retry_request("GET", base, params=params)
        if not resp:
            return None
        data = resp.json()
        return data.get("results", [])

    def _google_place_details(self, place_id: str) -> Optional[Dict[str, Any]]:
        if not GOOGLE_KEY or not place_id:
            return None
        base = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "key": GOOGLE_KEY,
            "fields": "formatted_address,formatted_phone_number,website,opening_hours",
        }
        resp = _retry_request("GET", base, params=params)
        if not resp:
            return None
        return resp.json().get("result")

    def _normalize_google_place(
        self,
        p: Dict[str, Any],
        query: str,
        category_hint: str,
        child_age: int,
        max_monthly_budget: int,
    ) -> Optional[Dict[str, Any]]:
        try:
            place_id = p.get("place_id")
            name = p.get("name", "Business")
            rating = p.get("rating", 0.0) or 0.0
            user_ratings_total = p.get("user_ratings_total", 0) or 0
            geo = p.get("geometry", {}).get("location", {})
            lat = geo.get("lat", 42.3601)
            lng = geo.get("lng", -71.0589)
            price_level = p.get("price_level", None)

            details = self._google_place_details(place_id) if place_id else None
            address = (details or {}).get("formatted_address") or p.get("formatted_address") or p.get("vicinity") or "See website"
            phone = (details or {}).get("formatted_phone_number") or "See website"
            website = (details or {}).get("website") or ""

            price_monthly = _price_level_to_monthly(price_level)
            category = category_hint

            score = 0.45
            if rating >= 4.6 and user_ratings_total >= 50:
                score += 0.25
            elif rating >= 4.2 and user_ratings_total >= 20:
                score += 0.18
            elif rating >= 3.8:
                score += 0.08

            if price_monthly <= max_monthly_budget:
                score += 0.15
            else:
                score -= 0.1

            age_min, age_max = 3, 14
            if category == "physical":
                age_min, age_max = 3, 16
            if category == "cognitive":
                age_min, age_max = 4, 15
            if category == "social":
                age_min, age_max = 3, 15
            if category == "emotional":
                age_min, age_max = 3, 14

            if not (age_min <= child_age <= age_max):
                score -= 0.1

            return {
                "activity_id": place_id or f"g_{name}",
                "id": place_id or f"g_{name}",
                "title": name,
                "description": p.get("business_status", "Local program"),
                "category": category,
                "price_monthly": price_monthly,
                "age_min": age_min,
                "age_max": age_max,
                "match_score": max(0.0, min(1.0, score)),
                "ai_explanation": "",
                "practical_tips": "",
                "developmental_benefits": "",
                "constraint_solutions": "",
                "time_commitment": "",
                "budget_breakdown": "",
                "address": address,
                "phone": phone,
                "website": website,
                "latitude": lat,
                "longitude": lng,
            }
        except Exception as e:
            logger.warning(f"Normalize Google place failed: {e}")
            return None


