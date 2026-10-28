# Automated Testing & Verification Report

This document details the automated test suite, verification methodology, and execution instructions for the **Multilingual News Intelligence** platform.

All tests are implemented using standard `pytest` and `pytest-asyncio` fixtures, executing deterministically against synthetic and real-world multilingual test articles without requiring external network connectivity or paid model APIs.

---

## 1. Test Suite Summary

| Category | Test File | Tests | Status | Execution Time |
| :--- | :--- | :--- | :--- | :--- |
| **Cross-Discovery & Event Matching** | `backend/tests/unit/test_cross_discovery_matching.py` | 9 | **PASSED** (100%) | 0.79s |
| **Framing & Offset Grounding** | `backend/tests/unit/test_framing_analysis.py` | 3 | **PASSED** (100%) | 0.35s |
| **Article Ingestion & SSRF Security** | `backend/tests/unit/test_ingestion.py` | 7 | **PASSED** (100%) | 0.52s |
| **Multilingual NLP Pipeline** | `backend/tests/unit/test_nlp_pipeline.py` | 7 | **PASSED** (100%) | 0.65s |
| **ReportLab PDF Generation** | `backend/tests/unit/test_pdf_report.py` | 1 | **PASSED** (100%) | 0.41s |
| **Integration & End-to-End Endpoints** | `backend/tests/integration/test_api_endpoints.py` | 5 | **PASSED** (100%) | 3.54s |
| **Total** | | **32** | **32 PASSED** (100%) | **6.26s** |

---

## 2. Detailed Test Cases

### 2.1 Cross-Language Event Matching & False Positive Rejection (`test_cross_discovery_matching.py`)

* **`test_event_profiler_and_query_generation`**:
  * Verifies extraction of principal actors (*Arvind Kejriwal*), organizations (*Enforcement Directorate*), action verbs (*arrested*), and generates targeted search queries across `en`, `hi`, `kn`, `te`, and `ta`.
* **`test_false_positive_rejection_chole_stabbing`** (Critical Test A):
  * **Input**: An article reporting an auto driver stabbed over extra chole bhature in northwest Delhi with the perpetrator arrested.
  * **Expected Outcome**: `DIFFERENT EVENT`.
  * **Verification**: Verifies that sharing the location *"Delhi"* and generic verb *"arrested"* is strictly insufficient. Conflicting incident guardrail rejects street crime.
* **`test_false_positive_rejection_cyber_fraud`** (Critical Test B):
  * **Input**: Delhi Police arresting 5 individuals for a nationwide cyber-fraud syndicate.
  * **Expected Outcome**: `DIFFERENT EVENT`.
  * **Verification**: Verifies conflicting incident taxonomy correctly flags call centre / cybercrime.
* **`test_false_positive_rejection_heroin_narcotics`** (Critical Test C):
  * **Input**: A university student arrested near North Campus with 500g of commercial-grade heroin.
  * **Expected Outcome**: `DIFFERENT EVENT`.
  * **Verification**: Narcotics keywords immediately flag conflicting incident profile.
* **`test_true_positive_hindi_kejriwal_arrest`** (Critical Test D):
  * **Input**: Legitimate Devanagari Hindi report (*"प्रवर्तन निदेशालय ने दिल्ली आबकारी नीति मामले में मुख्यमंत्री अरविंद केजरीवाल को गिरफ्तार किया"*).
  * **Expected Outcome**: `VERIFIED SAME EVENT`.
  * **Verification**: Verifies cross-script transliteration matches actor, action, and excise policy context.
* **`test_true_positive_vernacular_languages`** (Critical Test E):
  * **Kannada Input**: *"ದೆಹಲಿ ಅಬಕಾರಿ ನೀತಿ ಪ್ರಕರಣದಲ್ಲಿ ಮುಖ್ಯಮಂತ್ರಿ ಅರವಿಂದ ಕೇಜ್ರಿವಾಲ್ ಅವರನ್ನು ಇಡಿ ಬಂಧಿಸಿದೆ"*.
  * **Telugu Input**: *"ఢిల్లీ లిక్కర్ పాలసీ కేసులో సీఎం అరవింద్ కేజ్రీవాల్‌ను అరెస్ట్ చేసిన ఈడీ"*.
  * **Tamil Input**: *"தில்லி மதுபான கொள்கை வழக்கில் முதல்வர் அரவிந்த் கெஜ்ரிவாலை கைது செய்தது அமலாக்கத்துறை"*.
  * **Expected Outcome**: `VERIFIED SAME EVENT` across all three Dravidian languages.
