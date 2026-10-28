from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum

class SentimentLabel(str, Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"
    NEUTRAL = "NEUTRAL"
    MIXED = "MIXED"
    INCONCLUSIVE = "INCONCLUSIVE"

class SentimentResult(BaseModel):
    label: SentimentLabel
    score: float = Field(..., ge=-1.0, le=1.0, description="-1 (extremely negative) to +1 (extremely positive)")
    positive_score: float = Field(..., ge=0.0, le=1.0)
    negative_score: float = Field(..., ge=0.0, le=1.0)
    neutral_score: float = Field(..., ge=0.0, le=1.0)
    method: str
    limitations: str
    supporting_clauses: List[Dict[str, str]] = Field(default_factory=list)

class EmotionLabel(str, Enum):
    ANGER = "ANGER"
    FEAR = "FEAR"
    SADNESS = "SADNESS"
    JOY = "JOY"
    DISGUST = "DISGUST"
    SURPRISE = "SURPRISE"
    NEUTRAL = "NEUTRAL"

class EmotionFinding(BaseModel):
    emotion: EmotionLabel
    score: float
    text_passage: str
    start_offset: int
    end_offset: int
    is_speaker_quote: bool = Field(False, description="True if within a quoted statement, false if journalist narration")
    speaker: Optional[str] = None

class EmotionResult(BaseModel):
    primary_emotion: EmotionLabel
    detected_emotions: List[EmotionFinding] = Field(default_factory=list)
    journalist_emotions: List[EmotionFinding] = Field(default_factory=list)
    speaker_emotions: List[EmotionFinding] = Field(default_factory=list)
    method: str
    limitations: str

class EntityType(str, Enum):
    PERSON = "PERSON"
    ORGANIZATION = "ORGANIZATION"
    LOCATION = "LOCATION"
    DATE = "DATE"
    EVENT = "EVENT"

class NamedEntity(BaseModel):
    text: str
    label: EntityType
    start_offset: int
    end_offset: int
    native_script: bool = True
    transliteration: Optional[str] = None
    confidence: float = 1.0
    source: str = "model"

class ClaimType(str, Enum):
    FACTUAL_STATEMENT = "FACTUAL_STATEMENT"
    ATTRIBUTED_CLAIM = "ATTRIBUTED_CLAIM"
    ALLEGATION = "ALLEGATION"
    DENIAL_DISPUTE = "DENIAL_DISPUTE"
    OPINION = "OPINION"
    HEDGE_UNCERTAINTY = "HEDGE_UNCERTAINTY"

class ClaimObservation(BaseModel):
    claim_type: ClaimType
    text: str
    start_offset: int
    end_offset: int
    speaker_or_source: Optional[str] = None
    attribution_verb: Optional[str] = None
    confidence: float = 0.8
    notes: Optional[str] = None

class SummaryResult(BaseModel):
    summary_text: str
    method: str
    key_actors: List[str] = Field(default_factory=list)
    key_actions: List[str] = Field(default_factory=list)
    limitations: str

