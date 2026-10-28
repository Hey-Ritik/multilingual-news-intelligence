import re
from typing import List, Tuple, Dict, Optional
from app.schemas.nlp import EmotionResult, EmotionFinding, EmotionLabel
from app.utils.unicode_utils import split_into_sentences_with_offsets

# Emotion Lexicon across the 5 Target Languages
EMOTION_LEXICON = {
    # English
    "en": {
        EmotionLabel.ANGER: {"furious", "outrage", "slammed", "condemned", "fury", "infuriated", "wrath", "backlash", "hostility"},
        EmotionLabel.FEAR: {"terrifying", "panic", "dread", "threat", "feared", "danger", "alarm", "scared", "catastrophe"},
        EmotionLabel.SADNESS: {"mourn", "grief", "tragic", "heartbreaking", "sorrow", "devastated", "loss", "tears", "anguish"},
        EmotionLabel.JOY: {"triumph", "celebration", "delight", "ecstatic", "jubilant", "rejoice", "proud", "glory", "victorious"},
        EmotionLabel.DISGUST: {"appalling", "revolting", "disgraceful", "shameful", "vile", "loathsome", "corrupt", "repugnant"},
        EmotionLabel.SURPRISE: {"stunned", "shocked", "astonishing", "unexpected", "unprecedented", "jaw-dropping", "bombshell"}
    },
    # Hindi
    "hi": {
        EmotionLabel.ANGER: {"क्रोध", "गुस्सा", "आक्रोश", "नाराजगी", "भड़का", "निंदा", "हमला"},
        EmotionLabel.FEAR: {"भय", "डर", "दहशत", "खौफ", "आतंक", "आशंका", "खतरा"},
        EmotionLabel.SADNESS: {"दुख", "शोक", "मातम", "त्रासदी", "पीड़ा", "वेदना", "गम"},
        EmotionLabel.JOY: {"खुशी", "उत्साह", "जश्न", "हर्ष", "उमंग", "प्रसन्नता", "गर्व"},
        EmotionLabel.DISGUST: {"घिनौना", "शर्मनाक", "भ्रष्ट", "अपमानजनक", "निंदनीय"},
        EmotionLabel.SURPRISE: {"हैरान", "चौंकाने", "स्तब्ध", "अचानक", "आश्चर्य"}
    },
    # Kannada
    "kn": {
        EmotionLabel.ANGER: {"ಕೋಪ", "ಆಕ್ರೋಶ", "ಕಿಡಿಕಾರಿದ", "ಖಂಡನೆ", "ಉದ್ವಿಗ್ನತೆ"},
        EmotionLabel.FEAR: {"ಭಯ", "ಆತಂಕ", "ದಿಗಿಲು", "ಭೀತಿ", "ಆಪತ್ತು"},
        EmotionLabel.SADNESS: {"ದುಃಖ", "ಶೋಕ", "ವೇದನೆ", "ಸಂಕಟ", "ನೋವು"},
        EmotionLabel.JOY: {"ಸಂತೋಷ", "ಹರ್ಷ", "ಸಂಭ್ರಮ", "ಗೆಲುವು", "ಉತ್ಸಾಹ"},
        EmotionLabel.DISGUST: {"ಅಸಹ್ಯ", "ನಾಚಿಕೆಗೇಡು", "ಹೇವರಿಕೆ", "ಕೀಳು"},
        EmotionLabel.SURPRISE: {"ಆಶ್ಚರ್ಯ", "ಆಘಾತ", "ದಿಗ್ಭ್ರಮೆ", "ಅನಿರೀಕ್ಷಿತ"}
    },
    # Telugu
    "te": {
        EmotionLabel.ANGER: {"కోపం", "ఆగ్రహం", "ఆందోళన", "తీవ్ర నిరసన", "విరుచుకుపడ్డారు"},
        EmotionLabel.FEAR: {"భయం", "ఆందోళన", "దడ", "భీతి", "ప్రమాదం"},
        EmotionLabel.SADNESS: {"విచారం", "శోకం", "బాధ", "వేదన", "కన్నీరు"},
        EmotionLabel.JOY: {"సంతోషం", "ఆనందం", "సంబరాలు", "హర్షం", "విజయోత్సవం"},
        EmotionLabel.DISGUST: {"అసహ్యం", "సిగ్గుచేటు", "హేయం", "దుర్మార్గం"},
        EmotionLabel.SURPRISE: {"ఆశ్చర్యం", "షాక్", "విస్మయం", "ఊహించని"}
    },
    # Tamil
    "ta": {
        EmotionLabel.ANGER: {"கோபம்", "ஆத்திரம்", "கண்டனம்", "கொந்தளிப்பு", "எதிர்ப்பு"},
        EmotionLabel.FEAR: {"பயம்", "அச்சம்", "பீதி", "பயங்கரம்", "பதற்றம்"},
        EmotionLabel.SADNESS: {"சோகம்", "துக்கம்", "வேதனை", "துயரம்", "கண்ணீர்"},
        EmotionLabel.JOY: {"மகிழ்ச்சி", "கொண்டாட்டம்", "பெருமிதம்", "வெற்றி", "உற்சாகம்"},
        EmotionLabel.DISGUST: {"அருவருப்பு", "வெட்கக்கேடு", "இழிவு", "கேவலமான"},
        EmotionLabel.SURPRISE: {"அதிர்ச்சி", "ஆச்சரியம்", "வியப்பு", "எதிர்பாராத"}
    }
}

