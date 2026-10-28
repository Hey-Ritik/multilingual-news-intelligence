import re
import uuid
from typing import List, Dict, Optional, Tuple
from app.schemas.framing import FramingEvidence, FramingCategory, FramingAnalysisResult
from app.schemas.nlp import NamedEntity, EntityType
from app.utils.unicode_utils import (
    validate_offset_slice, split_into_sentences_with_offsets, count_words_and_tokens
)

# Multilingual Framing Indicators
LOADED_WORDS = {
    "en": [
        ("ruthless", "High-intensity derogatory adjective characterizing an actor negatively"),
        ("draconian", "Pejorative label framing a policy as excessively harsh and autocratic"),
        ("catastrophic", "Hyperbolic evaluation emphasizing disaster over objective impact"),
        ("spectacular", "Excessively laudatory framing boosting achievement"),
        ("shameful", "Moralizing judgmental term steering reader condemnation"),
        ("heroic", "Romanticized laudatory portrayal elevating an actor"),
        ("puppet", "Dehumanizing epithet invalidating an actor's agency"),
        ("radical", "Polarizing political label framing an entity as extreme"),
        ("arrogant", "Attributive character judgment without factual evidence")
    ],
    "hi": [
        ("क्रूर", "कठोर और नकारात्मक रूप से किसी पात्र को चित्रित करने वाला शब्द"),
        ("तानाशाही", "सत्तावादी और असंवैधानिक व्यवस्था दर्शाने वाला शब्द"),
        ("विनाशकारी", "अत्यधिक नकारात्मक और नाटकीय प्रभाव पैदा करने वाला शब्द"),
        ("शर्मनाक", "नैतिक रूप से निंदा करने वाला विशेषण"),
        ("कठपुतली", "स्वतंत्रता और स्वायत्तता को नकारने वाला शब्द")
    ],
    "kn": [
        ("ಕ್ರೂರ", "ನಕಾರಾತ್ಮಕ ಮತ್ತು ಕಠಿಣ ಚಿತ್ರಣ ನೀಡುವ ಪದ"),
        ("ಸರ್ವಾಧಿಕಾರಿ", "ಪ್ರಜಾಪ್ರಭುತ್ವ ವಿರೋಧಿ ಎಂದು ಬಿಂಬಿಸುವ ಲೇಬಲ್"),
        ("ನಾಚಿಕೆಗೇಡು", "ನೈತಿಕ ಖಂಡನೆಯನ್ನು ಪ್ರಚೋದಿಸುವ ಪದ")
    ],
    "te": [
        ("క్రూరమైన", "తీవ్రమైన వ్యతిరేక భావనను కలిగించే పదం"),
        ("నిరంకుశ", "అధికార దుర్వినియోగాన్ని సూచించే పదం"),
        ("సిగ్గుచేటు", "నైతిక విమర్శను రేకెత్తించే పదం")
    ],
    "ta": [
        ("கொடூரமான", "கடும் எதிர்மறை சித்தரிப்பு தரும் சொல்"),
        ("சர்வாதிகார", "ஜனநாயக விரோத முத்திரை குத்தும் சொல்"),
        ("வெட்கக்கேடான", "தார்மீக கண்டனம் தூண்டும் சொல்")
    ]
}

GENERALIZATIONS = {
    "en": ["always", "never", "everyone", "nobody", "all citizens", "completely", "without doubt", "unquestionably"],
    "hi": ["हमेशा", "कभी नहीं", "हर कोई", "सभी लोग", "पूरी तरह", "निःसंदेह"],
    "kn": ["ಯಾವಾಗಲೂ", "ಎಂದಿಗೂ", "ಎಲ್ಲರೂ", "ಸಂಪೂರ್ಣವಾಗಿ", "ನಿಸ್ಸಂದೇಹವಾಗಿ"],
    "te": ["ఎల్లప్పుడూ", "ఎప్పుడూ", "అందరూ", "పూర్తిగా", "నిస్సందేహంగా"],
    "ta": ["எப்போதும்", "ஒருபோதும்", "அனைவரும்", "முற்றிலும்", "சந்தேகமின்றி"]
}

