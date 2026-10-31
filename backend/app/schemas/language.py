from pydantic import BaseModel, Field
from typing import List, Optional

class AlternativeLanguage(BaseModel):
    code: str
    name: str
    confidence: float

class LanguageDetectionResult(BaseModel):
    language_code: str = Field(..., description="ISO 639-1 code (e.g., en, hi, kn, te, ta)")
    language_name: str = Field(..., description="Full language name")
    confidence: float = Field(..., ge=0.0, le=1.0)
    script: str = Field(..., description="Script identifier: Latin, Devanagari, Kannada, Telugu, Tamil, etc.")
    is_supported: bool = Field(..., description="True if one of the 5 core target languages")
    uncertainty_note: Optional[str] = None
    alternative_candidates: List[AlternativeLanguage] = Field(default_factory=list)

