import re
from typing import List, Dict, Set
from app.schemas.nlp import NamedEntity, EntityType
from app.utils.unicode_utils import validate_offset_slice

PUBLISHER_BOILERPLATE = {
    "reuters", "associated press", "ap", "afp", "pti", "the hindu", "ndtv", "times of india",
    "hindustan times", "bbc", "cnn", "prajavani", "vijayavani", "eenadu", "sakshi", "dina thanthi",
    "dinamalar", "amar ujala", "dainik jagran", "dainik bhaskar", "navbharat times", "news18"
}

# Multilingual Honorifics and Entity Patterns
HONORIFICS_EN = r'\b(?:Mr\.|Ms\.|Mrs\.|Dr\.|Prof\.|President|Prime Minister|PM|Chief Minister|CM|Minister|Governor|Justice|Judge|Secretary|Officer|Spokesperson)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'
ORGS_EN = r'\b([A-Z][a-zA-Z0-9&]+(?:\s+[A-Z][a-zA-Z0-9&]+)*(?:\s+(?:Ministry|Party|Court|Tribunal|Board|Commission|Police|Department|Force|Corporation|Authority|Parliament|Assembly|Alliance|Union|Congress|BJP|AAP|ISRO|DRDO|RBI|CBI|ED)))'
LOCATIONS_EN = r'\b(?:in|at|near|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b'

# Indic Honorifics and Patterns
INDIC_PERSON_HONORIFICS = {
    "hi": ["श्री", "श्रीमती", "डॉ.", "प्रधानमंत्री", "मुख्यमंत्री", "मंत्री", "राष्ट्रपति", "नेता"],
    "kn": ["ಶ್ರೀ", "ಶ್ರೀಮತಿ", "ಡಾ.", "ಪ್ರಧಾನಿ", "ಮುಖ್ಯಮಂತ್ರಿ", "ಸಚಿವ", "ರಾಷ್ಟ್ರಪತಿ"],
    "te": ["శ్రీ", "శ్రీమతి", "డాక్టర్", "ప్రధానమంత్రి", "ముఖ్యమంత్రి", "మంత్రి", "రాష్ట్రపతి"],
    "ta": ["திரு", "திருமதி", "டாக்டர்", "பிரதமர்", "முதலமைச்சர்", "அமைச்சர்", "தலைவர்"]
}

KNOWN_INDIAN_LOCATIONS = {
    "delhi": ("Delhi", "दिल्ली", "ದೆಹಲಿ", "ఢిల్లీ", "டெல்லி"),
    "bengaluru": ("Bengaluru", "बेंगलुरु", "ಬೆಂಗಳೂರು", "బెంగళూరు", "பெங்களூரு"),
    "hyderabad": ("Hyderabad", "हैदराबाद", "ಹೈದರಾಬಾದ್", "హైదరాబాద్", "ஹைதராபாத்"),
    "chennai": ("Chennai", "चेन्नई", "ಚೆನ್ನೈ", "చెన్నై", "சென்னை"),
    "mumbai": ("Mumbai", "मुंबई", "ಮುಂಬೈ", "ముంబై", "மும்பை"),
    "kolkata": ("Kolkata", "कोलकाता", "ಕೋಲ್ಕತ್ತಾ", "కోల్‌కతా", "கொல்கத்தா"),
    "karnataka": ("Karnataka", "कर्नाटक", "ಕರ್ನಾಟಕ", "కర్ణాటక", "கர்நாடகா"),
    "telangana": ("Telangana", "तेलंगाना", "ತೆಲಂಗಾಣ", "తెలంగాణ", "தெலுங்கானா"),
    "andhra pradesh": ("Andhra Pradesh", "आंध्र प्रदेश", "ಆಂಧ್ರ ಪ್ರದೇಶ", "ఆంధ్రప్రదేశ్", "ஆந்திர பிரதேசம்"),
    "tamil nadu": ("Tamil Nadu", "तमिलनाडु", "ತಮಿಳುನಾಡು", "తమిళనాడు", "தமிழ்நாடு"),
    "india": ("India", "भारत", "ಭಾರತ", "భారత్", "இந்தியா")
}

