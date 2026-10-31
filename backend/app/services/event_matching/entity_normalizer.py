import re
from typing import List, Dict, Set, Tuple, Optional

# Multilingual Known Entity Transliterations and Aliases
KNOWN_ENTITIES_MULTILINGUAL = {
    "arvind kejriwal": [
        "arvind kejriwal", "kejriwal", "cm kejriwal", "delhi cm",
        "अरविंद केजरीवाल", "केजरीवाल", "सीएम केजरीवाल", "अरविंद",
        "ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್", "ಅರವಿಂದ ಕೇಜ್ರಿವಾಲ್", "ಕೇಜ್ರಿವಾಲ್", "ಸಿಎಂ ಕೇಜ್ರಿವಾಲ್", "ಅರವಿಂದ", "ಅರವಿಂದ್",
        "అరవింద్ కేజ్రీవాల్", "కేజ్రీవాల్", "కేజ్రీవాల్‌ను", "సీఎం కేజ్రీవాల్", "అరవింద్",
        "அரவிந்த் கெஜ்ரிவால்", "கெஜ்ரிவால்", "கெஜ்ரிவாலை", "முதல்வர் கெஜ்ரிவால்", "அரவிந்த்"
    ],
    "enforcement directorate": [
        "enforcement directorate", "ed",
        "प्रवर्तन निदेशालय", "ईडी",
        "ಜಾರಿ ನಿರ್ದೇಶನಾಲಯ", "ಇಡಿ",
        "ఎన్‌ఫోర్స్‌మెంట్ డైరెక్టరేట్", "ఈడీ",
        "அமலாக்கத்துறை", "இ.டி", "ஈடி"
    ],
    "aam aadmi party": [
        "aam aadmi party", "aap",
        "आम आदमी पार्टी", "आप",
        "ಆಮ್ ಆದ್ಮಿ ಪಾರ್ಟಿ", "ಎಎಪಿ",
        "ఆమ్ ఆద్మీ పార్టీ", "ఆప్",
        "ஆம் ஆத்மி கட்சி", "ஏஏபி"
    ],
    "supreme court": [
        "supreme court", "sc", "apex court", "bench",
        "उच्चतम न्यायालय", "सुप्रीम कोर्ट", "शीर्ष अदालत",
        "ಸುಪ್ರೀಂ ಕೋರ್ಟ್", "ಸರ್ವೋಚ್ಚ ನ್ಯಾಯಾಲಯ",
        "సుప్రీంకోర్టు", "సర్వోన్నత న్యాయస్థానం",
        "உச்ச நீதிமன்றம்", "சுப்ரீம் கோர்ட்"
    ],
    "isro": [
        "isro", "indian space research organisation",
        "इसरो", "भारतीय अंतरिक्ष अनुसंधान संगठन",
        "ಇಸ್ರೋ", "ಭಾರತೀಯ ಅಂತರಿಕ್ಷ ಪರಿಶೋಧನಾ ಸಂಸ್ಥೆ", "ఇస్రో",
        "இஸ்ரோ", "இந்திய விண்வெளி ஆராய்ச்சி நிறுவனம்"
    ]
}

# Multilingual Incident / Case Context Markers
INCIDENT_CONTEXT_TAXONOMY = {
    "excise_liquor_policy": [
        "excise policy", "liquor policy", "excise case", "liquor scam",
        "money laundering", "delhi excise", "liquor scam case", "scam case", "excise",
        "आबकारी नीति", "शराब नीति", "आबकारी मामला", "शराब घोटाला", "आबकारी घोटाला", "मनी लॉन्ड्रिंग", "आबकारी",
        "ಅಬಕಾರಿ ನೀತಿ", "ಮದ್ಯ ನೀತಿ", "ಅಬಕಾರಿ ಹಗರಣ", "ಮದ್ಯ ಹಗರಣ", "ಹಣ ವರ್ಗಾವಣೆ", "ಅಬಕಾರಿ ಪ್ರಕರಣ", "ಅಬಕಾರಿ",
        "లిక్కర్ పాలసీ", "మద్యం పాలసీ", "లిక్కర్ కుంభకోణం", "మద్యం కుంభకోణం", "మనీలాండరింగ్", "మద్యం విధానం", "లిక్కర్ కేసు", "మద్యం కేసు", "లిక్కర్",
        "மதுபானக் கொள்கை", "மதுபான கொள்கை", "மதுபான ஊழல்", "பணமோசடி", "மதுபான வழக்கு", "மதுபான கொள்கை வழக்கு", "மதுபான"
    ],
    "solar_energy_initiative": [
        "solar policy", "rooftop solar", "solar energy", "clean energy", "electricity bills",
        "सोलर पॉलिसी", "सौर ऊर्जा", "सौर नीति", "बिजली बिल",
        "ಸೌರ ನೀತಿ", "ಸೌರಶಕ್ತಿ", "ಸೌರ ವಿದ್ಯುತ್",
        "సౌర పాలసీ", "సోలార్ పాలసీ", "సౌర విద్యుత్",
        "சூரிய மின் கொள்கை", "சூரிய சக்தி", "மின் கட்டணம்"
    ],
    "space_meteorological": [
        "insat-3ds", "satellite", "orbit-raising", "apogee", "geostationary", "meteorological",
        "इनसैट-3डीएस", "उपग्रह", "मौसम उपग्रह",
        "ಇನ್ಸಾಟ್-3ಡಿಎಸ್", "ಉಪಗ್ರಹ",
        "ఇన్సాట్-3డీఎస్", "ఉపగ్రహం",
        "இன்சாட்-3டிஎஸ்", "செயற்கைக்கோள்"
    ]
}

