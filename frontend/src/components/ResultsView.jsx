import React, { useState } from 'react'
import DimensionCard from './DimensionCard.jsx'

const TIER_CLASS = {
  'Needs Work': 'tier-needs-work',
  'Entry': 'tier-entry',
  'Competitive': 'tier-competitive',
  'Strong': 'tier-strong',
  'Top 10%': 'tier-top',
}

const LAYOUT_KEYS = ['L1_layout_ats', 'L2_linkedin']

const DIMENSION_ORDER = [
  'C1_legal_approbation_status',
  'L1_layout_ats',
  'C2_bullet_quality_ownership',
  'C3_grammar_consistency',
  'C4_section_order',
  'C6_gap_risk',
  'C7_impact_so_what',
  'C8_specialty_fit_rotation_relevance',
  'C9_keyword_density',
  'C5_professional_summary',
  'L2_linkedin',
  'C11_fluff_buzzwords_jargon',
  'C14_signature_formalities',
  'C10_relevance_recency',
  'C12_soft_skills',
  'C13_additional_context',
]

function ResultsView({ results, onReset }) {
  const { id, analysis } = results
  const [expandedCard, setExpandedCard] = useState(null)
  const {
    extraction_status,
    extraction_notes,
    header,
    executive_summary,
    seniority_check,
    dimensions,
    rewrites,
    priority_fixes,
    tier,
    verdict,
  } = analysis

  const tierClass = TIER_CLASS[tier] || 'tier-competitive'
  const candidateName = header?.candidate_name || analysis.candidate_name || 'Candidate'

  const sortedDimensions = DIMENSION_ORDER
    .filter(key => dimensions[key])
    .map(key => ({ key, ...dimensions[key] }))

  const layoutDims = sortedDimensions.filter(d => LAYOUT_KEYS.includes(d.key))
  const contentDims = sortedDimensions.filter(d => !LAYOUT_KEYS.includes(d.key))

  const handleDownloadPDF = () => {
    window.open(`/analysis/${id}/pdf`, '_blank')
  }

  return (
    <div className="results-view">
      <div className="results-header">
        <div className="results-header-top">
          <div className={`tier-badge ${tierClass}`}>{tier}</div>
          <button className="download-icon-btn" onClick={handleDownloadPDF} title="Download PDF Report">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>
        <h2>{candidateName}</h2>
        {header && (
          <div className="header-info">
            {header.cv_language && <span className="header-tag">{header.cv_language}</span>}
            {header.page_count > 0 && <span className="header-tag">{header.page_count}p</span>}
            {header.declared_seniority && <span className="header-tag">{header.declared_seniority}</span>}
            {header.detected_specialty && <span className="header-tag">{header.detected_specialty}</span>}
            {header.foreign_trained_physician && <span className="header-tag">Foreign-trained</span>}
          </div>
        )}
        {extraction_status === 'partial' && extraction_notes && (
          <div className="extraction-warning">⚠ {extraction_notes}</div>
        )}
        {executive_summary && <p className="executive-summary">{executive_summary}</p>}
        {verdict && <p className="verdict">{verdict}</p>}
      </div>

      {priority_fixes && priority_fixes.length > 0 && (
        <div className="priority-fixes">
          <h3>Priority Fixes</h3>
          <ol>
            {priority_fixes.map((fix, i) => (
              <li key={i}>
                {fix.dimension_code && <span className="fix-dim">[{fix.dimension_code}]</span>}
                {fix.fix || fix}
              </li>
            ))}
          </ol>
        </div>
      )}

      {rewrites && rewrites.length > 0 && (
        <div className="rewrites-section">
          <h3>Suggested Rewrites</h3>
          {rewrites.map((rewrite, i) => (
            <div key={i} className="rewrite-card">
              <div className="rewrite-original">
                <span className="rewrite-label">Original</span>
                <p>{rewrite.original}</p>
              </div>
              <div className="rewrite-improved">
                <span className="rewrite-label">Improved</span>
                <p>{rewrite.rewritten}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dimensions-section">
        <h3>Layout & Format</h3>
        <div className="flashcards-scroll">
          {layoutDims.map(dim => (
            <DimensionCard
              key={dim.key}
              dimensionKey={dim.key}
              data={dim}
              onClick={() => setExpandedCard(dim)}
            />
          ))}
        </div>
      </div>

      <div className="dimensions-section">
        <h3>Content & Quality</h3>
        <div className="flashcards-scroll">
          {contentDims.map(dim => (
            <DimensionCard
              key={dim.key}
              dimensionKey={dim.key}
              data={dim}
              onClick={() => setExpandedCard(dim)}
            />
          ))}
        </div>
      </div>

      {expandedCard && (
        <div className="flashcard-overlay" onClick={() => setExpandedCard(null)}>
          <div className="flashcard-detail" onClick={e => e.stopPropagation()}>
            <div className="flashcard-detail-header">
              <div>
                <span className="flashcard-code">{expandedCard.code || expandedCard.key?.split('_')[0]}</span>
                <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.05rem' }}>{expandedCard.name}</h3>
              </div>
              <button className="flashcard-detail-close" onClick={() => setExpandedCard(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className={`flashcard-rating rating-${getRatingClass(expandedCard.rating)}`}>
                {expandedCard.rating}
              </span>
              {expandedCard.priority_tier && expandedCard.priority_tier !== 'P2' && (
                <span className={`flashcard-priority priority-${expandedCard.priority_tier?.toLowerCase()}`}>
                  {expandedCard.priority_tier === 'P1' ? 'High Priority' : expandedCard.priority_tier === 'P3' ? 'Low Priority' : ''}
                </span>
              )}
            </div>

            {expandedCard.summary && (
              <div className="detail-section">
                <div className="detail-section-label">Summary</div>
                <p>{expandedCard.summary}</p>
              </div>
            )}

            {expandedCard.issues && expandedCard.issues.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-label">Issues</div>
                <ul className="detail-list detail-issues">
                  {expandedCard.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
              </div>
            )}

            {expandedCard.fixes && expandedCard.fixes.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-label">Fixes</div>
                <ul className="detail-list detail-fixes">
                  {expandedCard.fixes.map((fix, i) => <li key={i}>{fix}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn-reset" onClick={onReset}>
          Analyze Another
        </button>
      </div>
    </div>
  )
}

function getRatingClass(rating) {
  const r = (rating || '').toLowerCase()
  if (r === 'great') return 'great'
  if (r.includes('good')) return 'good'
  if (r.includes('needs')) return 'needs'
  if (r === 'bad') return 'bad'
  return 'not'
}

export default ResultsView
