export type ExtractionStatus = 'FULL' | 'PARTIAL' | 'FAILED';

export interface ArticleMetadata {
  title?: string;
  publisher?: string;
  publish_date?: string;
  url?: string;
  author?: string;
  word_count: number;
  char_count: number;
  sentence_count: number;
}

export interface IngestedArticle {
  article_id: string;
  text: string;
  metadata: ArticleMetadata;
  status: ExtractionStatus;
  extraction_notes: string[];
}

export interface LanguageDetectionResult {
  language_code: string;
  language_name: string;
  confidence: number;
  script: string;
  is_supported: boolean;
  uncertainty_note?: string;
  alternative_candidates: Array<{ code: string; name: string; confidence: number }>;
}

export type SentimentLabel = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED' | 'INCONCLUSIVE';

export interface SentimentResult {
  label: SentimentLabel;
  score: number;
  positive_score: number;
  negative_score: number;
  neutral_score: number;
  method: string;
  limitations: string;
  supporting_clauses: Array<{ passage: string; valence: string; pos_hits: string; neg_hits: string }>;
}

export type EmotionLabel = 'ANGER' | 'FEAR' | 'SADNESS' | 'JOY' | 'DISGUST' | 'SURPRISE' | 'NEUTRAL';

export interface EmotionFinding {
  emotion: EmotionLabel;
  score: number;
  text_passage: string;
  start_offset: number;
  end_offset: number;
  is_speaker_quote: boolean;
  speaker?: string;
}

export interface EmotionResult {
  primary_emotion: EmotionLabel;
  detected_emotions: EmotionFinding[];
  journalist_emotions: EmotionFinding[];
  speaker_emotions: EmotionFinding[];
  method: string;
  limitations: string;
}

export interface NamedEntity {
  text: string;
  label: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'DATE' | 'EVENT';
  start_offset: number;
  end_offset: number;
  native_script: boolean;
  transliteration?: string;
  confidence: number;
  source: string;
}

export interface ClaimObservation {
  claim_type: 'FACTUAL_STATEMENT' | 'ATTRIBUTED_CLAIM' | 'ALLEGATION' | 'DENIAL_DISPUTE' | 'OPINION' | 'HEDGE_UNCERTAINTY';
  text: string;
  start_offset: number;
  end_offset: number;
  speaker_or_source?: string;
  attribution_verb?: string;
  confidence: number;
  notes?: string;
}

export interface SummaryResult {
  summary_text: string;
  method: string;
  key_actors: string[];
  key_actions: string[];
  limitations: string;
}

export type FramingCategory =
  | 'LOADED_LANGUAGE'
  | 'ACTOR_PORTRAYAL'
  | 'ATTRIBUTION_OF_ALLEGATIONS'
  | 'FACT_VS_OPINION'
  | 'GENERALIZATION'
  | 'HEDGING_QUALIFYING'
  | 'EMPHASIS_PROMINENCE'
  | 'VIEWPOINT_REPRESENTATION'
  | 'SELECTIVE_PRESENTATION';

export interface FramingEvidence {
  finding_id: string;
  category: FramingCategory;
  label: string;
  exact_text: string;
  start_offset: number;
  end_offset: number;
  explanation: string;
  potential_effect: string;
  evidence_strength: 'low' | 'medium' | 'high';
  alternative_interpretation?: string;
  method: string;
  actor_or_speaker?: string;
}

export interface FramingAnalysisResult {
  findings: FramingEvidence[];
  category_counts: Record<string, number>;
  density_per_1000_tokens: number;
  article_level_assessment: string;
  unsupported_conclusions_note: string;
  methodology: string;
}

export interface EventProfile {
  headline: string;
  event_description: string;
  principal_actors: string[];
  principal_organizations: string[];
  main_action: string;
  location?: string;
  event_date?: string;
  distinctive_terms: string[];
  context: string;
  original_language: string;
  uncertainty_notes: string[];
}

export interface LanguageQuery {
  language_code: string;
  language_name: string;
  queries: string[];
  rationales: string[];
}

export type CandidateOutcome =
  | 'VERIFIED SAME EVENT'
  | 'POSSIBLE MATCH'
  | 'RELATED TOPIC ONLY'
  | 'DIFFERENT EVENT'
  | 'INSUFFICIENT EVIDENCE'
  | 'VERIFIED_SAME_EVENT'
  | 'POSSIBLE_MATCH'
  | 'RELATED_TOPIC'
  | 'DIFFERENT_EVENT'
  | 'INSUFFICIENT_EVIDENCE'
  | 'LIKELY_SAME_EVENT'
  | 'REJECTED';

export type RetrievalStatus =
  | 'FULL_TEXT_RETRIEVED'
  | 'PARTIAL_TEXT_RETRIEVED'
  | 'SNIPPET_ONLY'
  | 'METADATA_ONLY'
  | 'RETRIEVAL_FAILED';

export interface ArticleCandidate {
  candidate_id: string;
  title: string;
  url: string;
  publisher?: string;
  publish_date?: string;
  language: string;
  snippet?: string;
  discovery_provider: string;
  discovery_query: string;
  outcome: CandidateOutcome;
  outcome_reasoning: string;
  similarity_score: number;
  entity_overlap_score: number;
  retrieval_status: RetrievalStatus;
  retrieved_text?: string;
  retrieval_error?: string;
}

export interface ProviderStatusReport {
  provider_name: string;
  language: string;
  state: 'SUCCESS_WITH_RESULTS' | 'SUCCESS_NO_RESULTS' | 'TIMEOUT' | 'PROVIDER_ERROR' | 'UNSUPPORTED_QUERY';
  result_count: number;
  message?: string;
}

export interface FramingDifference {
  dimension: string;
  article_a_title: string;
  article_a_publisher: string;
  article_a_language: string;
  article_a_passage: string;
  article_a_translation?: string;
  article_b_title: string;
  article_b_publisher: string;
  article_b_language: string;
  article_b_passage: string;
  article_b_translation?: string;
  what_differs: string;
  why_it_matters: string;
  uncertainty_and_alternatives: string;
}

export interface CrossLanguageComparisonResult {
  base_article_id: string;
  compared_candidates_count: number;
  comparisons: FramingDifference[];
  actor_emphasis_comparison: Record<string, Record<string, string>>;
  omission_insights: string[];
  methodology: string;
  limitations_note: string;
}

export interface StatisticalReport {
  word_count: number;
  char_count: number;
  sentence_count: number;
  evidence_density_per_1000_tokens: number;
  sentiment_score: number;
  primary_emotion: string;
  entity_count_by_type: Record<string, number>;
  claim_count_by_type: Record<string, number>;
  framing_indicators_by_category: Record<string, number>;
  discovery_candidates_total: number;
  verified_same_event_count: number;
  likely_same_event_count: number;
  language_breakdown: Record<string, number>;
}

export interface FullAnalysisReport {
  report_id: string;
  generated_at: string;
  article: IngestedArticle;
  language: LanguageDetectionResult;
  summary: SummaryResult;
  sentiment: SentimentResult;
  emotion: EmotionResult;
  entities: NamedEntity[];
  claims: ClaimObservation[];
  framing: FramingAnalysisResult;
  event_profile: EventProfile;
  generated_queries: LanguageQuery[];
  provider_statuses: ProviderStatusReport[];
  candidates: ArticleCandidate[];
  comparison?: CrossLanguageComparisonResult;
  statistics: StatisticalReport;
  methodology_summary: string;
  limitations: string[];
}

