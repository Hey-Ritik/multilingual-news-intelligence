import re
from typing import List, Optional
from app.schemas.event import EventProfile
from app.schemas.nlp import NamedEntity, EntityType
from app.utils.unicode_utils import split_into_sentences_with_offsets
from app.services.event_matching.entity_normalizer import extract_incident_identifiers_from_text

# Main Action Verb Stems in 5 Languages
ACTION_KEYWORDS = {
    "arrest": ("arrested / detained", ["arrested", "detained", "held", "गिरफ्तार", "हिरासत", "ಬಂಧನ", "ಅರೆಸ್ಟ್", "అరెస్ట్", "கைது"]),
    "launch": ("launched / inaugurated", ["launched", "inaugurated", "unveiled", "उद्घाटन", "शुरू", "ಉದ್ಘಾಟನೆ", "ಆರಂಭ", "ప్రారంభం", "தொடக்கம்"]),
    "protest": ("protested / demonstrated", ["protested", "demonstrated", "staged march", "प्रदर्शन", "विरोध", "ಪ್ರತಿಭಟನೆ", "ధర్నా", "போராட்டம்"]),
    "agreement": ("signed pact / treaty", ["signed", "agreement", "deal", "समझौता", "करार", "ಒಪ್ಪಂದ", "ఒప్పందం", "ஒப்பந்தம்"]),
    "clash": ("clashed / violence", ["clashed", "violence", "conflict", "झड़प", "हिंसा", "ಘರ್ಷಣೆ", "ఘర్షణ", "மோதல்"]),
    "verdict": ("court verdict / ruling", ["verdict", "ruling", "sentenced", "फैसला", "दोषी", "ತೀರ್ಪು", "తీర్పు", "தீர்ப்பு"])
}

def extract_event_profile(
    headline: str,
    text: str,
    language_code: str,
    entities: List[NamedEntity]
) -> EventProfile:
    """
    Constructs a structured profile of the core news event from headline, text, and entities.
    Identifies actors, main actions, locations, temporal anchors, and distinctive event markers.
    """
    sentences = split_into_sentences_with_offsets(text)
    lead_sentence = sentences[0]["text"] if sentences else headline

    # 1. Identify principal actors and organizations
    actors = [e.text for e in entities if e.label == EntityType.PERSON]
    orgs = [e.text for e in entities if e.label == EntityType.ORGANIZATION]
    locs = [e.text for e in entities if e.label == EntityType.LOCATION]
    dates = [e.text for e in entities if e.label == EntityType.DATE]

    # De-duplicate while preserving order
    actors = list(dict.fromkeys(actors))[:4]
    orgs = list(dict.fromkeys(orgs))[:3]
    location = locs[0] if locs else None
    event_date = dates[0] if dates else None

    # 2. Identify main action and action type
    combined_header = f"{headline} {lead_sentence}".lower()
    main_action = "General news development"
    action_type = "development"
    for action_key, (label, tokens) in ACTION_KEYWORDS.items():
        if any(tok.lower() in combined_header for tok in tokens):
            main_action = label
            action_type = action_key
            break

    # 3. Extract incident identifiers & case markers
    incident_identifiers = extract_incident_identifiers_from_text(f"{headline} {text[:800]}")

    # Extract regex-based case phrases like "... case", "... policy", "... scam"
    case_matches = re.findall(r'\b([a-zA-Z\u0900-\u097F\u0C80-\u0CFF\u0C00-\u0C7F\u0B80-\u0BFF]{3,}\s+(?:case|policy|scam|matter|probe|investigation|scheme))\b', f"{headline} {lead_sentence}", re.IGNORECASE)
    for cm in case_matches:
        if cm.lower() not in [i.lower() for i in incident_identifiers]:
            incident_identifiers.append(cm.strip())

    # 4. Extract distinctive terms (keywords appearing in headline and lead)
    words = re.findall(r'\b[A-Za-z\u0900-\u097F\u0C80-\u0CFF\u0C00-\u0C7F\u0B80-\u0BFF]{4,}\b', headline)
    distinctive = [w for w in words if w.lower() not in {"news", "today", "live", "updates", "breaking", "report"}][:6]

    # Subject / Object description
    subject_or_object = f"{', '.join(actors or orgs or ['Subject'])}"

    uncertainty = []
    if not location:
        uncertainty.append("Specific geographic location could not be determined unambiguously.")
    if not event_date:
        uncertainty.append("Specific date of event was not explicitly mentioned in the opening text.")
    if not actors and not orgs:
        uncertainty.append("No high-confidence named individuals or organizations identified in the text.")
    if not incident_identifiers:
        uncertainty.append("No specific formal policy or case identifier recognized in the opening text.")

    desc = f"{main_action.capitalize()} involving {subject_or_object}"
    if incident_identifiers:
        desc += f" in connection with {incident_identifiers[0]}"
    if location:
        desc += f" in {location}"

    return EventProfile(
        headline=headline,
        event_description=desc,
        principal_actors=actors,
        principal_organizations=orgs,
        main_action=main_action,
        action_type=action_type,
        subject_or_object=subject_or_object,
        incident_identifiers=incident_identifiers,
        location=location,
        event_date=event_date,
        distinctive_terms=distinctive,
        distinctive_context_phrases=incident_identifiers[:3],
        context=lead_sentence[:220],
        original_language=language_code,
        uncertainty_notes=uncertainty
    )

