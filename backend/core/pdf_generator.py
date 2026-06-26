import io
import os
from fpdf import FPDF

FONT_DIR = os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts")
FONT_REGULAR = os.path.join(FONT_DIR, "arial.ttf")
FONT_BOLD = os.path.join(FONT_DIR, "arialbd.ttf")
FONT_ITALIC = os.path.join(FONT_DIR, "ariali.ttf")

RATING_COLORS = {
    'great': (34, 197, 94),
    'good with slight improvement': (234, 179, 8),
    'needs improvement': (249, 115, 22),
    'bad': (239, 68, 68),
    'not present': (107, 114, 128),
}

TIER_COLORS = {
    'Needs Work': (239, 68, 68),
    'Entry': (249, 115, 22),
    'Competitive': (234, 179, 8),
    'Strong': (34, 197, 94),
    'Top 10%': (59, 130, 246),
}


class AnalysisPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)
        self.add_font("Arial", "", FONT_REGULAR)
        self.add_font("Arial", "B", FONT_BOLD)
        self.add_font("Arial", "I", FONT_ITALIC)

    def header(self):
        self.set_font("Arial", "B", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "Resume Analysis Report", align="R", new_x="LMARGIN", new_y="NEXT")
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def safe_text(self, text):
        if not isinstance(text, str):
            text = str(text)
        return text

    def _write(self, w, h, text, **kwargs):
        self.set_x(self.l_margin)
        self.multi_cell(w, h, self.safe_text(text), **kwargs)

    def section_title(self, title):
        self.set_font("Arial", "B", 13)
        self.set_text_color(30, 58, 95)
        self.set_x(self.l_margin)
        self.cell(0, 10, self.safe_text(title), new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body_text(self, text):
        self.set_font("Arial", "", 9)
        self.set_text_color(50, 50, 50)
        self._write(0, 5, text)
        self.ln(1)

    def rating_badge(self, rating):
        r, g, b = RATING_COLORS.get((rating or "").lower(), (107, 114, 128))
        self.set_font("Arial", "B", 8)
        self.set_fill_color(r, g, b)
        self.set_text_color(255, 255, 255)
        safe_r = self.safe_text(rating)
        w = self.get_string_width(safe_r) + 6
        self.set_x(self.l_margin)
        self.cell(w, 6, safe_r, fill=True, new_x="END")
        self.set_text_color(50, 50, 50)
        self.ln(8)



def generate_analysis_pdf(analysis: dict, candidate_name: str = "Candidate") -> bytes:
    pdf = AnalysisPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    tier = analysis.get("tier", "N/A")
    verdict = analysis.get("verdict", "")
    header = analysis.get("header", {})
    executive_summary = analysis.get("executive_summary", "")
    dimensions = analysis.get("dimensions", {})
    priority_fixes = analysis.get("priority_fixes", [])
    rewrites = analysis.get("rewrites", [])

    # Title
    pdf.set_font("Arial", "B", 18)
    pdf.set_text_color(30, 58, 95)
    pdf.set_x(pdf.l_margin)
    pdf.cell(0, 12, pdf.safe_text(candidate_name), new_x="LMARGIN", new_y="NEXT")

    # Tier
    r, g, b = TIER_COLORS.get(tier, (100, 100, 100))
    pdf.set_font("Arial", "B", 14)
    pdf.set_text_color(r, g, b)
    pdf.set_x(pdf.l_margin)
    pdf.cell(0, 10, pdf.safe_text(f"Overall Tier: {tier}"), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    # Header info
    pdf.set_font("Arial", "", 9)
    pdf.set_text_color(80, 80, 80)
    info_parts = []
    if header.get("cv_language"):
        info_parts.append(f"Language: {header['cv_language']}")
    if header.get("page_count"):
        info_parts.append(f"Pages: {header['page_count']}")
    if header.get("declared_seniority"):
        info_parts.append(f"Seniority: {header['declared_seniority']}")
    if header.get("detected_specialty"):
        info_parts.append(f"Specialty: {header['detected_specialty']}")
    if header.get("foreign_trained_physician"):
        info_parts.append("Foreign-trained")
    if info_parts:
        pdf.set_x(pdf.l_margin)
        pdf.cell(0, 6, pdf.safe_text(" | ".join(info_parts)), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)

    # Executive Summary
    if executive_summary:
        pdf.section_title("Executive Summary")
        pdf.body_text(executive_summary)

    # Verdict
    if verdict:
        pdf.section_title("Verdict")
        pdf.body_text(verdict)

    # Priority Fixes
    if priority_fixes:
        pdf.section_title("Priority Fixes")
        for i, fix in enumerate(priority_fixes, 1):
            if isinstance(fix, str):
                fix_text = fix
                prefix = ""
            else:
                dim_name = fix.get("dimension_name", "")
                fix_text = fix.get("fix", "")
                prefix = f"[{dim_name}] " if dim_name else ""
            pdf.set_font("Arial", "", 9)
            pdf.set_text_color(50, 50, 50)
            pdf._write(0, 5, f"{i}. {prefix}{fix_text}")
            pdf.ln(1)

    # Rewrites
    if rewrites:
        pdf.section_title("Suggested Rewrites")
        for rewrite in rewrites:
            if isinstance(rewrite, str):
                orig = rewrite
                improved = ""
            else:
                orig = rewrite.get("original", "")
                improved = rewrite.get("rewritten", "")
            pdf.set_font("Arial", "I", 8)
            pdf.set_text_color(150, 50, 50)
            pdf._write(0, 4, f"Original: {orig}")
            pdf.set_font("Arial", "", 8)
            pdf.set_text_color(50, 120, 50)
            pdf._write(0, 4, f"Improved: {improved}")
            pdf.ln(2)

    # Dimensions
    from backend.core.schema import DIMENSION_GROUPS

    for group_key, group_info in DIMENSION_GROUPS.items():
        group_dims = {}
        for dk in group_info["keys"]:
            if dk in dimensions:
                group_dims[dk] = dimensions[dk]
        if not group_dims:
            continue

        if pdf.get_y() > 240:
            pdf.add_page()

        pdf.section_title(f"{group_info['icon']} {group_info['label']}")

        for key in group_info["keys"]:
            dim = dimensions.get(key)
            if not dim:
                continue

            if pdf.get_y() > 250:
                pdf.add_page()

            name = dim.get("name", key)
            rating = dim.get("rating", "N/A")
            summary = dim.get("summary", "")
            issues = dim.get("issues", [])
            fixes = dim.get("fixes", [])

            pdf.set_font("Arial", "B", 10)
            pdf.set_text_color(30, 58, 95)
            pdf.set_x(pdf.l_margin)
            pdf.cell(0, 7, pdf.safe_text(name), new_x="LMARGIN", new_y="NEXT")

            pdf.rating_badge(rating)

            if summary:
                pdf.set_font("Arial", "", 8)
                pdf.set_text_color(60, 60, 60)
                pdf._write(0, 4, summary)
                pdf.ln(1)

            if issues:
                pdf.set_font("Arial", "B", 8)
                pdf.set_text_color(180, 50, 50)
                pdf.set_x(pdf.l_margin)
                pdf.cell(0, 5, "Issues:", new_x="LMARGIN", new_y="NEXT")
                pdf.set_font("Arial", "", 8)
                pdf.set_text_color(80, 80, 80)
                for issue in issues:
                    pdf._write(0, 4, f"  - {issue}")
                pdf.ln(1)

            if fixes:
                pdf.set_font("Arial", "B", 8)
                pdf.set_text_color(50, 150, 50)
                pdf.set_x(pdf.l_margin)
                pdf.cell(0, 5, "Fixes:", new_x="LMARGIN", new_y="NEXT")
                pdf.set_font("Arial", "", 8)
                pdf.set_text_color(80, 80, 80)
                for fix in fixes:
                    pdf._write(0, 4, f"  - {fix}")
                pdf.ln(1)

            pdf.set_draw_color(220, 220, 220)
            pdf.line(10, pdf.get_y(), 200, pdf.get_y())
            pdf.ln(3)

    # Output
    output = io.BytesIO()
    pdf.output(output)
    return output.getvalue()
