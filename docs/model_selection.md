# Model Selection & NLP Architecture Evaluation

## 1. Design Constraints & Evaluation Criteria

When selecting NLP algorithms and architectures for a 5-language system (English, Hindi, Kannada, Telugu, Tamil), five strict engineering criteria were enforced:

1. **Indic Language Representation**: Accurate coverage across Dravidian (Kannada, Telugu, Tamil) and Indo-Aryan (Hindi) language families.
2. **Character Offset Integrity**: Absolute preservation of original Unicode code points without lossy byte normalization or transliteration-induced offset drift.
3. **Deterministic Execution**: Zero dependence on ungrounded generative hallucinations for critical evidence extraction.
4. **Cold-Start Efficiency**: Fast local execution without gigabyte-sized GPU model downloads during ordinary startup.
5. **Configurable Extensibility**: Pluggable architectures supporting lazy-loaded neural transformer backends (e.g. IndicBERT, MuRIL, LaBSE) or optional API-based LLMs.

---

## 2. Evaluated Candidate Families

| Model / Family | Strengths | Limitations | Operational Role in System |
| :--- | :--- | :--- | :--- |
| **Unicode Block & N-Gram Script Detectors** | 100% deterministic, instant execution, exact script boundaries. | Cannot differentiate identical-script languages (e.g. Hindi vs Marathi) without lexical markers. | **Primary Language Detector** with Devanagari functional word cross-validation. |
| **IndicBERT / MuRIL (Google Research)** | Deep Indic contextual representations across 16+ Indian languages. | 500MB–1.2GB weights, cold-start latency, requires PyTorch/CUDA runtime for production throughput. | **Candidate Neural Upgrade Path** for high-throughput batch environments. |
| **LaBSE / Multilingual E5** | High-quality cross-lingual bitext alignment and semantic vector similarity. | Large footprint (1.8GB+), CPU inference adds 400ms+ per candidate comparison. | **Semantic Embedding Reference**; mirrored by fast character n-gram and entity overlap verification. |
| **Quotation-Aware Lexicon Engines** | Exact offset preservation, explainable valence shifters, zero hallucination. | Dependent on lexicon coverage for low-frequency slang or novel loanwords. | **Primary Grounded Framing & Sentiment Engine** with strict quotation de-nesting. |

---

## 3. Chosen Production Implementation

### 3.1 Language Identification
- Utilizes Unicode code-point distributions across Devanagari (`\u0900-\u097F`), Kannada (`\u0C80-\u0CFF`), Telugu (`\u0C00-\u0C7F`), Tamil (`\u0B80-\u0BFF`), and Latin (`\u0020-\u024F`).
- For Devanagari text, evaluates Hindi functional word frequencies (*है, हैं, में, से, को, का, की, ने, और*) to reliably differentiate Hindi from Marathi.

### 3.2 Emotion and Valence
- Implements valence shifters and negation inverters across all 5 target languages.
- Incorporates regular expression quotation span de-nesting to separate quoted speech from authorial narration.

### 3.3 Event Profile & Matching
- Leverages structured entity extraction and cross-lingual action dictionaries to produce reliable queries and verify candidate relevance across Google News RSS and GDELT.