* **`test_same_actor_different_event_is_related_topic`** (Critical Test F):
  * **Input**: Arvind Kejriwal announcing a new rooftop solar energy policy for households in Delhi.
  * **Expected Outcome**: `RELATED TOPIC ONLY`.
  * **Verification**: Same primary actor, but differing action and policy context correctly prevents same-event classification.
* **`test_html_sanitizer_unescapes_entities_and_removes_tags`**:
  * Verifies decoding of `&amp;`, `&#39;`, `&quot;` and stripping of `<b>`, `<a>`, `<font>` tags from upstream RSS snippets.
* **`test_cross_language_framing_comparison`**:
  * Verifies calculation of comparative framing dimensions (headline, lead emphasis, attribution balance) between English base article and Hindi candidate.

### 2.2 Ingestion & Network Security (`test_ingestion.py`)

* **`test_ingest_pasted_text_valid`**: Normalizes text, validates word counts.
* **`test_ingest_pasted_text_empty_raises_error`**: Rejects empty strings and whitespace.
* **`test_ssrf_ip_blocking`**:
  * Blocks loopback addresses: `127.0.0.1`, `::1`.
  * Blocks RFC1918 private subnets: `10.0.0.1`, `172.16.0.1`, `192.168.1.1`.
  * Blocks cloud link-local metadata endpoints: `169.254.169.254`.
* **`test_url_safety_validation`**: Rejects non-HTTP schemes (`ftp://`, `file:///`, `javascript:`).
* **`test_pdf_ingest_valid`**: PyMuPDF selectable text extraction.
* **`test_pdf_ingest_empty_bytes_raises`**: Rejects zero-byte PDF uploads.
* **`test_pdf_ingest_corrupted_bytes_raises`**: Gracefully handles non-PDF corrupted binary buffers.

### 2.3 NLP Pipeline & Attribution De-Nesting (`test_nlp_pipeline.py`)

* **`test_language_detection_all_target_languages`**: Confirms 100% precision on English (`en`), Hindi (`hi`), Kannada (`kn`), Telugu (`te`), and Tamil (`ta`).
* **`test_sentiment_analysis_negative_and_neutral`**: Validates polarity scores across investigative news samples.
* **`test_sentiment_negation_flipping`**: Validates valence inversion upon encountering functional negation markers (*not*, *never*, *nahi*, *illa*, *kaadu*, *illai*).
* **`test_emotion_analysis_quoted_vs_journalist`**: Confirms that speaker quotes (e.g., *"This is a draconian attack"*) are tagged as `SPEAKER_EMOTION` and not attributed to the reporter.
* **`test_named_entity_recognition_and_offsets`**: Checks zero-based Unicode offsets `Text[S:E] == Entity`.
* **`test_claims_and_attribution`**: Verifies extraction of factual statements, allegations, and hedges.
* **`test_extractive_summary`**: Verifies faithful sentence ranking without hallucination.

### 2.4 End-to-End API Integration (`test_api_endpoints.py`)

* **`test_health_check_endpoint`**: `GET /api/health` returns status `ok` and supported languages.
* **`test_ingest_text_endpoint`**: `POST /api/articles/text` returns typed article representation.
* **`test_analyze_article_endpoint`**: `POST /api/articles/analyze` returns full NLP payload.
* **`test_compare_article_endpoint`**: `POST /api/compare/coverage` executes multi-signal candidate verification.
* **`test_pdf_download_from_full_report`**: `POST /api/reports/pdf` compiles binary `%PDF` document.

---

## 3. How to Run the Tests (Windows PowerShell)

Ensure your environment has the dependencies installed:

```powershell
# 1. Set PYTHONPATH to include backend and tests
$env:PYTHONPATH="backend;backend/tests"

# 2. Run the complete automated test suite
python -m pytest backend/tests -v

# 3. Run only the Cross-Discovery Event Matching suite
python -m pytest backend/tests/unit/test_cross_discovery_matching.py -v

# 4. Run only the Ingestion & SSRF security suite
python -m pytest backend/tests/unit/test_ingestion.py -v

# 5. Run only Integration API tests
python -m pytest backend/tests/integration -v
```

---

## 4. Frontend Type & Build Verification

The frontend TypeScript client has been verified with Next.js production compiler:

```powershell
# Navigate to frontend and execute build
npm --prefix frontend run build
```

**Verification Result**:
```text
✓ Compiled successfully
  Linting and checking validity of types ...
  Collecting page data ...
✓ Generating static pages (6/6)
  Finalizing page optimization ...
Route (app)                              Size     First Load JS
┌ ○ /                                    122 kB          210 kB
├ ○ /_not-found                          876 B          88.4 kB
├ ○ /limitations                         179 B          96.4 kB
└ ○ /methodology                         179 B          96.4 kB
+ First Load JS shared by all            87.5 kB
```
* Status: **0 errors, 0 warnings**.

