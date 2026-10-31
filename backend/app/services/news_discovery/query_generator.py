from typing import List, Dict
from app.schemas.event import EventProfile, LanguageQuery

# Action translations into the 5 target languages
ACTION_TRANSLATIONS = {
    "arrested / detained": {
        "en": "arrested",
        "hi": "गिरफ्तार",
        "kn": "ಬಂಧನ",
        "te": "అరెస్ట్",
        "ta": "கைது"
    },
    "launched / inaugurated": {
        "en": "launched",
        "hi": "उद्घाटन",
        "kn": "ಉದ್ಘಾಟನೆ",
        "te": "ప్రారంభం",
        "ta": "தொடக்கம்"
    },
    "protested / demonstrated": {
        "en": "protest",
        "hi": "प्रदर्शन",
        "kn": "ಪ್ರತಿಭಟನೆ",
        "te": "నిరసన",
        "ta": "போராட்டம்"
    },
    "signed pact / treaty": {
        "en": "agreement",
        "hi": "समझौता",
        "kn": "ಒಪ್ಪಂದ",
        "te": "ఒప్పందం",
        "ta": "ஒப்பந்தம்"
    },
    "clashed / violence": {
        "en": "clash",
        "hi": "झड़प",
        "kn": "ಘರ್ಷಣೆ",
        "te": "ఘర్షణ",
        "ta": "மோதல்"
    },
    "court verdict / ruling": {
        "en": "court verdict",
        "hi": "अदालत फैसला",
        "kn": "ನ್ಯಾಯಾಲಯ ತೀರ್ಪು",
        "te": "కోర్టు తీర్పు",
        "ta": "நீதிமன்ற தீர்ப்பு"
    }
}

# Location translations
LOCATION_TRANSLATIONS = {
    "delhi": {"en": "Delhi", "hi": "दिल्ली", "kn": "ದೆಹಲಿ", "te": "ఢిల్లీ", "ta": "டெல்லி"},
    "bengaluru": {"en": "Bengaluru", "hi": "बेंगलुरु", "kn": "ಬೆಂಗಳೂರು", "te": "బెంగళూరు", "ta": "பெங்களூரு"},
    "hyderabad": {"en": "Hyderabad", "hi": "हैदराबाद", "kn": "ಹೈದರಾಬಾದ್", "te": "హైదరాబాద్", "ta": "ஹைதராபாத்"},
    "chennai": {"en": "Chennai", "hi": "चेन्नई", "kn": "ಚೆನ್ನೈ", "te": "చెన్నై", "ta": "சென்னை"},
    "mumbai": {"en": "Mumbai", "hi": "मुंबई", "kn": "ಮುಂಬೈ", "te": "ముంబై", "ta": "மும்பை"},
    "karnataka": {"en": "Karnataka", "hi": "कर्नाटक", "kn": "ಕರ್ನಾಟಕ", "te": "కర్ణాటక", "ta": "கர்நாடகா"},
    "telangana": {"en": "Telangana", "hi": "तेलंगाना", "kn": "ತೆಲಂಗಾಣ", "te": "తెలంగాణ", "ta": "தெலுங்கானா"},
    "tamil nadu": {"en": "Tamil Nadu", "hi": "तमिलनाडु", "kn": "ತಮಿಳುನಾಡು", "te": "తమిళనాడు", "ta": "தமிழ்நாடு"},
    "india": {"en": "India", "hi": "भारत", "kn": "ಭಾರತ", "te": "భారత్", "ta": "இந்தியா"}
}

LANGUAGE_LABELS = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "te": "Telugu",
    "ta": "Tamil"
}

def generate_multilingual_search_queries(
    profile: EventProfile,
    target_languages: List[str]
) -> List[LanguageQuery]:
    """
    Synthesizes complementary, bounded search queries for each target language.
    Combines primary actors, native action verbs, translated locations, and distinctive proper nouns.
    """
    results: List[LanguageQuery] = []

    primary_actor = profile.principal_actors[0] if profile.principal_actors else (
        profile.principal_organizations[0] if profile.principal_organizations else ""
    )
    secondary_actor = profile.principal_actors[1] if len(profile.principal_actors) > 1 else ""

    loc_key = profile.location.lower() if profile.location else None
    action_dict = ACTION_TRANSLATIONS.get(profile.main_action, {})

    for lang in target_languages:
        if lang not in LANGUAGE_LABELS:
            continue

        queries = []
        rationales = []

        action_term = action_dict.get(lang, action_dict.get("en", ""))
        loc_term = LOCATION_TRANSLATIONS.get(loc_key, {}).get(lang, profile.location or "")

        # Query 1: Actor + Action + Location (High Precision Event Anchor)
        q1_parts = [p for p in [primary_actor, action_term, loc_term] if p]
        if q1_parts:
            q1 = " ".join(q1_parts)
            queries.append(q1)
            rationales.append("High-precision event anchor combining primary entity, native action verb, and location.")

        # Query 2: Multiple Actors or Actor + Organization
        if secondary_actor:
            q2 = f"{primary_actor} {secondary_actor}"
            if action_term:
                q2 += f" {action_term}"
            queries.append(q2)
            rationales.append("Relational query capturing the interaction between multiple key actors.")
        elif profile.principal_organizations and primary_actor != profile.principal_organizations[0]:
            q2 = f"{primary_actor} {profile.principal_organizations[0]} {action_term}".strip()
            queries.append(q2)
            rationales.append("Institutional query linking primary actor with the relevant organization.")

        # Query 3: Distinctive Terms + Native Location
        if profile.distinctive_terms:
            dt_phrase = " ".join(profile.distinctive_terms[:3])
            q3 = f"{dt_phrase} {loc_term}".strip()
            queries.append(q3)
            rationales.append("Thematic query utilizing distinctive event-specific keywords and location.")

        # Query 4: Fallback headline terms / Direct search
        if not queries:
            queries.append(profile.headline[:60])
            rationales.append("Fallback query derived from opening headline terms.")

        results.append(LanguageQuery(
            language_code=lang,
            language_name=LANGUAGE_LABELS[lang],
            queries=queries[:3],
            rationales=rationales[:3]
        ))

    return results

