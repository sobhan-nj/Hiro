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
    "L1_layout_ats",
    "L2_linkedin",
    "C1_legal_approbation_status",
    "C2_bullet_quality_ownership",
    "C3_grammar_consistency",
    "C4_section_order",
    "C5_professional_summary",
    "C6_gap_risk",
    "C7_impact_so_what",
    "C8_specialty_fit_rotation_relevance",
    "C9_keyword_density",
    "C10_relevance_recency",
    "C11_fluff_buzzwords_jargon",
    "C12_soft_skills",
    "C13_additional_context",
    "C14_signature_formalities",
]

DIMENSION_LABELS = {
    "C1_legal_approbation_status": "Legal & Approbation Status",
    "L1_layout_ats": "Layout, Readability & ATS",
    "L2_linkedin": "Professional Network Presence",
    "C2_bullet_quality_ownership": "Bullet Quality & Ownership",
    "C3_grammar_consistency": "Grammar, Spelling & Consistency",
    "C4_section_order": "Section Order",
    "C5_professional_summary": "Professional Summary",
    "C6_gap_risk": "Gap & Risk Management",
    "C7_impact_so_what": 'Impact / "So What?"',
    "C8_specialty_fit_rotation_relevance": "Specialty Fit & Rotation Relevance",
    "C9_keyword_density": "Keyword Density",
    "C10_relevance_recency": "Relevance & Recency",
    "C11_fluff_buzzwords_jargon": "Fluff, Buzzwords & Jargon",
    "C12_soft_skills": "Soft Skills Integration",
    "C13_additional_context": "Additional Context",
    "C14_signature_formalities": "Signature & Formalities",
}

DIMENSION_PRIORITY = {
    "C1_legal_approbation_status": "P1",
    "L1_layout_ats": "P1",
    "L2_linkedin": "P2",
    "C2_bullet_quality_ownership": "P1",
    "C3_grammar_consistency": "P1",
    "C4_section_order": "P1",
    "C5_professional_summary": "P2",
    "C6_gap_risk": "P1",
    "C7_impact_so_what": "P1",
    "C8_specialty_fit_rotation_relevance": "P1",
    "C9_keyword_density": "P1",
    "C10_relevance_recency": "P3",
    "C11_fluff_buzzwords_jargon": "P2",
    "C12_soft_skills": "P3",
    "C13_additional_context": "P3",
    "C14_signature_formalities": "P2",
}
