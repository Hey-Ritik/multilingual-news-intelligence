from pydantic import BaseModel, Field
from typing import List, Optional

class EventProfile(BaseModel):
    headline: str
    event_description: str
    principal_actors: List[str] = Field(default_factory=list)
    principal_organizations: List[str] = Field(default_factory=list)
    main_action: str
    action_type: Optional[str] = None
    subject_or_object: Optional[str] = None
    incident_identifiers: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    event_date: Optional[str] = None
    distinctive_terms: List[str] = Field(default_factory=list)
    distinctive_context_phrases: List[str] = Field(default_factory=list)
    context: str
    original_language: str
    uncertainty_notes: List[str] = Field(default_factory=list)

class LanguageQuery(BaseModel):
    language_code: str
    language_name: str
    queries: List[str]
    rationales: List[str]

