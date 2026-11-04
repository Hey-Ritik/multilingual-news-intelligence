import {
  ArticleCandidate,
  ClaimObservation,
  CrossLanguageComparisonResult,
  EmotionResult,
  EventProfile,
  FramingAnalysisResult,
  FullAnalysisReport,
  IngestedArticle,
  LanguageDetectionResult,
  LanguageQuery,
  NamedEntity,
  ProviderStatusReport,
  SentimentResult,
  SummaryResult,
} from '../types';

interface AnalyzeArticleResponse {
  article_id: string;
  language: LanguageDetectionResult;
  sentiment: SentimentResult;
  emotion: EmotionResult;
  entities: NamedEntity[];
  claims: ClaimObservation[];
  framing: FramingAnalysisResult;
  summary: SummaryResult;
  event_profile: EventProfile;
  generated_queries: LanguageQuery[];
}

interface CompareCoverageResponse {
  article_id: string;
  provider_reports: ProviderStatusReport[];
  queries: LanguageQuery[];
  candidates: ArticleCandidate[];
  comparison: CrossLanguageComparisonResult;
}

interface CompareSelectedCoverageResponse {
  article_id: string;
  selected_candidates_count: number;
  candidates: ArticleCandidate[];
  comparison: CrossLanguageComparisonResult;
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, init);
  const data = await response.json();

  if (!response.ok) {
    const detail =
      typeof data === 'object' &&
      data !== null &&
      'detail' in data &&
      typeof data.detail === 'string'
        ? data.detail
        : response.statusText;
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return data as T;
}

function jsonRequest(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export function ingestText(text: string, title?: string): Promise<IngestedArticle> {
  return requestJson('/articles/text', jsonRequest({ text, title }));
}

export function ingestUrl(url: string): Promise<IngestedArticle> {
  return requestJson('/articles/url', jsonRequest({ url }));
}

export function ingestPdf(file: File): Promise<IngestedArticle> {
  const formData = new FormData();
  formData.append('file', file);

  return requestJson('/articles/pdf', {
    method: 'POST',
    body: formData,
  });
}

export function analyzeArticle(article: IngestedArticle): Promise<AnalyzeArticleResponse> {
  return requestJson('/analyze/article', jsonRequest({ article }));
}

export function compareCoverage(
  article: IngestedArticle,
  eventProfile: EventProfile,
  targetLanguages: string[]
): Promise<CompareCoverageResponse> {
  return requestJson(
    '/compare/article',
    jsonRequest({
      article,
      event_profile: eventProfile,
      target_languages: targetLanguages,
    })
  );
}

export function compareSelectedCoverage(
  article: IngestedArticle,
  selectedCandidates: ArticleCandidate[],
  baseLanguage?: string
): Promise<CompareSelectedCoverageResponse> {
  return requestJson(
    '/compare/selected',
    jsonRequest({
      article,
      selected_candidates: selectedCandidates,
      base_language: baseLanguage,
    })
  );
}

export function generateFullReport(
  article: IngestedArticle,
  targetLanguages: string[]
): Promise<FullAnalysisReport> {
  return requestJson('/reports/full', jsonRequest({ article, target_languages: targetLanguages }));
}

export async function downloadPdfReport(report: FullAnalysisReport): Promise<Blob> {
  const response = await fetch('/api/reports/pdf', jsonRequest(report));

  if (!response.ok) {
    const data = await response.json();
    const detail =
      typeof data === 'object' &&
      data !== null &&
      'detail' in data &&
      typeof data.detail === 'string'
        ? data.detail
        : response.statusText;
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return response.blob();
}
