import re
from typing import Dict, List, Tuple
from app.schemas.language import LanguageDetectionResult, AlternativeLanguage
from app.utils.unicode_utils import identify_dominant_script

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "te": "Telugu",
    "ta": "Tamil",
    "mr": "Marathi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "ur": "Urdu",
    "ml": "Malayalam",
    "other": "Other Language"
}

SCRIPT_TO_LANG = {
    "Kannada": ("kn", "Kannada"),
    "Telugu": ("te", "Telugu"),
    "Tamil": ("ta", "Tamil"),
    "Devanagari": ("hi", "Hindi"),
    "Latin": ("en", "English"),
}

# Common Hindi function words in Devanagari to differentiate Hindi from Marathi or Sanskrit
HINDI_MARKERS = {"है", "हैं", "था", "थे", "थी", "में", "से", "को", "का", "की", "के", "ने", "और", "पर", "नहीं", "किया", "गया"}
MARATHI_MARKERS = {"आहे", "आहेत", "होता", "होते", "होती", "मध्ये", "आणि", "नाही", "केले", "झाले"}

def detect_language(text: str) -> LanguageDetectionResult:
    """
    Identifies language across English, Hindi, Kannada, Telugu, and Tamil.
    Uses Unicode script boundaries, Indic script specificity, and lexical validation.
    Provides calibrated confidence, uncertainty notes, and alternatives.
    """
    if not text or not text.strip():
        return LanguageDetectionResult(
            language_code="other",
            language_name="Unknown",
            confidence=0.0,
            script="Unknown",
            is_supported=False,
            uncertainty_note="Input text is empty; language cannot be determined.",
            alternative_candidates=[]
        )

    dominant_script, script_distribution = identify_dominant_script(text)
    
    # 1. Script-specific Indic detection
    if dominant_script == "Kannada":
        ratio = script_distribution.get("Kannada", 1.0)
        conf = min(0.99, max(0.85, ratio))
        return LanguageDetectionResult(
            language_code="kn",
            language_name="Kannada",
            confidence=conf,
            script="Kannada",
            is_supported=True,
            uncertainty_note=None if ratio > 0.7 else "Mixed Kannada script with Latin / other characters.",
            alternative_candidates=[]
        )

    if dominant_script == "Telugu":
        ratio = script_distribution.get("Telugu", 1.0)
        conf = min(0.99, max(0.85, ratio))
        return LanguageDetectionResult(
            language_code="te",
            language_name="Telugu",
            confidence=conf,
            script="Telugu",
            is_supported=True,
            uncertainty_note=None if ratio > 0.7 else "Mixed Telugu script with Latin / other characters.",
            alternative_candidates=[]
        )

    if dominant_script == "Tamil":
        ratio = script_distribution.get("Tamil", 1.0)
        conf = min(0.99, max(0.85, ratio))
        return LanguageDetectionResult(
            language_code="ta",
            language_name="Tamil",
            confidence=conf,
            script="Tamil",
            is_supported=True,
            uncertainty_note=None if ratio > 0.7 else "Mixed Tamil script with Latin / other characters.",
            alternative_candidates=[]
        )

    if dominant_script == "Devanagari":
        ratio = script_distribution.get("Devanagari", 1.0)
        # Check Devanagari lexical markers to separate Hindi from Marathi
        words = set(re.findall(r'\S+', text))
        marathi_hits = len(words.intersection(MARATHI_MARKERS))
        hindi_hits = len(words.intersection(HINDI_MARKERS))

        if marathi_hits > hindi_hits and marathi_hits >= 2:
            return LanguageDetectionResult(
                language_code="mr",
                language_name="Marathi",
                confidence=0.88,
                script="Devanagari",
                is_supported=False,
                uncertainty_note="Detected Marathi lexical markers in Devanagari text.",
                alternative_candidates=[
                    AlternativeLanguage(code="hi", name="Hindi", confidence=0.25)
                ]
            )

        conf = min(0.99, max(0.88, ratio))
        return LanguageDetectionResult(
            language_code="hi",
            language_name="Hindi",
            confidence=conf,
            script="Devanagari",
            is_supported=True,
            uncertainty_note=None if ratio > 0.7 else "Mixed Devanagari text with Latin loanwords or numbers.",
            alternative_candidates=[]
        )

    if dominant_script == "Latin":
        # Check if text is English using statistical detection or library
        is_english = True
        conf = 0.95
        try:
            from langdetect import detect_langs
            predictions = detect_langs(text[:2000])
            top_pred = predictions[0]
            if top_pred.lang == "en":
                conf = min(0.99, top_pred.prob)
                is_english = True
            else:
                is_english = False
                alt_code = top_pred.lang
                alt_name = LANGUAGE_NAMES.get(alt_code, alt_code.upper())
                return LanguageDetectionResult(
                    language_code=alt_code,
                    language_name=alt_name,
                    confidence=top_pred.prob,
                    script="Latin",
                    is_supported=False,
                    uncertainty_note=f"Latin script detected as {alt_name} rather than English.",
                    alternative_candidates=[
                        AlternativeLanguage(code="en", name="English", confidence=0.15)
                    ]
                )
        except Exception:
            pass

        return LanguageDetectionResult(
            language_code="en",
            language_name="English",
            confidence=conf,
            script="Latin",
            is_supported=True,
            uncertainty_note=None,
            alternative_candidates=[]
        )

    # Unknown / Unsupported script
    return LanguageDetectionResult(
        language_code="other",
        language_name="Other / Unsupported Language",
        confidence=0.50,
        script=dominant_script,
        is_supported=False,
        uncertainty_note=f"Dominant script '{dominant_script}' is not one of the 5 supported target languages.",
        alternative_candidates=[]
    )