HEDGING_TERMS = {
    "en": ["allegedly", "reportedly", "purportedly", "claimed", "sources suggest", "purported", "it is believed"],
    "hi": ["कथित तौर पर", "बताया जा रहा है", "दावा किया गया", "सूत्रों के मुताबिक"],
    "kn": ["ವರದಿಗಳ ಪ್ರಕಾರ", "ಆರೋಪಿಸಲಾಗಿದೆ", "ತಿಳಿದುಬಂದಿದೆ"],
    "te": ["సమాచారం ప్రకారం", "ఆరోపించబడింది", "తెలుస్తోంది"],
    "ta": ["கூறப்படுகிறது", "தகவல்கள் தெரிவிக்கின்றன", "குற்றம் சாட்டப்பட்டுள்ளது"]
}

def analyze_bias_and_framing(
    text: str,
    language_code: str,
    entities: List[NamedEntity]
) -> FramingAnalysisResult:
    """
    Identifies evidence-backed framing patterns in the original article text.
    Every finding contains exact Unicode code-point offsets, potential reader effects,
    and alternative interpretations.
    """
    findings: List[FramingEvidence] = []
    category_counts: Dict[str, int] = {c.value: 0 for c in FramingCategory}

    lang = language_code if language_code in LOADED_WORDS else "en"
    sentences = split_into_sentences_with_offsets(text)
    word_count, token_count = count_words_and_tokens(text)

    # 1. Loaded / Evaluative Language
    loaded_rules = LOADED_WORDS.get(lang, LOADED_WORDS["en"])
    for word, expl in loaded_rules:
        pattern = re.compile(rf'\b{re.escape(word)}\b', re.IGNORECASE if lang == "en" else 0)
        for match in pattern.finditer(text):
            start, end = match.start(), match.end()
            exact = text[start:end]
            finding = FramingEvidence(
                finding_id=f"frame_{uuid.uuid4().hex[:8]}",
                category=FramingCategory.LOADED_LANGUAGE,
                label="Loaded Adjective / Epithet",
                exact_text=exact,
                start_offset=start,
                end_offset=end,
                explanation=f"Evaluative vocabulary '{exact}': {expl}.",
                potential_effect="Colors reader emotional perception and primes negative or positive moral evaluation.",
                evidence_strength="high",
                alternative_interpretation="May reflect an accurate eyewitness description or a quoted source's characterization.",
                method="Lexical evaluation pattern matching",
                actor_or_speaker=None
            )
            if validate_offset_slice(text, start, end, exact):
                findings.append(finding)
                category_counts[FramingCategory.LOADED_LANGUAGE.value] += 1

    # 2. Absolutist Language and Generalizations
    gen_list = GENERALIZATIONS.get(lang, GENERALIZATIONS["en"])
    for word in gen_list:
        pattern = re.compile(rf'\b{re.escape(word)}\b', re.IGNORECASE if lang == "en" else 0)
        for match in pattern.finditer(text):
            start, end = match.start(), match.end()
            exact = text[start:end]
            finding = FramingEvidence(
                finding_id=f"frame_{uuid.uuid4().hex[:8]}",
                category=FramingCategory.GENERALIZATION,
                label="Absolutist / Universal Claim",
                exact_text=exact,
                start_offset=start,
                end_offset=end,
                explanation=f"Absolutist modifier '{exact}' eliminates nuance or counter-evidence.",
                potential_effect="Creates an impression of total consensus or universal culpability where variance exists.",
                evidence_strength="medium",
                alternative_interpretation="Could represent rhetorical emphasis by the author or speaker.",
                method="Universal quantifier analysis",
                actor_or_speaker=None
            )
            if validate_offset_slice(text, start, end, exact):
                findings.append(finding)
                category_counts[FramingCategory.GENERALIZATION.value] += 1

    # 3. Hedging & Attribution of Allegations
    hedge_list = HEDGING_TERMS.get(lang, HEDGING_TERMS["en"])
    for word in hedge_list:
        pattern = re.compile(rf'\b{re.escape(word)}\b', re.IGNORECASE if lang == "en" else 0)
        for match in pattern.finditer(text):
            start, end = match.start(), match.end()
            exact = text[start:end]
            finding = FramingEvidence(
                finding_id=f"frame_{uuid.uuid4().hex[:8]}",
                category=FramingCategory.HEDGING_QUALIFYING,
                label="Epistemic Hedge / Sourced Allegation",
                exact_text=exact,
                start_offset=start,
                end_offset=end,
                explanation=f"Qualifying term '{exact}' marks the statement as unverified or reported second-hand.",
                potential_effect="Distances the publisher from factual liability while signaling informational uncertainty.",
                evidence_strength="medium",
                alternative_interpretation="Standard responsible journalism practice to qualify unproven police or judicial claims.",
                method="Epistemic marker detection",
                actor_or_speaker=None
            )
            if validate_offset_slice(text, start, end, exact):
                findings.append(finding)
                category_counts[FramingCategory.HEDGING_QUALIFYING.value] += 1

    # 4. Actor Portrayal analysis around named actors
    for ent in entities:
        if ent.label in (EntityType.PERSON, EntityType.ORGANIZATION):
            # Check surrounding sentence for evaluative modifiers
            for s_info in sentences:
                if ent.start_offset >= s_info["start_offset"] and ent.end_offset <= s_info["end_offset"]:
                    s_text = s_info["text"]
                    if any(crit in s_text.lower() for crit in ["accused", "scandal", "blamed", "corrupt", "mastermind"]):
                        finding = FramingEvidence(
                            finding_id=f"frame_{uuid.uuid4().hex[:8]}",
                            category=FramingCategory.ACTOR_PORTRAYAL,
                            label="Critical Actor Portrayal",
                            exact_text=ent.text,
                            start_offset=ent.start_offset,
                            end_offset=ent.end_offset,
                            explanation=f"Actor '{ent.text}' appears in context emphasizing culpability or conflict.",
                            potential_effect="Focuses causal agency and reader accountability onto this specific actor.",
                            evidence_strength="medium",
                            alternative_interpretation="May simply reflect the factual nature of formal allegations or police filings.",
                            method="Entity-predicate valence pairing",
                            actor_or_speaker=ent.text
                        )
                        if validate_offset_slice(text, ent.start_offset, ent.end_offset, ent.text):
                            findings.append(finding)
                            category_counts[FramingCategory.ACTOR_PORTRAYAL.value] += 1
                    break

    # Calculate evidence density per 1,000 tokens
    density = round((len(findings) / max(1, token_count)) * 1000, 2)

    # Article-level synthesis
    if len(findings) == 0:
        assessment = (
            "The article maintains predominantly neutral expository framing with minimal evaluative modifiers, "
            "absolutist generalities, or loaded terminology."
        )
    else:
        top_cats = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
        top_active = [f"{cat.replace('_', ' ').title()} ({cnt})" for cat, cnt in top_cats if cnt > 0]
        assessment = (
            f"The article demonstrates observable linguistic framing patterns primarily in: {', '.join(top_active[:3])}. "
            f"Observed evidence density is {density} indicators per 1,000 tokens."
        )

    unsupported_conclusions = (
        "Linguistic framing observations document specific textual choices and potential reader effects. "
        "They do NOT establish political motivation, editorial bad faith, or intentional misinformation. "
        "Investigative reporting on crime or corruption naturally employs critical vocabulary without constituting unfair bias."
    )

    methodology = (
        "Grounded Unicode offset analysis of evaluative adjectives, epistemic hedges, universal quantifiers, "
        "and actor-predicate collocations. Every finding is strictly validated against the source character span."
    )

    return FramingAnalysisResult(
        findings=findings,
        category_counts={k: v for k, v in category_counts.items() if v > 0},
        density_per_1000_tokens=density,
        article_level_assessment=assessment,
        unsupported_conclusions_note=unsupported_conclusions,
        methodology=methodology
    )

