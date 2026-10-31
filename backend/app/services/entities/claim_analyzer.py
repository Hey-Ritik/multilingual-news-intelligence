import re
from typing import List
from app.schemas.nlp import ClaimObservation, ClaimType
from app.utils.unicode_utils import split_into_sentences_with_offsets, validate_offset_slice

ATTRIBUTION_PATTERNS = {
    "en": [
        (r'\b(?:said|stated|claimed|alleged|reported|declared|argued|pointed out|according to|added)\b', ClaimType.ATTRIBUTED_CLAIM),
        (r'\b(?:denied|rejected|refuted|dismissed|disputed|countered)\b', ClaimType.DENIAL_DISPUTE),
        (r'\b(?:allegedly|supposedly|purportedly|reportedly|unconfirmed|sources claimed)\b', ClaimType.ALLEGATION),
        (r'\b(?:in my opinion|believes|feels|seems|apparent|arguably)\b', ClaimType.OPINION),
        (r'\b(?:might|could|may|perhaps|possibly|potential|uncertain)\b', ClaimType.HEDGE_UNCERTAINTY)
    ],
    "hi": [
        (r'(?:कहा|बताया|दावा किया|बयान दिया|के अनुसार|उल्लेख किया)', ClaimType.ATTRIBUTED_CLAIM),
        (r'(?:खारिज किया|इनकार किया|खंडन किया|अस्वीकार किया)', ClaimType.DENIAL_DISPUTE),
        (r'(?:कथित तौर पर|आरोप लगाया|सूत्रों के अनुसार|शंका)', ClaimType.ALLEGATION),
        (r'(?:शायद|हो सकता है|संभावना है|आशंका है)', ClaimType.HEDGE_UNCERTAINTY)
    ],
    "kn": [
        (r'(?:ಹೇಳಿದರು|ತಿಳಿಸಿದರು|ಪ್ರಕಾರ|ಪ್ರತಿಕ್ರಿಯಿಸಿದರು)', ClaimType.ATTRIBUTED_CLAIM),
        (r'(?:ತಿರಸ್ಕರಿಸಿದರು|ನಿರಾಕರಿಸಿದರು|ಖಂಡಿಸಿದರು)', ClaimType.DENIAL_DISPUTE),
        (r'(?:ಆರೋಪಿಸಿದ್ದಾರೆ|ವರದಿಯಾಗಿದೆ|ಶಂಕೆ ವ್ಯಕ್ತಪಡಿಸಿದ್ದಾರೆ)', ClaimType.ALLEGATION)
    ],
    "te": [
        (r'(?:చెప్పారు|తెలిపారు|ప్రకారం|పేర్కొన్నారు)', ClaimType.ATTRIBUTED_CLAIM),
        (r'(?:ఖండించారు|తిరస్కరించారు|తోసిపుచ్చారు)', ClaimType.DENIAL_DISPUTE),
        (r'(?:ఆరోపించారు|సమాచారం|అనుమానం)', ClaimType.ALLEGATION)
    ],
    "ta": [
        (r'(?:கூறினார்|தெரிவித்தார்|படி|குறிப்பிட்டார்)', ClaimType.ATTRIBUTED_CLAIM),
        (r'(?:மறுத்தார்|நிராகரித்தார்|எதிர்த்தார்)', ClaimType.DENIAL_DISPUTE),
        (r'(?:குற்றம் சாட்டினார்|தகவல்|சந்தேகம்)', ClaimType.ALLEGATION)
    ]
}

def analyze_claims_and_attribution(text: str, language_code: str) -> List[ClaimObservation]:
    """
    Analyzes sentences to identify factual statements, attributed claims, allegations,
    denials, opinions, and hedged uncertainties.
    Preserves exact offsets and validates slicing.
    """
    lang = language_code if language_code in ATTRIBUTION_PATTERNS else "en"
    patterns = ATTRIBUTION_PATTERNS[lang]

    sentences = split_into_sentences_with_offsets(text)
    observations: List[ClaimObservation] = []

    for s_info in sentences:
        s_text = s_info["text"]
        s_start = s_info["start_offset"]
        s_end = s_info["end_offset"]

        matched_type = None
        matched_verb = None

        # Check for specific claim/attribution markers
        for regex_str, c_type in patterns:
            match = re.search(regex_str, s_text, re.IGNORECASE)
            if match:
                matched_type = c_type
                matched_verb = match.group(0)
                break

        if not matched_type:
            # If no attribution, denial, or hedge marker is found, classify as direct factual statement
            matched_type = ClaimType.FACTUAL_STATEMENT
            notes = "Direct narration without explicit attribution marker."
        else:
            notes = f"Identified marker '{matched_verb}'. Attributed statements reflect source assertions, not verified facts."

        obs = ClaimObservation(
            claim_type=matched_type,
            text=s_text,
            start_offset=s_start,
            end_offset=s_end,
            speaker_or_source=None,
            attribution_verb=matched_verb,
            confidence=0.85,
            notes=notes
        )

        if validate_offset_slice(text, obs.start_offset, obs.end_offset, obs.text):
            observations.append(obs)

    return observations

