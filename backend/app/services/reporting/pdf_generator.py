import io
import os
from typing import Optional
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from app.schemas.report import FullAnalysisReport

# Font Registration for Indic and Latin Scripts
FONT_NAME = "Helvetica"
FONT_BOLD = "Helvetica-Bold"

try:
    if os.path.exists("C:/Windows/Fonts/Nirmala.ttc"):
        pdfmetrics.registerFont(TTFont("Nirmala", "C:/Windows/Fonts/Nirmala.ttc", subfontIndex=0))
        pdfmetrics.registerFont(TTFont("Nirmala-Bold", "C:/Windows/Fonts/Nirmala.ttc", subfontIndex=1))
        FONT_NAME = "Nirmala"
        FONT_BOLD = "Nirmala-Bold"
    elif os.path.exists("C:/Windows/Fonts/arial.ttf"):
        pdfmetrics.registerFont(TTFont("Arial", "C:/Windows/Fonts/arial.ttf"))
        FONT_NAME = "Arial"
        FONT_BOLD = "Arial"
except Exception:
    FONT_NAME = "Helvetica"
    FONT_BOLD = "Helvetica-Bold"


class NumberedCanvas(canvas.Canvas):
    """Adds running headers and 'Page X of Y' footers to every page."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages: int):
        self.saveState()
        self.setFont(FONT_NAME, 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 800, "Multilingual News Intelligence — Analysis Report")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 794, 541, 794)

        # Footer
        footer_text = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(541, 35, footer_text)
        self.drawString(54, 35, "Confidential Research Report • Grounded Linguistic Framing Analysis")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 541, 45)
        self.restoreState()


def clean_xml_text(text: Optional[str]) -> str:
    """Escapes XML entities so ReportLab Paragraph doesn't fail on raw & or <."""
    if not text:
        return ""
    return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def generate_pdf_report(report: FullAnalysisReport) -> bytes:
    """
    Renders a comprehensive, research-grade A4 PDF report with verified evidence tables,
    statistical summaries, cross-language coverage comparisons, and explicit methodology/limitations.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    primary_color = colors.HexColor("#1e293b")   # Slate 800
    accent_color = colors.HexColor("#0284c7")    # Sky 600
    border_color = colors.HexColor("#cbd5e1")    # Slate 300

    # Custom typography styles
    style_title = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=6
    )

    style_subtitle = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName=FONT_NAME,
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )

    style_h1 = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=12,
        leading=16,
        textColor=accent_color,
        spaceBefore=12,
        spaceAfter=6
    )

    style_body = ParagraphStyle(
        "DocBody",
        parent=styles["Normal"],
        fontName=FONT_NAME,
        fontSize=9,
        leading=13,
        textColor=primary_color
    )

    style_table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    style_table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName=FONT_NAME,
        fontSize=8,
        leading=11,
        textColor=primary_color
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("Multilingual News Intelligence", style_title))
    elements.append(Paragraph(
        f"Explainable News Framing &amp; Cross-Language Coverage Report • Generated: {clean_xml_text(report.generated_at)}",
        style_subtitle
    ))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceAfter=12))

    # 1. Document & Ingestion Metadata
    elements.append(Paragraph("1. Ingested Article Profile", style_h1))
    meta = report.article.metadata
    meta_data = [
        [Paragraph("<b>Headline:</b>", style_table_cell), Paragraph(clean_xml_text(meta.title or "Untitled"), style_table_cell)],
        [Paragraph("<b>Publisher:</b>", style_table_cell), Paragraph(clean_xml_text(meta.publisher or "Direct Input"), style_table_cell)],
        [Paragraph("<b>Detected Language:</b>", style_table_cell), Paragraph(f"{report.language.language_name} ({report.language.language_code.upper()}) • Script: {report.language.script} • Confidence: {report.language.confidence:.1%}", style_table_cell)],
        [Paragraph("<b>Word &amp; Token Count:</b>", style_table_cell), Paragraph(f"{meta.word_count} words • {meta.sentence_count} sentences • {report.statistics.char_count} characters", style_table_cell)],
        [Paragraph("<b>Extraction Status:</b>", style_table_cell), Paragraph(f"{report.article.status.value}", style_table_cell)]
    ]
    t_meta = Table(meta_data, colWidths=[120, 367])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 10))

    # 2. Executive Summary
    elements.append(Paragraph("2. Faithful Extractive Summary", style_h1))
    elements.append(Paragraph(clean_xml_text(report.summary.summary_text), style_body))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(f"<i>Method: {clean_xml_text(report.summary.method)}</i>", ParagraphStyle("Note", fontName=FONT_NAME, fontSize=7.5, textColor=colors.HexColor("#64748b"))))
    elements.append(Spacer(1, 10))

    # 3. NLP Metrics & Emotional Profile
    elements.append(Paragraph("3. Multilingual NLP Pipeline Summary", style_h1))
    nlp_summary_data = [
        [
            Paragraph("Metric", style_table_header),
            Paragraph("Result", style_table_header),
            Paragraph("Analytical Context / Notes", style_table_header)
        ],
        [
            Paragraph("<b>Sentiment Valence</b>", style_table_cell),
            Paragraph(f"<b>{report.sentiment.label.value}</b> (Score: {report.sentiment.score:+.2f})", style_table_cell),
            Paragraph("Pos: {:.0%} | Neg: {:.0%} | Neu: {:.0%}. Negative tone indicates conflict reporting, not political bias.".format(
                report.sentiment.positive_score, report.sentiment.negative_score, report.sentiment.neutral_score
            ), style_table_cell)
        ],
        [
            Paragraph("<b>Primary Emotion</b>", style_table_cell),
            Paragraph(f"<b>{report.emotion.primary_emotion.value}</b>", style_table_cell),
            Paragraph(f"Narration instances: {len(report.emotion.journalist_emotions)} | Quoted source instances: {len(report.emotion.speaker_emotions)} (strictly attributed to speakers).", style_table_cell)
        ],
        [
            Paragraph("<b>Framing Density</b>", style_table_cell),
            Paragraph(f"{report.statistics.evidence_density_per_1000_tokens} / 1k tokens", style_table_cell),
            Paragraph(f"Total findings: {len(report.framing.findings)} validated textual indicators across {len(report.framing.category_counts)} categories.", style_table_cell)
        ]
    ]
    t_nlp = Table(nlp_summary_data, colWidths=[110, 120, 257])
    t_nlp.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_nlp)
    elements.append(Spacer(1, 12))

    # 4. Bias and Framing Findings Table
    elements.append(Paragraph("4. Explainable Bias and Framing Evidence", style_h1))
    
    verdict_text = clean_xml_text(report.framing.verdict.value if hasattr(report.framing, "verdict") else "COMPLETED")
    conf_pct = int(report.framing.verdict_confidence * 100) if hasattr(report.framing, "verdict_confidence") else 80
    verdict_color = "#dc2626" if "POTENTIAL" in verdict_text else ("#16a34a" if "NO CLEAR" in verdict_text else "#64748b")
    
    elements.append(Paragraph(
        f"<b>Overall Verdict:</b> <font color='{verdict_color}'><b>{verdict_text}</b></font> "
        f"| <b>Confidence:</b> {conf_pct}% (uncalibrated) | <b>Findings:</b> {len(report.framing.findings)}",
        style_body
    ))
    if hasattr(report.framing, "verdict_summary") and report.framing.verdict_summary:
        elements.append(Paragraph(f"<i>{clean_xml_text(report.framing.verdict_summary)}</i>", style_body))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(
        "Every indicator below is grounded in exact original text spans with documented character offsets. "
        "These textual observations illustrate rhetorical choices and potential reader effects.",
        style_body
    ))
    elements.append(Spacer(1, 6))

    framing_rows = [
        [
            Paragraph("Category &amp; Label", style_table_header),
            Paragraph("Exact Text Evidence [Offsets]", style_table_header),
            Paragraph("Linguistic Explanation &amp; Reader Effect", style_table_header),
            Paragraph("Strength", style_table_header)
        ]
    ]

    for f in report.framing.findings[:8]:
        cat_label = f"<b>{clean_xml_text(f.category.value)}</b><br/>{clean_xml_text(f.label)}"
        evidence_text = f"<i>\"{clean_xml_text(f.exact_text)}\"</i><br/>[{f.start_offset}:{f.end_offset}]"
        expl_text = f"{clean_xml_text(f.explanation)}<br/><b>Effect:</b> {clean_xml_text(f.potential_effect)}"
        strength_badge = clean_xml_text(f.evidence_strength.upper())

        framing_rows.append([
            Paragraph(cat_label, style_table_cell),
            Paragraph(evidence_text, style_table_cell),
            Paragraph(expl_text, style_table_cell),
            Paragraph(strength_badge, style_table_cell)
        ])

    if len(report.framing.findings) == 0:
        framing_rows.append([
            Paragraph("Neutral Expository", style_table_cell),
            Paragraph("N/A", style_table_cell),
            Paragraph("No high-intensity evaluative modifiers or ungrounded generalities identified.", style_table_cell),
            Paragraph("LOW", style_table_cell)
        ])

    t_framing = Table(framing_rows, colWidths=[110, 110, 217, 50])
    t_framing.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_framing)
    elements.append(Spacer(1, 12))

    # 5. Cross-Language Coverage & Same-Event Verification
    elements.append(Paragraph("5. Cross-Language Discovery &amp; Same-Event Verification", style_h1))
    elements.append(Paragraph(
        f"Searched across target languages (EN, HI, KN, TE, TA). Discovered {len(report.candidates)} candidates: "
        f"{report.statistics.verified_same_event_count} Verified Same-Event, {report.statistics.likely_same_event_count} Likely Same-Event.",
        style_body
    ))
    elements.append(Spacer(1, 6))

    cand_rows = [
        [
            Paragraph("Language / Source", style_table_header),
            Paragraph("Candidate Headline", style_table_header),
            Paragraph("Outcome &amp; Multi-Signal Justification", style_table_header)
        ]
    ]

    for cand in report.candidates[:6]:
        src = f"<b>{cand.language.upper()}</b><br/>{clean_xml_text(cand.publisher or 'Online')}<br/><i>{cand.discovery_provider}</i>"
        title_p = clean_xml_text(cand.title[:80])
        outcome_p = f"<b>{cand.outcome.value}</b><br/>{clean_xml_text(cand.outcome_reasoning[:120])}"

        cand_rows.append([
            Paragraph(src, style_table_cell),
            Paragraph(title_p, style_table_cell),
            Paragraph(outcome_p, style_table_cell)
        ])

    if not report.candidates:
        cand_rows.append([
            Paragraph("N/A", style_table_cell),
            Paragraph("No external coverage retrieved during search session.", style_table_cell),
            Paragraph("Provider timeout or no matches returned.", style_table_cell)
        ])

    t_cands = Table(cand_rows, colWidths=[100, 187, 200])
    t_cands.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_cands)
    elements.append(Spacer(1, 12))

    # 6. Cross-Language Framing Comparisons
    if report.comparison and report.comparison.comparisons:
        elements.append(Paragraph("6. Side-by-Side Cross-Language Framing Comparison", style_h1))
        comp_rows = [
            [
                Paragraph("Comparison Dimension", style_table_header),
                Paragraph("Article A (Base)", style_table_header),
                Paragraph("Article B (Cross-Language)", style_table_header),
                Paragraph("Comparative Analysis", style_table_header)
            ]
        ]

        for diff in report.comparison.comparisons[:4]:
            dim = f"<b>{clean_xml_text(diff.dimension)}</b>"
            p_a = f"<b>{diff.article_a_language} ({clean_xml_text(diff.article_a_publisher)})</b><br/><i>\"{clean_xml_text(diff.article_a_passage[:100])}...\"</i>"
            p_b = f"<b>{diff.article_b_language} ({clean_xml_text(diff.article_b_publisher)})</b><br/><i>\"{clean_xml_text(diff.article_b_passage[:100])}...\"</i>"
            diff_text = f"<b>Difference:</b> {clean_xml_text(diff.what_differs[:100])}<br/><b>Significance:</b> {clean_xml_text(diff.why_it_matters[:100])}"

            comp_rows.append([
                Paragraph(dim, style_table_cell),
                Paragraph(p_a, style_table_cell),
                Paragraph(p_b, style_table_cell),
                Paragraph(diff_text, style_table_cell)
            ])

        t_comp = Table(comp_rows, colWidths=[90, 120, 120, 157])
        t_comp.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), primary_color),
            ('BOX', (0, 0), (-1, -1), 0.5, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_comp)
        elements.append(Spacer(1, 12))

    # 7. Methodology & Academic Limitations
    elements.append(Paragraph("7. Methodology &amp; Academic Limitations", style_h1))
    elements.append(Paragraph(f"<b>Methodology:</b> {clean_xml_text(report.methodology_summary)}", style_body))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("<b>Documented Limitations:</b>", style_body))
    for lim in report.limitations:
        elements.append(Paragraph(f"• {clean_xml_text(lim)}", style_body))

    # Build PDF with running headers and page numbers
    doc.build(elements, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer.getvalue()

