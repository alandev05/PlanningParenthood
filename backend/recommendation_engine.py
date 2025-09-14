"""
AI-powered recommendation engine: fetches REAL nearby businesses (Google/Yelp),
then uses AI to rank/explain. Falls back gracefully.
"""

from typing import List, Dict, Any, Optional
import json
import logging
from anthropic_service import AnthropicService

from web_places_service import WebPlacesService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIRecommendationEngine:
    """Blend web businesses with AI ranking & explanations (plus fallbacks)."""

    def __init__(self, firebase_service=None, maps_service=None, places_service: Optional[WebPlacesService] = None):
        self.anthropic_service = AnthropicService()
        self.firebase_service = firebase_service
        self.maps_service = maps_service
        self.places_service = places_service or WebPlacesService()

    # ---------- PUBLIC ----------

    def get_recommendations(
        self,
        budget_per_week: float,
        support_available: List[str],
        transport: str,
        hours_per_week_with_kid: int,
        spouse: Optional[bool],
        parenting_style: Optional[str],
        number_of_kids: Optional[int],
        child_age: int,
        area_type: Optional[str],
        priorities_ranked: List[str],
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        zip_code: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        family_profile = {
            "budget_per_week": budget_per_week,
            "support_available": support_available,
            "transport": transport,
            "hours_per_week_with_kid": hours_per_week_with_kid,
            "spouse": spouse,
            "parenting_style": parenting_style or "Balanced",
            "number_of_kids": number_of_kids or 1,
            "child_age": child_age,
            "area_type": area_type or "Urban",
            "priorities_ranked": priorities_ranked or ["Social", "Emotional", "Physical", "Cognitive"],
            "lat": lat,
            "lng": lng,
            "zip_code": zip_code,
        }
        logger.info(f"Generating recommendations with family profile: {family_profile}")

        # 1) Web businesses near location
        web_items = self._fetch_from_web(family_profile)
        if web_items:
            ranked = self._rank_and_explain_with_ai(web_items, family_profile)
            if ranked:
                ranked.sort(key=lambda x: x.get("match_score", 0), reverse=True)
                return ranked
            # local backup score if AI fails
            local = self._local_score(web_items, family_profile)
            local.sort(key=lambda x: x.get("match_score", 0), reverse=True)
            return local

        # 2) (Optional) Firebase catalog—keep if you still want to mix in-house data
        firebase_items = self._fetch_catalog(family_profile)
        if firebase_items:
            ranked = self._rank_and_explain_with_ai(firebase_items, family_profile)
            if ranked:
                ranked.sort(key=lambda x: x.get("match_score", 0), reverse=True)
                return ranked
            local = self._local_score(firebase_items, family_profile)
            local.sort(key=lambda x: x.get("match_score", 0), reverse=True)
            return local

        # 3) AI-invented
        ai_only = self._generate_ai_recommendations(family_profile)
        if ai_only:
            ai_only.sort(key=lambda x: x.get("match_score", 0), reverse=True)
            return ai_only

        # 4) Hard fallback
        return self._get_fallback_recommendations(family_profile)

    # ---------- FETCHERS ----------

    def _fetch_from_web(self, family_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        try:
            lat, lng = family_profile.get("lat"), family_profile.get("lng")
            # Geocode zip via maps_service if needed
            if (lat is None or lng is None) and self.maps_service and family_profile.get("zip_code"):
                try:
                    results = self.maps_service.geocode_address(str(family_profile["zip_code"]))
                    if results:
                        loc = results[0].get("geometry", {}).get("location") or {}
                        lat, lng = float(loc.get("lat")), float(loc.get("lng"))
                except Exception:
                    lat, lng = None, None
            if lat is None or lng is None:
                logger.info("No lat/lng available; skipping web places fetch.")
                return []

            max_monthly = int(family_profile["budget_per_week"] * 4)
            items = self.places_service.search_activities(
                lat=lat,
                lng=lng,
                transport=family_profile["transport"],
                child_age=family_profile["child_age"],
                max_monthly_budget=max_monthly,
                priorities_ranked=family_profile.get("priorities_ranked", []),
                open_now=False,
                min_rating=4.0,
                per_category_limit=6,
            )
            return items
        except Exception as e:
            logger.error(f"Web places fetch failed: {e}")
            return []

    def _fetch_catalog(self, family_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        if not self.firebase_service:
            return []
        try:
            filters = {
                "zip": family_profile.get("zip_code"),
                "max_price": int(family_profile["budget_per_week"] * 4),
                "age": family_profile["child_age"],
                "area_type": family_profile["area_type"],
                "transport": family_profile["transport"],
            }
            filters = {k: v for k, v in filters.items() if v is not None}
            raw = self.firebase_service.get_programs(filters)
            return [self._normalize_program(p, family_profile) for p in raw if p]
        except Exception as e:
            logger.error(f"Firebase fetch failed: {e}")
            return []

    # ---------- NORMALIZATION (Firebase) ----------

    def _normalize_program(self, p: Dict[str, Any], family_profile: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            child_age = family_profile["child_age"]
            month_price = p.get("price_monthly") or p.get("price") or 0
            age_min = p.get("age_min", 0)
            age_max = p.get("age_max", 18)
            if not (age_min <= child_age <= age_max):
                return None
            address = p.get("address") or "See website"
            phone = p.get("phone") or "See website"
            website = p.get("website") or ""
            lat = p.get("latitude", 42.3601)
            lng = p.get("longitude", -71.0589)
            return {
                "activity_id": p.get("id") or p.get("uid") or p.get("slug") or f"prog_{p.get('name','unknown')}",
                "id": p.get("id") or p.get("uid") or p.get("slug") or f"prog_{p.get('name','unknown')}",
                "title": p.get("name") or p.get("title") or "Program",
                "description": p.get("description") or "See details",
                "category": p.get("category") or "general",
                "price_monthly": month_price,
                "age_min": age_min,
                "age_max": age_max,
                "match_score": 0.0,
                "ai_explanation": "",
                "practical_tips": p.get("tips") or "",
                "developmental_benefits": p.get("benefits") or "",
                "constraint_solutions": p.get("constraint_solutions") or "",
                "time_commitment": p.get("time_commitment") or "",
                "budget_breakdown": p.get("budget_breakdown") or "",
                "address": address,
                "phone": phone,
                "website": website,
                "latitude": lat,
                "longitude": lng,
            }
        except Exception as e:
            logger.warning(f"Program normalization failed: {e}")
            return None

    # ---------- AI RANKING ----------

    def _rank_and_explain_with_ai(self, items: List[Dict[str, Any]], family_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        try:
            child_age = family_profile["child_age"]
            budget_month = int(family_profile["budget_per_week"] * 4)
            style = family_profile.get("parenting_style", "Balanced")
            priorities = ", ".join(family_profile.get("priorities_ranked", [])) or "Social, Emotional, Physical, Cognitive"

            pre_sorted = self._local_score(items, family_profile)
            shortlist = pre_sorted[:20]

            prompt = (
                f"You are ranking real, local programs for a family.\n"
                f"Child age: {child_age}. Budget/month: ${budget_month}. Parenting style: {style}. "
                f"Priorities (in order): {priorities}.\n"
                f"Return JSON array. For each item, keep all original fields but set: match_score (0–1 float), ai_explanation (<= 30 words).\n\n"
                f"ITEMS:\n{json.dumps(shortlist, ensure_ascii=False)}\n\nOUTPUT JSON ARRAY ONLY."
            )

            response = self.anthropic_service.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1200,
                messages=[{"role": "user", "content": prompt}],
            )
            content = response.content[0].text
            s, e = content.find("["), content.rfind("]") + 1
            if s == -1 or e == 0:
                logger.error("AI ranking response missing JSON array.")
                return []
            ranked = json.loads(content[s:e])

            for r in ranked:
                try:
                    r["match_score"] = float(r.get("match_score", 0.0))
                    r["match_score"] = max(0.0, min(1.0, r["match_score"]))
                except Exception:
                    r["match_score"] = 0.0
            return ranked
        except Exception as e:
            logger.error(f"AI re-ranking failed: {e}")
            return []

    # ---------- LOCAL SCORING BACKUP ----------

    def _local_score(self, items: List[Dict[str, Any]], family_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        child_age = family_profile["child_age"]
        budget_month = family_profile["budget_per_week"] * 4
        priorities = family_profile.get("priorities_ranked", [])
        pr_weights = {p: max(0.0, 1.0 - (i * 0.15)) for i, p in enumerate(priorities)}

        scored = []
        for it in items:
            score = 0.5
            if it.get("age_min", 0) <= child_age <= it.get("age_max", 18):
                score += 0.2
            else:
                score -= 0.1
            if it.get("price_monthly", 999999) <= budget_month:
                score += 0.15
            else:
                score -= 0.1
            score += pr_weights.get((it.get("category") or "").lower().capitalize(), 0.0)
            it2 = dict(it)
            it2["match_score"] = max(0.0, min(1.0, score))
            scored.append(it2)

        scored.sort(key=lambda x: x["match_score"], reverse=True)
        return scored

    # ---------- AI-ONLY + FALLBACK ----------

    def _generate_ai_recommendations(self, family_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        try:
            safe_inputs = json.dumps(family_profile, ensure_ascii=False)
            response = self.anthropic_service.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1800,
                messages=[{
                    "role": "user",
                    "content": (
                        "Using the following family profile, recommend 6-8 local and practical child activities. "
                        "Return ONLY a valid JSON array of objects with the fields our frontend expects.\n\n"
                        f"FAMILY PROFILE:\n{safe_inputs}\n"
                    )
                }],
            )
            content = response.content[0].text
            s, e = content.find('['), content.rfind(']') + 1
            if s == -1 or e == 0:
                return []
            return json.loads(content[s:e])
        except Exception as e:
            logger.error(f"Error generating AI-only recommendations: {e}")
            return []

    def _get_fallback_recommendations(self, family_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        child_age = family_profile.get('child_age', 5)
        fallback = [
            {
                "activity_id": "fallback_physical",
                "id": "fallback_physical",
                "title": "Family Nature Walks",
                "description": f"Regular outdoor walks perfect for {child_age}-year-olds",
                "category": "physical",
                "price_monthly": 0,
                "age_min": 2, "age_max": 12,
                "match_score": 0.6,
                "ai_explanation": "Free activity that fits any budget",
                "practical_tips": "Start with 15–20 minute walks",
                "developmental_benefits": "Gross motor skills, spatial awareness",
                "address": "Your neighborhood",
                "phone": "No phone needed",
                "website": "",
                "latitude": 42.3601, "longitude": -71.0589
            },
        ]
        return fallback


