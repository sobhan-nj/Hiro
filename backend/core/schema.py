from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SeniorityCheck:
    status: str = "match"
    detected_level: Optional[str] = None
    reason: str = ""


@dataclass
class DimensionResult:
    code: str = ""
    name: str = ""
    priority_tier: str = ""
    rating: str = "not present"
    confidence: str = "high"
    summary: str = ""
    issues: list[str] = field(default_factory=list)
    fixes: list[str] = field(default_factory=list)
    highlight_targets: list[dict] = field(default_factory=list)


@dataclass
class AnalysisReport:
    extraction_status: str = "ok"
    extraction_notes: str = ""
    header: dict = field(default_factory=dict)
    executive_summary: str = ""
    seniority_check: SeniorityCheck = field(default_factory=SeniorityCheck)
    candidate_name: str = ""
    dimensions: dict[str, DimensionResult] = field(default_factory=dict)
    rewrites: list[dict] = field(default_factory=list)
    priority_fixes: list[dict] = field(default_factory=list)
    tier: str = ""
    verdict: str = ""
    raw_llm_response: str = ""
    parse_error: bool = False


DIMENSION_KEYS = [
    "page_structure",
    "visual_design_scannability",
    "ats_compatibility",
    "section_order",
    "formalities",
    "professional_network",
    "professional_summary",
    "bullet_quality_ownership",
    "impact_so_what",
    "specialty_fit_rotation_relevance",
    "keyword_density",
    "relevance_recency",
    "soft_skills_integration",
    "grammar_spelling_consistency",
    "additional_context",
    "legal_eligibility_status",
    "gaps_risk_signals",
    "pii_sensitive_data",
    "white_space",
    "fluff_buzzwords",
    "bullet_length_formatting_consistency",
]

DIMENSION_LABELS = {
    "page_structure": "Page Structure",
    "visual_design_scannability": "Visual Design & Scannability",
    "ats_compatibility": "ATS Compatibility",
    "section_order": "Section Order",
    "formalities": "Formalities",
    "professional_network": "Professional Network",
    "professional_summary": "Professional Summary",
    "bullet_quality_ownership": "Bullet Quality & Ownership",
    "impact_so_what": 'Impact / "So What?"',
    "specialty_fit_rotation_relevance": "Specialty Fit & Rotation Relevance",
    "keyword_density": "Keyword Density",
    "relevance_recency": "Relevance & Recency",
    "soft_skills_integration": "Soft Skills Integration",
    "grammar_spelling_consistency": "Grammar, Spelling & Consistency",
    "additional_context": "Additional Context",
    "legal_eligibility_status": "Legal & Eligibility Status",
    "gaps_risk_signals": "Gaps & Risk Signals",
    "pii_sensitive_data": "PII & Sensitive Data",
    "white_space": "White Space",
    "fluff_buzzwords": "Fluff & Buzzwords",
    "bullet_length_formatting_consistency": "Bullet Length & Formatting Consistency",
}

DIMENSION_PRIORITY = {
    "page_structure": "P1",
    "visual_design_scannability": "P2",
    "ats_compatibility": "P1",
    "section_order": "P1",
    "formalities": "P2",
    "professional_network": "P2",
    "professional_summary": "P2",
    "bullet_quality_ownership": "P1",
    "impact_so_what": "P1",
    "specialty_fit_rotation_relevance": "P1",
    "keyword_density": "P1",
    "relevance_recency": "P3",
    "soft_skills_integration": "P3",
    "grammar_spelling_consistency": "P1",
    "additional_context": "P3",
    "legal_eligibility_status": "P1",
    "gaps_risk_signals": "P1",
    "pii_sensitive_data": "P2",
    "white_space": "P2",
    "fluff_buzzwords": "P2",
    "bullet_length_formatting_consistency": "P2",
}

DIMENSION_GROUPS = {
    "layout": {
        "icon": "📐",
        "label": "Layout",
        "keys": [
            "page_structure",
            "visual_design_scannability",
            "ats_compatibility",
            "section_order",
            "formalities",
            "professional_network",
        ],
    },
    "content": {
        "icon": "📋",
        "label": "Content",
        "keys": [
            "professional_summary",
            "bullet_quality_ownership",
            "impact_so_what",
            "specialty_fit_rotation_relevance",
            "keyword_density",
            "relevance_recency",
            "soft_skills_integration",
            "grammar_spelling_consistency",
            "additional_context",
        ],
    },
    "red_flags": {
        "icon": "🔴",
        "label": "Red Flags",
        "keys": [
            "legal_eligibility_status",
            "gaps_risk_signals",
            "pii_sensitive_data",
        ],
    },
    "readability": {
        "icon": "👁️",
        "label": "Readability",
        "keys": [
            "white_space",
            "fluff_buzzwords",
            "bullet_length_formatting_consistency",
        ],
    },
}
