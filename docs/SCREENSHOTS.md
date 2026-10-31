# Application Screenshots & Visual Tour

This document catalogues genuine screenshots captured directly from the running **Multilingual News Intelligence** platform using representative news articles across English, Hindi, Kannada, Telugu, and Tamil.

All screenshots are stored in `docs/screenshots/` and referenced in the project README.

---

## Screenshot Inventory

| Filename | Resolution | Application View & Features Demonstrated |
| :--- | :--- | :--- |
| [`01-overview.png`](screenshots/01-overview.png) | 1280 × 950 | **Article Overview**: Displays the ingested article, automatic script identification badge (`en`), metadata metrics (word count, reading time), and faithful extractive summary. |
| [`02-nlp-pipeline.png`](screenshots/02-nlp-pipeline.png) | 1280 × 950 | **NLP Pipeline Analysis**: Displays sentiment valence breakdown, emotion classification with speaker quotation de-nesting, Named Entity Recognition offsets, and claim attribution analysis. |
| [`03-bias-framing.png`](screenshots/03-bias-framing.png) | 1280 × 950 | **Explainable Framing Viewer**: Interactive character-offset highlight viewer showing loaded language, actor portrayals, generalizations, and cognitive hedging with zero-based Unicode spans. |
| [`04-cross-language-discovery.png`](screenshots/04-cross-language-discovery.png) | 1280 × 950 | **Cross-Language Discovery**: Multi-language query generator and search results across Google News RSS and GDELT 2.0 with interactive selection controls and candidate counts. |
| [`05-event-verification.png`](screenshots/05-event-verification.png) | 1280 × 950 | **Event Verification & Guardrails**: Multi-signal verification badges (`VERIFIED SAME EVENT`, `RELATED TOPIC ONLY`, `DIFFERENT EVENT`), entity overlap scores, and evidence-based explanations. |
| [`06-framing-comparison.png`](screenshots/06-framing-comparison.png) | 1280 × 950 | **Side-by-Side Framing Comparison**: Side-by-side linguistic comparison of headline emphasis, lead sentence framing, actor descriptions, and narrative omissions between languages with snippet provenance disclosure. |
| [`07-statistical-report.png`](screenshots/07-statistical-report.png) | 1280 × 950 | **Statistical Report & PDF Export**: Quantitative data visualizations (Recharts), indicator density per 1,000 tokens, category breakdowns, and downloadable A4 ReportLab PDF. |
| [`08-methodology.png`](screenshots/08-methodology.png) | 1280 × 950 | **Analytical Methodology Page**: Dedicated route (`/methodology`) documenting the 6-stage NLP pipeline, attribution de-nesting rules, and cross-script transliteration cross-walks. |
| [`09-limitations.png`](screenshots/09-limitations.png) | 1280 × 950 | **Limitations & Caveats Page**: Dedicated route (`/limitations`) documenting paywall handling, search provider latencies, Indic orthography, and the distinction between linguistic framing and journalistic intent. |

---

## Verifiability & Provenance Note

Every screenshot corresponds to an authentic, unedited render of the local Next.js client interacting with the live FastAPI backend. No static mockups, placeholder graphics, or synthetic visual artifacts are used.

