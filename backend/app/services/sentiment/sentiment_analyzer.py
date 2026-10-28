import re
from typing import Dict, List, Tuple
from app.schemas.nlp import SentimentResult, SentimentLabel
from app.utils.unicode_utils import split_into_sentences_with_offsets

# Multilingual Sentiment Lexicon for 5 Target Languages
SENTIMENT_LEXICON = {
    # English
    "en": {
        "positive": {
            "breakthrough", "success", "triumph", "growth", "historic", "peace", "hope", "praised",
            "lauded", "agreement", "cooperation", "positive", "progress", "milestone", "celebrated",
            "victory", "recovery", "relief", "promising", "thriving", "innovative", "effective", "justice"
        },
        "negative": {
            "crisis", "disaster", "collapse", "death", "killed", "tragedy", "corrupt", "violence",
            "scandal", "condemned", "failure", "slammed", "blamed", "clash", "riot", "fraud", "arrested",
            "investigation", "allegations", "warned", "threat", "danger", "outrage", "suffering", "loss"
        },
        "negations": {"not", "never", "no", "hardly", "barely", "scarcely", "without", "failed to"}
    },
    # Hindi
    "hi": {
        "positive": {
            "सफलता", "विकास", "ऐतिहासिक", "प्रगति", "शांति", "जीत", "उम्मीद", "सराहना", "प्रशंसा",
            "उपलब्धि", "सहयोग", "राहत", "सुधार", "उत्साह", "न्याय", "सकारात्मक", "हित", "कल्याण"
        },
        "negative": {
            "संकट", "आपदा", "भ्रष्टाचार", "मौत", "हत्या", "विवाद", "आरोप", "घोटाला", "निंदा", "हिंसा",
            "दंगा", "नुकसान", "त्रासदी", "खतरा", "आक्रोश", "तनाव", "गिरफ्तार", "अवैध", "लापरवाही", "विफल"
        },
        "negations": {"नहीं", "ना", "बिना", "मत", "नकार"}
    },
    # Kannada
    "kn": {
        "positive": {
            "ಯಶಸ್ಸು", "ಅಭಿವೃದ್ಧಿ", "ಐತಿಹಾಸಿಕ", "ಪ್ರಗತಿ", "ಶಾಂತಿ", "ಗೆಲುವು", "ಭರವಸೆ", "ಮೆಚ್ಚುಗೆ",
            "ಸಾಧನೆ", "ನೆರವು", "ಪರಿಹಾರ", "ಹಿತಾಸಕ್ತಿ", "ಸಹಕಾರ", "ಕಲ್ಯಾಣ"
        },
        "negative": {
            "ಸಂಕಷ್ಟ", "ದುರಂತ", "ಭ್ರಷ್ಟಾಚಾರ", "ಸಾವು", "ಕೊಲೆ", "ವಿವಾದ", "ಆರೋಪ", "ಹಗರಣ", "ಖಂಡನೆ",
            "ಹಿಂಸಾಚಾರ", "ದಂಗೆ", "ನಷ್ಟ", "ಅಪಾಯ", "ಆಕ್ರೋಶ", "ಬಂಧನ", "ಅಕ್ರಮ", "ವೈಫಲ್ಯ"
        },
        "negations": {"ಇಲ್ಲ", "ಅಲ್ಲ", "ಬೇಡ", "ಇಲ್ಲದೆ"}
    },
    # Telugu
    "te": {
        "positive": {
            "విజయం", "అభివృద్ధి", "చారిత్రక", "పురోగతి", "శాంతి", "గెలుపు", "ఆశ", "ప్రశంస",
            "సాధన", "సహకారం", "సహాయం", "పరిష్కారం", "న్యాయం", "శుభవార్త"
        },
        "negative": {
            "సంక్షోభం", "విపత్తు", "అవినీతి", "మరణం", "హత్య", "వివాదం", "ఆరోపణ", "కుంభకోణం", "ఖండన",
            "హింస", "నష్టం", "ప్రమాదం", "ఆందోళన", "అరెస్ట్", "వైఫల్యం", "దారుణం"
        },
        "negations": {"కాదు", "లేదు", "వద్దు", "లేకుండా"}
    },
    # Tamil
    "ta": {
        "positive": {
            "வெற்றி", "வளர்ச்சி", "வரலாற்று", "முன்னேற்றம்", "அமைதி", "நம்பிக்கை", "பாராட்டு",
            "சாதனை", "ஒத்துழைப்பு", "நிவாரணம்", "நீதி", "நன்மை", "முயற்சி"
        },
        "negative": {
            "நெருக்கடி", "பேரிடர்", "ஊழல்", "மரணங்கள்", "கொலை", "சர்ச்சை", "குற்றச்சாட்டு", "மோசடி",
            "கண்டனம்", "வன்முறை", "கலவரம்", "இழப்பு", "ஆபத்து", "கைது", "தோல்வி"
        },
        "negations": {"இல்லை", "அல்ல", "கூடாது", "இல்லாமல்"}
    }
}