def extract_named_entities(text: str, language_code: str) -> List[NamedEntity]:
    """
    Extracts high-precision Named Entities with zero-based code point offsets.
    Avoids boilerplate publisher names, handles Indic script patterns and honorifics.
    """
    entities: List[NamedEntity] = []
    seen_spans: Set[tuple] = set()

    # 1. English Pattern Extraction
    if language_code == "en":
        # Persons with honorifics
        for match in re.finditer(HONORIFICS_EN, text):
            ent_text = match.group(0).strip()
            start, end = match.start(), match.start() + len(ent_text)
            if (start, end) not in seen_spans and ent_text.lower() not in PUBLISHER_BOILERPLATE:
                seen_spans.add((start, end))
                entities.append(NamedEntity(
                    text=ent_text,
                    label=EntityType.PERSON,
                    start_offset=start,
                    end_offset=end,
                    native_script=True,
                    confidence=0.92,
                    source="honorific_pattern"
                ))

        # Organizations
        for match in re.finditer(ORGS_EN, text):
            ent_text = match.group(1).strip()
            start = match.start(1)
            end = start + len(ent_text)
            if (start, end) not in seen_spans and ent_text.lower() not in PUBLISHER_BOILERPLATE:
                seen_spans.add((start, end))
                entities.append(NamedEntity(
                    text=ent_text,
                    label=EntityType.ORGANIZATION,
                    start_offset=start,
                    end_offset=end,
                    native_script=True,
                    confidence=0.88,
                    source="org_suffix_pattern"
                ))

        # Capitalized multi-word sequences (candidate persons/places)
        for match in re.finditer(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b', text):
            cand = match.group(1).strip()
            start, end = match.start(1), match.end(1)
            if (start, end) not in seen_spans and cand.lower() not in PUBLISHER_BOILERPLATE:
                # Filter out start-of-sentence common words
                if not any(cand.startswith(w) for w in ["The ", "This ", "That ", "However ", "According "]):
                    seen_spans.add((start, end))
                    entities.append(NamedEntity(
                        text=cand,
                        label=EntityType.PERSON,
                        start_offset=start,
                        end_offset=end,
                        native_script=True,
                        confidence=0.82,
                        source="capitalized_phrase"
                    ))

    # 2. Indic Honorific and Entity Extraction
    if language_code in INDIC_PERSON_HONORIFICS:
        honorifics = INDIC_PERSON_HONORIFICS[language_code]
        for hon in honorifics:
            pattern = re.compile(rf'({re.escape(hon)}\s+[\S]+(?:\s+[\S]+)?)')
            for match in pattern.finditer(text):
                ent_text = match.group(1).strip()
                start, end = match.start(1), match.start(1) + len(ent_text)
                if (start, end) not in seen_spans:
                    seen_spans.add((start, end))
                    entities.append(NamedEntity(
                        text=ent_text,
                        label=EntityType.PERSON,
                        start_offset=start,
                        end_offset=end,
                        native_script=True,
                        confidence=0.90,
                        source="indic_honorific"
                    ))

    # 3. Known Locations Gazetteer across all languages
    for loc_key, spellings in KNOWN_INDIAN_LOCATIONS.items():
        for sp in spellings:
            pattern = re.compile(rf'\b{re.escape(sp)}\b', re.IGNORECASE if language_code == "en" else 0)
            for match in pattern.finditer(text):
                ent_text = match.group(0).strip()
                start, end = match.start(), match.end()
                if (start, end) not in seen_spans:
                    seen_spans.add((start, end))
                    entities.append(NamedEntity(
                        text=ent_text,
                        label=EntityType.LOCATION,
                        start_offset=start,
                        end_offset=end,
                        native_script=True,
                        transliteration=spellings[0],
                        confidence=0.95,
                        source="gazetteer"
                    ))

    # 4. Dates
    date_patterns = [
        r'\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b',
        r'\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b',
        r'\b\d{1,2}/\d{1,2}/\d{2,4}\b'
    ]
    for dp in date_patterns:
        for match in re.finditer(dp, text, re.IGNORECASE):
            ent_text = match.group(0).strip()
            start, end = match.start(), match.end()
            if (start, end) not in seen_spans:
                seen_spans.add((start, end))
                entities.append(NamedEntity(
                    text=ent_text,
                    label=EntityType.DATE,
                    start_offset=start,
                    end_offset=end,
                    native_script=True,
                    confidence=0.96,
                    source="date_regex"
                ))

    # Verify offset slice integrity
    verified_entities = []
    for ent in entities:
        if validate_offset_slice(text, ent.start_offset, ent.end_offset, ent.text):
            verified_entities.append(ent)

    return sorted(verified_entities, key=lambda e: e.start_offset)

