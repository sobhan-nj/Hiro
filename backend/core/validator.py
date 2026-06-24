from enum import Enum
from typing import Optional
from pydantic import BaseModel, field_validator


class Rating(str, Enum):
    GREAT = "Great"
    GOOD = "Good with slight improvement"
    NEEDS_IMPROVEMENT = "Needs Improvement"
    BAD = "Bad"
    NOT_PRESENT = "Not Present"


class Tier(str, Enum):
    NEEDS_WORK = "Needs Work"
    ENTRY = "Entry"
    COMPETITIVE = "Competitive"
    STRONG = "Strong"
    TOP_10 = "Top 10%"


class Confidence(str, Enum):
    HIGH = "high"
    LOW = "low"


class PriorityTier(str, Enum):
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"


class ExtractionStatus(str, Enum):
    OK = "ok"
    PARTIAL = "partial"
    FAILED = "failed"


class CvLanguage(str, Enum):
    GERMAN = "German"
    ENGLISH = "English"


class SeniorityDeclared(str, Enum):
    JUNIOR = "JUNIOR"
    MID = "MID"
    SENIOR = "SENIOR"
    EXECUTIVE = "EXECUTIVE"


class Header(BaseModel):
    candidate_name: str = ""
    page_count: int = 0
    cv_language: CvLanguage = CvLanguage.ENGLISH
    declared_seniority: SeniorityDeclared = SeniorityDeclared.MID
    detected_specialty: str = ""
    foreign_trained_physician: bool = False


class DimensionResult(BaseModel):
    code: str = ""
    name: str = ""
    priority_tier: PriorityTier = PriorityTier.P2
    rating: Rating = Rating.NOT_PRESENT
    confidence: Confidence = Confidence.HIGH
    summary: str = ""
    issues: list[str] = []
    fixes: list[str] = []

    @field_validator("issues", "fixes", mode="before")
    @classmethod
    def coerce_to_list(cls, v):
        if isinstance(v, str):
            return [v]
        return v


class Rewrite(BaseModel):
    original: str
    rewritten: str


class PriorityFix(BaseModel):
    dimension_code: str = ""
    dimension_name: str = ""
    fix: str = ""


class OverallVerdict(BaseModel):
    tier: Tier = Tier.COMPETITIVE
    summary: str = ""


class Dimensions(BaseModel):
    L1_layout_ats: DimensionResult = DimensionResult(code="L1_layout_ats", name="Layout, Readability & ATS")
    L2_linkedin: DimensionResult = DimensionResult(code="L2_linkedin", name="Professional Network Presence")
    C1_legal_approbation_status: DimensionResult = DimensionResult(code="C1_legal_approbation_status", name="Legal & Approbation Status")
    C2_bullet_quality_ownership: DimensionResult = DimensionResult(code="C2_bullet_quality_ownership", name="Bullet Quality & Ownership")
    C3_grammar_consistency: DimensionResult = DimensionResult(code="C3_grammar_consistency", name="Grammar, Spelling & Consistency")
    C4_section_order: DimensionResult = DimensionResult(code="C4_section_order", name="Section Order")
    C5_professional_summary: DimensionResult = DimensionResult(code="C5_professional_summary", name="Professional Summary")
    C6_gap_risk: DimensionResult = DimensionResult(code="C6_gap_risk", name="Gap & Risk Management")
    C7_impact_so_what: DimensionResult = DimensionResult(code="C7_impact_so_what", name='Impact / "So What?"')
    C8_specialty_fit_rotation_relevance: DimensionResult = DimensionResult(code="C8_specialty_fit_rotation_relevance", name="Specialty Fit & Rotation Relevance")
    C9_keyword_density: DimensionResult = DimensionResult(code="C9_keyword_density", name="Keyword Density")
    C10_relevance_recency: DimensionResult = DimensionResult(code="C10_relevance_recency", name="Relevance & Recency")
    C11_fluff_buzzwords_jargon: DimensionResult = DimensionResult(code="C11_fluff_buzzwords_jargon", name="Fluff, Buzzwords & Jargon")
    C12_soft_skills: DimensionResult = DimensionResult(code="C12_soft_skills", name="Soft Skills Integration")
    C13_additional_context: DimensionResult = DimensionResult(code="C13_additional_context", name="Additional Context")
    C14_signature_formalities: DimensionResult = DimensionResult(code="C14_signature_formalities", name="Signature & Formalities")


class AnalysisReport(BaseModel):
    extraction_status: ExtractionStatus = ExtractionStatus.OK
    extraction_notes: str = ""
    header: Header = Header()
    executive_summary: str = ""
    dimensions: Dimensions = Dimensions()
    rewrites: list[Rewrite] = []
    priority_fixes: list[PriorityFix] = []
    overall_verdict: OverallVerdict = OverallVerdict()