# Conflicting Incidents that must NEVER be verified as the same event
# (e.g. food fight, cybercrime, narcotics/drug seizures, local robbery)
CONFLICTING_INCIDENTS = [
    # Street violence over food
    ("stabbing over chole/food", [
        "chole", "bhature", "extra chole", "stabbing", "stabbed", "knife", "eatery", "food stall",
        "road rage", "beaten to death", "चाकू", "छोले", "छुरेबाजी", "चाकू घोंप", "ढाबे",
        "ಚಾಕು", "చాకు", "కత్తి", "கத்திக்குத்து"
    ]),
    # Cyber fraud / financial scam
    ("cyber fraud / call centre", [
        "cyber fraud", "cyber crime", "phishing", "call centre scam", "digital arrest", "crypto fraud",
        "साइबर ठगी", "साइबर अपराध", "कॉल सेंटर", "डिजिटल अरेस्ट",
        "ಸೈಬರ್ ವಂಚನೆ", "సైబర్ నేరం", "సైబర్ మోసం", "சைபர் மோசடி"
    ]),
    # Narcotics / drug smuggling
    ("narcotics / drug bust", [
        "heroin", "cocaine", "narcotics", "drug seizure", "smuggling drugs", "mdma", "ganja", "cannabis",
        "हेरोइन", "ड्रग्स", "मादक पदार्थ", "चरस", "गांजा",
        "ಹೆರಾಯಿನ್", "ಮಾದಕ ವಸ್ತು", "హెరాయిన్", "గంజాయి", "ஹெராயின்", "போதைப்பொருள்"
    ]),
    # Gold / theft / vehicle theft
    ("theft / robbery", [
        "chain snatching", "burglar", "pickpocket", "bike theft", "car theft", "jewelry theft",
        "चेन स्नैचिंग", "डकैती", "चोरी"
    ])
]

def get_entity_aliases(entity_name: str) -> List[str]:
    """Returns canonical transliterated aliases for high-profile public entities."""
    clean = entity_name.lower().strip()
    for canon, aliases in KNOWN_ENTITIES_MULTILINGUAL.items():
        if clean == canon or clean in aliases or any(alias in clean for alias in aliases if len(alias) > 3):
            return aliases
    return [clean]

def match_entity_multilingual(entity_name: str, candidate_text: str) -> Tuple[bool, Optional[str]]:
    """
    Checks if a named entity or any of its multilingual aliases/transliterations
    matches in the candidate text.
    """
    aliases = get_entity_aliases(entity_name)
    c_lower = candidate_text.lower()
    for alias in aliases:
        # Require word boundary for short Latin acronyms like 'ed', 'aap', 'sc'
        if len(alias) <= 3 and alias.isascii():
            pattern = rf'\b{re.escape(alias)}\b'
            if re.search(pattern, c_lower):
                return True, alias
        else:
            if alias in c_lower:
                return True, alias
    return False, None

def extract_incident_identifiers_from_text(text: str) -> List[str]:
    """Extracts known incident/case context markers from text."""
    found = []
    t_lower = text.lower()
    for case_id, keywords in INCIDENT_CONTEXT_TAXONOMY.items():
        for kw in keywords:
            if kw in t_lower:
                found.append(kw)
    return list(dict.fromkeys(found))

def check_for_conflicting_incident(
    source_incident_category: Optional[str],
    candidate_text: str
) -> Tuple[bool, Optional[str]]:
    """
    Checks if candidate text contains explicit markers of a conflicting incident
    (e.g., driver stabbed over chole, cyber-fraud, drug/heroin arrest).
    """
    c_lower = candidate_text.lower()
    for label, terms in CONFLICTING_INCIDENTS:
        matched_terms = [t for t in terms if t in c_lower]
        if matched_terms:
            return True, f"{label} (identified conflict markers: '{', '.join(matched_terms[:2])}')"
    return False, None
