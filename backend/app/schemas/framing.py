from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum

class FramingCategory(str, Enum):
    LOADED_LANGUAGE = "LOADED_LANGUAGE"
    ACTOR_PORTRAYAL = "ACTOR_PORTRAYAL"
    ATTRIBUTION_OF_ALLEGATIONS = "ATTRIBUTION_OF_ALLEGATIONS"
    FACT_VS_OPINION = "FACT_VS_OPINION"
    GENERALIZATION = "GENERALIZATION"
    HEDGING_QUALIFYING = "HEDGING_QUALIFYING"
    EMPHASIS_PROMINENCE = "EMPHASIS_PROMINENCE"
    VIEWPOINT_REPRESENTATION = "VIEWPOINT_REPRESENTATION"
    SELECTIVE_PRESENTATION = "SELECTIVE_PRESENTATION"

class FramingEvidence(BaseModel):
    finding_id: str
    category: FramingCategory
    label: str
    exact_text: str
    start_offset: int
    end_offset: int
    explanation: str
    potential_effect: str
    evidence_strength: str = Field("medium", description="'low', 'medium', or 'high' with justification")
    alternative_interpretation: Optional[str] = None
    method: str = "linguistic_heuristics"
    actor_or_speaker: Optional[str] = None

class FramingAnalysisResult(BaseModel):
    findings: List[FramingEvidence] = Field(default_factory=list)
    category_counts: Dict[str, int] = Field(default_factory=dict)
    density_per_1000_tokens: float = 0.0
    article_level_assessment: str
    unsupported_conclusions_note: str
    methodology: str

