"""
AI-powered recommendation engine for parenting activities based on family profile and preferences
Structured output ONLY via Anthropic tool-use with your JSON Schema.

- Uses official `anthropic` SDK (`Anthropic` client)
- Model: `claude-sonnet-4-20250514` (override with env `RECS_MODEL_ID`)
- ALWAYS returns the schema-shaped object: { cognitive, physical, emotional, social }
- On API failure or missing tool output, returns {}
"""
from typing import List, Dict, Any, Optional
import json
import logging
import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIRecommendationEngine:
    def __init__(self):
        self.client = Anthropic()  # reads ANTHROPIC_API_KEY
        self.model_id = os.getenv("RECS_MODEL_ID", "claude-sonnet-4-20250514")

    def _schema(self) -> Dict[str, Any]:
        return {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://planningparenthood.app/schemas/recommendations.schema.json",
            "type": "object",
            "additionalProperties": False,
            "required": ["cognitive", "physical", "emotional", "social"],
            "properties": {
                "cognitive": {"$ref": "#/$defs/domain"},
                "physical": {"$ref": "#/$defs/domain"},
                "emotional": {"$ref": "#/$defs/domain"},
                "social": {"$ref": "#/$defs/domain"},
            },
            "$defs": {
                "domain": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": ["parenting_advice", "activity_types", "local_opportunities"],
                    "properties": {
                        "parenting_advice": {"type": "string", "minLength": 1},
                        "activity_types": {
                            "type": "array",
                            "items": {"type": "string", "minLength": 1},
                            "minItems": 1,
                        },
                        "local_opportunities": {
                            "type": "array",
                            "items": {"$ref": "#/$defs/opportunity"},
                            "minItems": 1,
                        },
                    },
                },
                "opportunity": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": [
                        "name",
                        "description",
                        "address",
                        "phone",
                        "website",
                        "price_info",
                        "age_range",
                        "transportation_notes",
                        "match_reason",
                    ],
                    "properties": {
                        "name": {"type": "string", "minLength": 1},
                        "description": {"type": "string", "minLength": 1},
                        "address": {"type": "string", "minLength": 1},
                        "phone": {"type": "string"},
                        "website": {"type": "string"},
                        "price_info": {"type": "string"},
                        "age_range": {"type": "string"},
                        "transportation_notes": {"type": "string"},
                        "match_reason": {"type": "string"},
                    },
                },
            },
        }

    def _tools(self):
        # Keep tool list minimal to reduce overhead
        return [
            {
                "name": "emit_recommendations",
                "description": "Return the final recommendations strictly matching the schema.",
                "input_schema": self._schema(),
            }
        ]

    def _generate_schema_recommendations(
        self,
        family_profile: Dict[str, Any],
        *,
        local_opps_per_domain: int = 1,
        max_tokens: int = 3000,
    ) -> Dict[str, Any]:
        """
        Ask Claude to return a tool_use payload that conforms to the schema.
        Return the tool's input EXACTLY. On failure or no tool_use found, return {}.
        """
        prompt = (
            "Return ONLY via tool-use 'emit_recommendations' (JSON Schema). "
            "Base advice on this profile: "
            + json.dumps(family_profile, ensure_ascii=False)
            + (
                f". For each domain include {local_opps_per_domain} local_opportunities. "
                "Keep parenting_advice ≤ 300 chars; activity_types concise (≤ 60 chars)."
            )
        )

        try:
            resp = self.client.messages.create(
                model=self.model_id,
                max_tokens=max_tokens,
                temperature=0.2,
                tools=self._tools(),
                messages=[{"role": "user", "content": prompt}],
                system=(
                    "You are a concise child development advisor. "
                    "Be brief, practical, and avoid verbosity. "
                    "Return results ONLY via the 'emit_recommendations' tool."
                ),
            )

            for part in resp.content:
                if getattr(part, "type", None) == "tool_use" and getattr(part, "name", "") == "emit_recommendations":
                    # Return EXACT tool payload (already structured to schema)
                    return part.input if isinstance(part.input, dict) else {}

            logger.warning("No 'emit_recommendations' tool_use found; returning {}.")
            return {}

        except Exception as e:
            logger.exception("Schema-based generation failed: %s", e)
            return {}

    def get_recommendations(
        self,
        budget_per_week: float,
        support_available: List[str],
        transport: str,
        hours_per_week_with_kid: int,
        spouse: bool,
        parenting_style: str,
        number_of_kids: int,
        child_age: int,
        area_type: str,
        priorities_ranked: List[str],
        kid_traits: Optional[Dict[str, float]] = None,
        zip_code: Optional[str] = None,
    ) -> Dict[str, Any]:
        family_profile = {
            "budget_per_week": budget_per_week,
            "support_available": support_available,
            "transport": transport,
            "hours_per_week_with_kid": hours_per_week_with_kid,
            # spouse removed; covered by support_available
            "parenting_style": parenting_style,
            # number_of_kids removed; assume one child
            "child_age": child_age,
            "area_type": area_type,
            "priorities_ranked": priorities_ranked,
            "kid_traits": kid_traits or {},
            "zip": zip_code,
        }
        return self._generate_schema_recommendations(
            family_profile,
            local_opps_per_domain=2,
        )


def get_recommendations(
    budget_per_week: float,
    support_available: List[str],
    transport: str,
    hours_per_week_with_kid: int,
    spouse: bool,
    parenting_style: str,
    number_of_kids: int,
    child_age: int,
    area_type: str,
    priorities_ranked: List[str],
    kid_traits: Optional[Dict[str, float]] = None,
    zip_code: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Module-level entry point. Returns EXACT tool JSON (dict) or {} on failure.
    """
    engine = AIRecommendationEngine()
    return engine.get_recommendations(
        budget_per_week=budget_per_week,
        support_available=support_available,
        transport=transport,
        hours_per_week_with_kid=hours_per_week_with_kid,
        spouse=spouse,
        parenting_style=parenting_style,
        number_of_kids=number_of_kids,
        child_age=child_age,
        area_type=area_type,
        priorities_ranked=priorities_ranked,
        kid_traits=kid_traits,
        zip_code=zip_code,
    )