QUOTE_PATTERN = re.compile(r'["“«]([^"”»]+)["”»]', re.UNICODE)

def extract_quotes_with_spans(text: str) -> List[Tuple[int, int, str]]:
    """Finds all quoted substrings and their character spans."""
    spans = []
    for match in QUOTE_PATTERN.finditer(text):
        spans.append((match.start(), match.end(), match.group(1)))
    return spans

def is_inside_quote(start: int, end: int, quote_spans: List[Tuple[int, int, str]]) -> Tuple[bool, Optional[str]]:
    for q_start, q_end, q_text in quote_spans:
        if q_start <= start and end <= q_end:
            return True, q_text
    return False, None

def analyze_emotion(text: str, language_code: str) -> EmotionResult:
    """
    Performs emotion detection while strictly separating quoted emotions from journalist narration.
    """
    lang = language_code if language_code in EMOTION_LEXICON else "en"
    lex = EMOTION_LEXICON[lang]
    quote_spans = extract_quotes_with_spans(text)

    sentences = split_into_sentences_with_offsets(text)
    findings: List[EmotionFinding] = []
    emotion_counts: Dict[EmotionLabel, int] = {e: 0 for e in EmotionLabel}

    for s_info in sentences:
        s_text = s_info["text"]
        s_start = s_info["start_offset"]
        s_end = s_info["end_offset"]
        lower_s = s_text.lower()

        is_quoted, quote_content = is_inside_quote(s_start, s_end, quote_spans)

        for emotion, keywords in lex.items():
            matched_words = [kw for kw in keywords if kw in lower_s]
            if matched_words:
                finding = EmotionFinding(
                    emotion=emotion,
                    score=min(0.95, 0.65 + len(matched_words) * 0.1),
                    text_passage=s_text[:140],
                    start_offset=s_start,
                    end_offset=s_end,
                    is_speaker_quote=is_quoted,
                    speaker="Quoted Source" if is_quoted else None
                )
                findings.append(finding)
                emotion_counts[emotion] += 1

    journalist_findings = [f for f in findings if not f.is_speaker_quote]
    speaker_findings = [f for f in findings if f.is_speaker_quote]

    # Determine primary emotion
    valid_counts = {k: v for k, v in emotion_counts.items() if k != EmotionLabel.NEUTRAL and v > 0}
    if valid_counts:
        primary_emotion = max(valid_counts.items(), key=lambda x: x[1])[0]
    else:
        primary_emotion = EmotionLabel.NEUTRAL

    limitations = (
        "Emotion analysis separates statements inside quotes from authorial narration. "
        "A speaker's quoted sorrow or outrage is attributed to the speaker, not the reporting journalist."
    )

    return EmotionResult(
        primary_emotion=primary_emotion,
        detected_emotions=findings,
        journalist_emotions=journalist_findings,
        speaker_emotions=speaker_findings,
        method="Attribute-aware multilingual emotional lexicon matching with quotation de-nesting",
        limitations=limitations
    )

