"""Build the portfolio's text-based resume from data/resume.json.

Run with Python 3 and ReportLab installed. This is an editorial tool, not a
deployment build step. No accounts, secrets or network access are required.
"""

from html import escape
import hashlib
import json
from pathlib import Path
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "uploads" / "resume.pdf"
DATA = json.loads((ROOT / "data" / "resume.json").read_text(encoding="utf-8"))
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")
pdfmetrics.registerFont(TTFont("Resume", str(FONT_DIR / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("ResumeBold", str(FONT_DIR / "DejaVuSans-Bold.ttf")))
pdfmetrics.registerFontFamily("Resume", normal="Resume", bold="ResumeBold")

INK = colors.HexColor("#272925")
SOFT = colors.HexColor("#62695C")
SAGE = colors.HexColor("#4B6235")
LINE = colors.HexColor("#DCE2D5")

styles = {
    "name": ParagraphStyle("Name", fontName="ResumeBold", fontSize=23, leading=28, textColor=INK, spaceAfter=5),
    "headline": ParagraphStyle("Headline", fontName="ResumeBold", fontSize=10.5, leading=15, textColor=SAGE, spaceAfter=8),
    "contact": ParagraphStyle("Contact", fontName="Resume", fontSize=9, leading=13.5, textColor=SOFT, spaceAfter=3),
    "section": ParagraphStyle("Section", fontName="ResumeBold", fontSize=9.3, leading=13, textColor=SAGE, spaceBefore=14, spaceAfter=7, keepWithNext=True),
    "body": ParagraphStyle("Body", fontName="Resume", fontSize=10, leading=14.2, textColor=INK, spaceAfter=4, alignment=TA_LEFT),
    "job": ParagraphStyle("Job", fontName="ResumeBold", fontSize=10.3, leading=14.5, textColor=INK, spaceBefore=8, spaceAfter=2, keepWithNext=True),
    "meta": ParagraphStyle("Meta", fontName="Resume", fontSize=8.8, leading=12.5, textColor=SOFT, spaceAfter=6, keepWithNext=True),
    "bullet": ParagraphStyle("Bullet", fontName="Resume", fontSize=9.7, leading=13.7, textColor=INK, leftIndent=10, firstLineIndent=0, bulletIndent=0, bulletFontName="Resume", bulletFontSize=9, spaceAfter=4),
    "continuation": ParagraphStyle("Continuation", fontName="ResumeBold", fontSize=15, leading=20, textColor=INK, spaceAfter=4),
    "small": ParagraphStyle("Small", fontName="Resume", fontSize=9.3, leading=13.3, textColor=INK, spaceAfter=4),
}


def p(text, style="body"):
    return Paragraph(text, styles[style])


def link(url, label):
    return f'<link href="{escape(url, quote=True)}" color="#4B6235">{escape(label)}</link>'


def section(title):
    return p(escape(title.upper()), "section")


def job(item):
    title = p(f'{escape(item["company"])} | {escape(item["role"])}', "job")
    meta = p(f'{escape(item["dates"])}<br/>{escape(item["scope"])}', "meta")
    bullets = [Paragraph(escape(text), styles["bullet"], bulletText="-") for text in item["bullets"]]
    # Keep each role intact, including the title, dates and its first bullet.
    return KeepTogether([title, meta, *bullets, Spacer(1, 3)])


def footer(canvas, doc):
    canvas.saveState()
    width, _ = A4
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(42, 35, width - 42, 35)
    canvas.setFont("Resume", 7.5)
    canvas.setFillColor(SOFT)
    canvas.drawString(42, 23, f'{DATA["name"]} | Updated {DATA["updated"]}')
    canvas.drawRightString(width - 42, 23, f'{doc.page} / 2')
    canvas.restoreState()


story = [
    p(escape(DATA["name"].upper()), "name"),
    p(escape(DATA["headline"]), "headline"),
    p(f'{escape(DATA["location"])} | {link("mailto:" + DATA["email"], DATA["email"])}', "contact"),
    p(f'{link(DATA["linkedin"], "linkedin.com/in/anandarajnadar")} | {link(DATA["portfolio"], "portfolio2-0-eight-bice.vercel.app")}', "contact"),
    Spacer(1, 8),
    HRFlowable(width="100%", thickness=1.5, color=SAGE, spaceAfter=0),
    section("Professional profile"),
    p(escape(DATA["summary"])),
    section("Core capabilities"),
    p(escape(DATA["capabilities"]), "small"),
    section("Professional experience"),
]
story.extend(job(item) for item in DATA["current_experience"])
story.extend([
    PageBreak(),
    p(escape(DATA["name"].upper()), "continuation"),
    p("Earlier experience and qualifications", "contact"),
    HRFlowable(width="100%", thickness=0.7, color=LINE, spaceBefore=5, spaceAfter=5),
])
story.extend(job(item) for item in DATA["earlier_experience"])
story.append(section("Education"))
for item in DATA["education"]:
    story.append(p(f'<b>{escape(item["qualification"])}</b><br/>{escape(item["institution"])} | {escape(item["dates"])}', "small"))
story.extend([
    section("Tools and sales methods"),
    p(f'<b>Tools:</b> {escape(DATA["tools"])}<br/><b>Methods:</b> {escape(DATA["methods"])}', "small"),
    section("Selected work"),
    p(escape(DATA["selected_work"]), "small"),
    section("Languages"),
    p(escape(DATA["languages"]), "small"),
])

if __name__ == "__main__":
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(OUTPUT), pagesize=A4, rightMargin=42, leftMargin=42,
        topMargin=35, bottomMargin=47,
        title="Ananda Raj Nadar - Senior Account Manager Resume",
        author=DATA["name"], subject="Sales and account management experience - November 2026",
        pageCompression=1,
    )
    document.build(story, onFirstPage=footer, onLaterPages=footer)
    version = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()[:12]
    for page in (ROOT / "index.html", ROOT / "experience" / "index.html"):
        html = page.read_text(encoding="utf-8")
        html = re.sub(
            r'href="(/?uploads/resume\.pdf)(?:\?v=[a-f0-9]+)?" download(?:="[^"]*")?',
            lambda match: f'href="{match[1]}?v={version}" download="Ananda_Raj_Nadar_Resume.pdf"',
            html,
        )
        page.write_text(html, encoding="utf-8")
    print(OUTPUT)
