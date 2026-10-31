from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class BiasVerdict(str, Enum):
    POTENTIAL_BIAS_DETECTED = "POTENTIAL BIAS DETECTED"
    NO_CLEAR_BIAS_DETECTED = "NO CLEAR BIAS DETECTED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT EVIDENCE"

class AttributionType(str, Enum):
    JOURNALIST_NARRATION = "JOURNALIST_NARRATION"
    QUOTED_SPEAKER = "QUOTED_SPEAKER"
    IDENTIFIED_SOURCE = "IDENTIFIED_SOURCE"
    UNCLEAR_ANONYMOUS = "UNCLEAR_ANONYMOUS"

class PortrayalDirection(str, Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"
    MIXED = "MIXED"
    NEUTRAL_DESCRIPTIVE = "NEUTRAL_DESCRIPTIVE"

class FramingCategory(str, Enum):
    # Linguistic & Rhetorical Bias
    LOADED_LANGUAGE = "LOADED_LANGUAGE"
    EMOTIONAL_CHARGE = "EMOTIONAL_CHARGE"
    DEROGATORY_PEJORATIVE = "DEROGATORY_PEJORATIVE"
    EUPHEMISM = "EUPHEMISM"
    SENSATIONALISM_EXAGGERATION = "SENSATIONALISM_EXAGGERATION"
    IMPLICIT_JUDGMENT = "IMPLICIT_JUDGMENT"
    PERSUASIVE_RHETORIC = "PERSUASIVE_RHETORIC"
    GENERALIZATION = "GENERALIZATION"
    HEDGING_QUALIFYING = "HEDGING_QUALIFYING"

    # Political & Ideological Framing
    PARTISAN_IDEOLOGICAL = "PARTISAN_IDEOLOGICAL"
    GOVERNMENT_SUPPORTIVE = "GOVERNMENT_SUPPORTIVE"
    GOVERNMENT_CRITICAL = "GOVERNMENT_CRITICAL"
    OPPOSITION_SUPPORTIVE = "OPPOSITION_SUPPORTIVE"
    OPPOSITION_CRITICAL = "OPPOSITION_CRITICAL"
    NATIONALISTIC_FRAMING = "NATIONALISTIC_FRAMING"

    # Representation & Attribution Bias
    ACTOR_PORTRAYAL = "ACTOR_PORTRAYAL"
    ATTRIBUTION_OF_ALLEGATIONS = "ATTRIBUTION_OF_ALLEGATIONS"
    FACT_VS_OPINION = "FACT_VS_OPINION"
    VIEWPOINT_REPRESENTATION = "VIEWPOINT_REPRESENTATION"
    ASYMMETRIC_TREATMENT = "ASYMMETRIC_TREATMENT"
    SELECTIVE_PRESENTATION = "SELECTIVE_PRESENTATION"

    # Psychological & Cognitive Framing
    FEAR_APPEAL = "FEAR_APPEAL"
    ANGER_APPEAL = "ANGER_APPEAL"
    SYMPATHY_APPEAL = "SYMPATHY_APPEAL"
    IN_GROUP_OUT_GROUP = "IN_GROUP_OUT_GROUP"
    SCAPEGOATING = "SCAPEGOATING"
    THREAT_FRAMING = "THREAT_FRAMING"
    MORAL_FRAMING = "MORAL_FRAMING"
    AUTHORITY_APPEAL = "AUTHORITY_APPEAL"
    LOSS_AVERSION = "LOSS_AVERSION"

class FramingEvidence(BaseModel):
    finding_id: str
    category: FramingCategory
    label: str
    exact_text: str
    start_offset: int
    end_offset: int
    explanation: str
    potential_effect: str
    evidence_strength: str = Field("medium", description="'low', 'medium', or 'high'")
    alternative_interpretation: Optional[str] = None
    method: str = "linguistic_heuristics"
    actor_or_speaker: Optional[str] = None

    # Enhanced Explainability Fields
    sentence_index: int = 0
    paragraph_index: int = 0
    sentence_text: str = ""
    target_entity: Optional[str] = None
    direction: PortrayalDirection = PortrayalDirection.NEUTRAL_DESCRIPTIVE
    affected_group: Optional[str] = None
    attribution: AttributionType = AttributionType.JOURNALIST_NARRATION
    attribution_details: str = "Direct journalistic narration."
    psychological_mechanism: Optional[str] = None
    confidence_score: float = 0.70
    confidence_label: str = "System confidence score (uncalibrated)"
    confidence_factors: List[str] = Field(default_factory=list)

class EntityPortrayalImpact(BaseModel):
    entity_name: str
    entity_type: str = "PERSON"
    direction: PortrayalDirection
    findings_count: int
    evidence_quotes: List[str] = Field(default_factory=list)
    portrayal_summary: str
    favored_interest_analysis: str

class PsychologicalMechanism(BaseModel):
    framework_name: str
    concept_description: str
    relevance_to_text: str
    evidence_text: str
    analytical_caveat: str = (
        "Analytical interpretation of textual pattern only; does not establish psychological "
        "diagnosis or intent of the author, nor measured effect on the reader."
    )

class NeutralityCheck(BaseModel):
    check_name: str
    status: str = "NO_BIAS_INDICATORS_FOUND"  # "NO_BIAS_INDICATORS_FOUND" | "INDICATORS_PRESENT" | "NOT_ASSESSABLE"
    description: str
    result_details: str

class FramingAnalysisResult(BaseModel):
    # Verdict Section
    verdict: BiasVerdict = BiasVerdict.NO_CLEAR_BIAS_DETECTED
    verdict_summary: str = ""
    verdict_confidence: float = 0.80
    verdict_confidence_label: str = "System confidence score (uncalibrated)"
    verdict_confidence_reasoning: str = ""

    # Legacy & Summary Counts
    findings: List[FramingEvidence] = Field(default_factory=list)
    category_counts: Dict[str, int] = Field(default_factory=dict)
    density_per_1000_tokens: float = 0.0
    article_level_assessment: str = ""
    unsupported_conclusions_note: str = ""
    methodology: str = ""

    # Extended Explainability Sections
    entity_impacts: List[EntityPortrayalImpact] = Field(default_factory=list)
    psychological_framings: List[PsychologicalMechanism] = Field(default_factory=list)
    neutrality_checks: List[NeutralityCheck] = Field(default_factory=list)
    what_was_examined: List[str] = Field(default_factory=list)
    why_verdict_reached: str = ""
    framing_symmetry_assessment: str = ""
    overall_direction: str = "neutral_factual"
    evidence_coverage_percentage: float = 0.0
    system_limitations: List[str] = Field(default_factory=list)
