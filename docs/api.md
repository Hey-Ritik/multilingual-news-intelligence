# Multilingual News Intelligence — REST API Reference

The backend provides a typed REST API documented via OpenAPI at `/docs` (Swagger UI) and `/redoc` (ReDoc).

Base URL: `http://localhost:8000`

---

## 1. System Health

### `GET /api/health`
Returns system status, active providers, and configured languages.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "app_name": "Multilingual News Intelligence",
  "supported_languages": ["en", "hi", "kn", "te", "ta"],
  "providers_enabled": {
    "google_news_rss": true,
    "gdelt": true
  }
}
```

---

## 2. Ingestion Endpoints

### `POST /api/articles/text`
Ingests raw article text with Unicode code-point preservation.

**Request Body:**
```json
{
  "text": "The Supreme Court delivered a landmark ruling in New Delhi today...",
  "title": "Supreme Court Verdict"
}
```

**Response (200 OK):**
```json
{
  "article_id": "art_a1b2c3d4e5f6",
  "text": "The Supreme Court delivered a landmark ruling...",
  "metadata": {
    "title": "Supreme Court Verdict",
    "publisher": "Direct Input",
    "publish_date": null,
    "url": null,
    "author": null,
    "word_count": 8,
    "char_count": 55,
    "sentence_count": 1
  },
  "status": "FULL",
  "extraction_notes": ["Direct user text paste accepted."]
}
```

### `POST /api/articles/url`
Safely retrieves and parses a remote article with SSRF protection (private IP blocking, redirect bounds).

**Request Body:**
```json
{
  "url": "https://www.thehindu.com/news/national/article.ece"
}
```

### `POST /api/articles/pdf`
Extracts selectable text from an uploaded PDF file using PyMuPDF (`fitz`).

**Request (multipart/form-data):**
- `file`: PDF document binary.

---

## 3. Analysis & Verification Endpoints

### `POST /api/analyze/article`
Executes the multilingual NLP pipeline:
- Language identification (script detection & lexical validation)
- Sentiment analysis (positive, negative, neutral, mixed, with negation flipping)
- Emotion classification (authorial narration vs quoted source emotions)
- Named entity recognition (Person, Org, Location, Date with native script)
- Claim & attribution analysis (factual statements, attributed claims, allegations, denials)
- Explainable bias & framing analysis (Unicode character offsets)
- Extractive summary
- Structured event profile and multilingual search queries

**Request Body:**
```json
{
  "article": { ... },
  "language_override": "en"
}
```

### `POST /api/compare/article`
Orchestrates cross-language discovery via Google News RSS & GDELT, runs multi-signal same-event verification, retrieves content for promising matches, and compares framing side-by-side.

**Request Body:**
```json
{
  "article": { ... },
  "event_profile": { ... },
  "target_languages": ["en", "hi", "kn", "te", "ta"],
  "max_results_per_lang": 6
}
```

---

## 4. Reporting Endpoints

### `POST /api/reports/full`
Synthesizes the complete analysis, candidate verification outcomes, and comparative metrics into an academic report.

### `POST /api/reports/pdf`
Streams an A4 research PDF report generated via ReportLab with paginated headers, evidence tables, and native font support for Indic scripts.

**Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename=framing_report_art_xxx.pdf`

