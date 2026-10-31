import re
from typing import Tuple, List, Dict

# Unicode Script Ranges
SCRIPT_RANGES = {
    "Devanagari": (0x0900, 0x097F),
    "Kannada": (0x0C80, 0x0CFF),
    "Telugu": (0x0C00, 0x0C7F),
    "Tamil": (0x0B80, 0x0BFF),
    "Latin": (0x0020, 0x024F),
}

def identify_dominant_script(text: str) -> Tuple[str, Dict[str, float]]:
    """
    Identifies the dominant script by counting Unicode code points in known script blocks.
    Returns (dominant_script_name, script_distribution).
    """
    if not text:
        return "Unknown", {}

    counts: Dict[str, int] = {k: 0 for k in SCRIPT_RANGES}
    total_valid = 0

    for char in text:
        cp = ord(char)
        if char.isspace() or char in '.,;:!?"\'()[]{}-–—।॥0123456789':
            continue
        total_valid += 1
        for script, (start, end) in SCRIPT_RANGES.items():
            if start <= cp <= end:
                counts[script] += 1
                break

    if total_valid == 0:
        return "Unknown", {}

    distribution = {k: round(v / total_valid, 4) for k, v in counts.items()}
    dominant = max(distribution.items(), key=lambda item: item[1])
    if dominant[1] == 0:
        return "Unknown", distribution
    return dominant[0], distribution

def validate_offset_slice(original_text: str, start: int, end: int, expected_substring: str) -> bool:
    """
    Verifies that original_text[start:end] strictly equals expected_substring
    using zero-based Unicode code-point offsets.
    """
    if start < 0 or end > len(original_text) or start >= end:
        return False
    return original_text[start:end] == expected_substring

def split_into_sentences_with_offsets(text: str) -> List[Dict[str, any]]:
    """
    Splits text into sentences preserving zero-based character offsets.
    Handles standard punctuation (. ! ?) and Indic punctuation (danda । and double danda ॥).
    """
    sentences = []
    # Pattern matching sentence boundaries while keeping track of spans
    pattern = re.compile(r'[^.!?।॥\n]+(?:[.!?।॥]+|\n+|$)', re.UNICODE)
    
    for match in pattern.finditer(text):
        raw_sentence = match.group(0)
        s_text = raw_sentence.strip()
        if not s_text:
            continue
        
        # Calculate stripped offsets relative to the match
        lead_spaces = len(raw_sentence) - len(raw_sentence.lstrip())
        start = match.start() + lead_spaces
        end = start + len(s_text)
        
        sentences.append({
            "text": s_text,
            "start_offset": start,
            "end_offset": end
        })
        
    return sentences

def count_words_and_tokens(text: str) -> Tuple[int, int]:
    """
    Returns (word_count, approximate_token_count).
    Indic scripts are word-spaced, so whitespace tokens provide standard word counts,
    while token counts account for morphology / subwords.
    """
    words = re.findall(r'\S+', text)
    word_count = len(words)
    # Average ~1.3 tokens per word for English, ~1.8-2.2 for Indic scripts
    dominant, _ = identify_dominant_script(text)
    multiplier = 2.0 if dominant in ["Devanagari", "Kannada", "Telugu", "Tamil"] else 1.3
    token_count = max(1, int(word_count * multiplier))
    return word_count, token_count

