from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class FramingDifference(BaseModel):
    dimension: str
    article_a_title: str
    article_a_publisher: str
    article_a_language: str
    article_a_passage: str
    article_a_translation: Optional[str] = None
    article_b_title: str
    article_b_publisher: str
    article_b_language: str
    article_b_passage: str
    article_b_translation: Optional[str] = None
    what_differs: str
    why_it_matters: str
    uncertainty_and_alternatives: str

class CrossLanguageComparisonResult(BaseModel):
    base_article_id: str
    compared_candidates_count: int
    comparisons: List[FramingDifference] = Field(default_factory=list)
    actor_emphasis_comparison: Dict[str, Dict[str, str]] = Field(default_factory=dict)
    omission_insights: List[str] = Field(default_factory=list)
    methodology: str
    limitations_note: str

