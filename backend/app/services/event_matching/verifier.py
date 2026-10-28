import re
from typing import List, Tuple
from app.schemas.discovery import ArticleCandidate, CandidateOutcome
from app.schemas.event import EventProfile
from app.services.news_discovery.query_generator import ACTION_TRANSLATIONS, LOCATION_TRANSLATIONS
from app.services.event_matching.entity_normalizer import (
    match_entity_multilingual,
    check_for_conflicting_incident,
    extract_incident_identifiers_from_text,
    INCIDENT_CONTEXT_TAXONOMY
)

def compute_character_ngram_similarity(text_a: str, text_b: str, n: int = 3) -> float:
    """Computes Jaccard similarity of character n-grams across multilingual texts."""
    def get_ngrams(s: str) -> set:
        s_clean = re.sub(r'\s+', ' ', s.lower().strip())
        if len(s_clean) < n:
            return {s_clean}
        return {s_clean[i:i+n] for i in range(len(s_clean) - n + 1)}

    ngrams_a = get_ngrams(text_a)
    ngrams_b = get_ngrams(text_b)
    if not ngrams_a or not ngrams_b:
        return 0.0

    intersection = len(ngrams_a.intersection(ngrams_b))
    union = len(ngrams_a.union(ngrams_b))
    return round(intersection / union, 4)