def analyze_sentiment(text: str, language_code: str) -> SentimentResult:
    """
    Performs explainable, multilingual sentiment analysis.
    Distinguishes positive, negative, neutral, and mixed sentiments.
    Explicitly clarifies that negative news tone is standard journalism, not bias.
    """
    lang = language_code if language_code in SENTIMENT_LEXICON else "en"
    lex = SENTIMENT_LEXICON[lang]

    sentences = split_into_sentences_with_offsets(text)
    if not sentences:
        return SentimentResult(
            label=SentimentLabel.NEUTRAL,
            score=0.0,
            positive_score=0.0,
            negative_score=0.0,
            neutral_score=1.0,
            method="Multilingual clause-level valence scoring",
            limitations="Input text was empty or lacked discernible punctuation.",
            supporting_clauses=[]
        )

    pos_count = 0
    neg_count = 0
    supporting = []

    for s_info in sentences:
        s_text = s_info["text"]
        words = re.findall(r'\S+', s_text.lower())
        
        has_negation = any(w in lex["negations"] for w in words)
        pos_hits = sum(1 for w in words if any(p in w for p in lex["positive"]))
        neg_hits = sum(1 for w in words if any(n in w for n in lex["negative"]))

        # Apply negation flip if preceded by negation word
        if has_negation:
            temp = pos_hits
            pos_hits = neg_hits
            neg_hits = temp

        pos_count += pos_hits
        neg_count += neg_hits

        if pos_hits > 0 or neg_hits > 0:
            clause_val = "positive" if pos_hits > neg_hits else ("negative" if neg_hits > pos_hits else "mixed")
            supporting.append({
                "passage": s_text[:140],
                "valence": clause_val,
                "pos_hits": str(pos_hits),
                "neg_hits": str(neg_hits)
            })

    total_hits = pos_count + neg_count
    total_sentences = len(sentences)

    if total_hits == 0:
        label = SentimentLabel.NEUTRAL
        score = 0.0
        pos_s, neg_s, neu_s = 0.05, 0.05, 0.90
    else:
        norm_pos = pos_count / total_hits
        norm_neg = neg_count / total_hits
        score = round(norm_pos - norm_neg, 3)

        if pos_count > 0 and neg_count > 0 and abs(pos_count - neg_count) <= 1:
            label = SentimentLabel.MIXED
            pos_s, neg_s, neu_s = round(norm_pos * 0.8, 2), round(norm_neg * 0.8, 2), 0.20
        elif score > 0.20:
            label = SentimentLabel.POSITIVE
            pos_s, neg_s, neu_s = round(0.5 + norm_pos * 0.4, 2), round(norm_neg * 0.3, 2), 0.20
        elif score < -0.20:
            label = SentimentLabel.NEGATIVE
            pos_s, neg_s, neu_s = round(norm_pos * 0.3, 2), round(0.5 + norm_neg * 0.4, 2), 0.20
        else:
            label = SentimentLabel.NEUTRAL
            pos_s, neg_s, neu_s = 0.25, 0.25, 0.50

    limitations = (
        "Sentiment analysis reflects lexical tone and reported events. A negative sentiment score indicates "
        "reporting on conflicts, tragedy, or crises, and must NOT be equated with journalistic bias."
    )

    return SentimentResult(
        label=label,
        score=score,
        positive_score=min(1.0, pos_s),
        negative_score=min(1.0, neg_s),
        neutral_score=min(1.0, neu_s),
        method="Rule-based multilingual valence mapping with negation shifters",
        limitations=limitations,
        supporting_clauses=supporting[:8]
    )