def verify_candidate_same_event(
    candidate: ArticleCandidate,
    profile: EventProfile
) -> Tuple[CandidateOutcome, float, float, str]:
    """
    Evaluates candidate relevance using strict, conservative multi-signal verification:
    1. Rejection of conflicting incident subjects (e.g. food fights, cyber fraud, narcotics).
    2. Language-aware entity normalization & transliteration matching.
    3. Action & event-type compatibility across 5 target languages.
    4. Specific policy / case / incident contextual corroboration.
    5. Location and semantic similarity.

    Returns (outcome, similarity_score, entity_overlap_score, reasoning).
    """
    cand_text = f"{candidate.title} {candidate.snippet or ''}".lower()
    profile_text = f"{profile.headline} {profile.event_description}".lower()

    # 1. Check for insufficient text
    if len(cand_text.strip()) < 25:
        return (
            CandidateOutcome.INSUFFICIENT_EVIDENCE,
            0.0,
            0.0,
            "Insufficient evidence: Candidate title and snippet are too brief to verify event correspondence."
        )

    # 2. Check for explicitly conflicting incidents (food violence, cyber fraud, narcotics, etc.)
    has_conflict, conflict_reason = check_for_conflicting_incident(
        source_incident_category=profile.action_type,
        candidate_text=cand_text
    )
    if has_conflict:
        sim_score = compute_character_ngram_similarity(profile_text, cand_text)
        return (
            CandidateOutcome.DIFFERENT_EVENT,
            sim_score,
            0.0,
            f"Different event: Involves conflicting incident ({conflict_reason}) despite shared geographic or police terminology."
        )

    # 3. Primary Entity Overlap with Language-Aware Transliterations
    primary_actors = profile.principal_actors
    primary_orgs = profile.principal_organizations

    matched_actors = []
    for actor in primary_actors:
        matched, alias = match_entity_multilingual(actor, cand_text)
        if matched:
            matched_actors.append(f"{actor} ('{alias}')")

    matched_orgs = []
    for org in primary_orgs:
        matched, alias = match_entity_multilingual(org, cand_text)
        if matched:
            matched_orgs.append(f"{org} ('{alias}')")

    total_key_entities = len(primary_actors) + len(primary_orgs)
    entity_hits = len(matched_actors) + len(matched_orgs)
    entity_overlap_score = round(entity_hits / max(1, total_key_entities), 2)

    # 4. Action Concordance across languages
    ACTION_STEMS_MULTILINGUAL = {
        "arrest": {
            "en": ["arrest", "arrested", "detained", "held", "custody", "remand"],
            "hi": ["गिरफ्तार", "हिरासत", "पकड़ा"],
            "kn": ["ಬಂಧ", "ಬಂಧನ", "ಬಂಧಿಸಿದೆ", "ವಶಕ್ಕೆ"],
            "te": ["అరెస్ట్", "అదుపు", "అదుపులోకి", "బంధించారు"],
            "ta": ["கைது", "காவலில்", "பிடிபட்ட"]
        },
        "launch": {
            "en": ["launch", "inaugurat", "unveil", "solar", "policy", "scheme"],
            "hi": ["उद्घाटन", "शुरू", "योजना", "नीति", "पॉलिसी", "सौर"],
            "kn": ["ಉದ್ಘಾಟನೆ", "ಆರಂಭ", "ಯೋಜನೆ", "ನೀತಿ", "ಸೌರ"],
            "te": ["ప్రారంభం", "పథకం", "విధానం", "సౌర"],
            "ta": ["தொடக்கம்", "திட்டம்", "கொள்கை", "சூரிய"]
        }
    }

    action_matched = False
    action_dict = ACTION_TRANSLATIONS.get(profile.main_action, {})
    action_term_native = action_dict.get(candidate.language, "").lower()
    action_term_en = action_dict.get("en", "").lower()

    if action_term_native and action_term_native in cand_text:
        action_matched = True
    elif action_term_en and action_term_en in cand_text:
        action_matched = True
    else:
        # Check multilingual action stems based on profile main_action
        main_act_lower = profile.main_action.lower()
        target_action_key = "arrest" if "arrest" in main_act_lower or "detain" in main_act_lower else ("launch" if "launch" in main_act_lower or "inaugurat" in main_act_lower else None)
        if target_action_key and target_action_key in ACTION_STEMS_MULTILINGUAL:
            stems_for_lang = ACTION_STEMS_MULTILINGUAL[target_action_key].get(candidate.language, [])
            stems_en = ACTION_STEMS_MULTILINGUAL[target_action_key].get("en", [])
            all_stems = stems_for_lang + stems_en
            if any(stem in cand_text for stem in all_stems):
                action_matched = True

    # 5. Incident / Case Corroboration
    cand_incident_markers = extract_incident_identifiers_from_text(cand_text)
    profile_incident_markers = profile.incident_identifiers or extract_incident_identifiers_from_text(profile_text)

    # Check overlap in incident markers
    incident_corroborated = False
    matched_case_terms = []
    if profile_incident_markers:
        # Check against multilingual incident taxonomy
        for cat_key, terms in INCIDENT_CONTEXT_TAXONOMY.items():
            profile_has_cat = any(p.lower() in terms for p in profile_incident_markers) or any(t in profile_text for t in terms)
            if profile_has_cat:
                cand_has_cat = any(t in cand_text for t in terms)
                if cand_has_cat:
                    incident_corroborated = True
                    matched_case_terms.append(cat_key.replace('_', ' '))

    # 6. Location Agreement
    location_matched = False
    if profile.location:
        loc_key = profile.location.lower()
        loc_trans = LOCATION_TRANSLATIONS.get(loc_key, {})
        loc_native = loc_trans.get(candidate.language, "").lower()
        if loc_key in cand_text or (loc_native and loc_native in cand_text):
            location_matched = True

    sim_score = compute_character_ngram_similarity(profile_text, cand_text)

    # ==========================================
    # CONSERVATIVE CLASSIFICATION DECISION LOGIC
    # ==========================================

    # 1. VERIFIED SAME EVENT: Primary distinctive actor + matching action + case corroboration
    if len(matched_actors) >= 1 and action_matched and (incident_corroborated or sim_score > 0.22):
        case_note = f" and specific case markers ({matched_case_terms[0]})" if matched_case_terms else ""
        reasoning = (
            f"Verified same-event: Corroborated primary actor {matched_actors[0]}, "
            f"matching action verb ('{profile.main_action}'){case_note}."
        )
        return CandidateOutcome.VERIFIED_SAME_EVENT, sim_score, entity_overlap_score, reasoning

    # 2. POSSIBLE MATCH: Primary actor and action matched, but specific incident markers unverified in snippet
    if len(matched_actors) >= 1 and action_matched:
        reasoning = (
            f"Possible match — more evidence required: Confirmed primary actor {matched_actors[0]} and action ('{profile.main_action}'), "
            f"but specific case details require full-text verification."
        )
        return CandidateOutcome.POSSIBLE_MATCH, sim_score, entity_overlap_score, reasoning

    # 3. RELATED TOPIC ONLY: Same primary actor, but distinct action or non-matching event
    if len(matched_actors) >= 1 and not action_matched:
        reasoning = (
            f"Related topic only: Mentions primary actor {matched_actors[0]}, but core action '{profile.main_action}' "
            f"was not observed. Appears to be a different initiative or statement involving the same person."
        )
        return CandidateOutcome.RELATED_TOPIC, sim_score, entity_overlap_score, reasoning

    # 4. DIFFERENT EVENT: Sharing generic location or police verb without primary actor or case concordance
    if len(matched_actors) == 0 and not incident_corroborated:
        loc_str = profile.location or "Delhi"
        reasoning = (
            f"Different event: Distinct incident. Sharing location ('{loc_str}') or generic action is insufficient "
            f"evidence of event identity without principal actor or case corroboration."
        )
        return CandidateOutcome.DIFFERENT_EVENT, sim_score, entity_overlap_score, reasoning

    # 5. Default fallback
    if sim_score > 0.18 and incident_corroborated:
        return (
            CandidateOutcome.POSSIBLE_MATCH,
            sim_score,
            entity_overlap_score,
            f"Possible match: Topical convergence ({sim_score:.2f}) and case corroboration, but primary actor was not explicitly detected."
        )

    return (
        CandidateOutcome.DIFFERENT_EVENT,
        sim_score,
        entity_overlap_score,
        f"Different event: Insufficient entity concordance ({entity_overlap_score:.2f}) and low semantic alignment ({sim_score:.2f})."
    )

def evaluate_and_filter_candidates(
    candidates: List[ArticleCandidate],
    profile: EventProfile
) -> List[ArticleCandidate]:
    """Applies strict multi-signal verification across all discovered article candidates."""
    verified_list = []
    for cand in candidates:
        outcome, sim, ent_score, reason = verify_candidate_same_event(cand, profile)
        cand.outcome = outcome
        cand.similarity_score = sim
        cand.entity_overlap_score = ent_score
        cand.outcome_reasoning = reason
        verified_list.append(cand)
    return verified_list
