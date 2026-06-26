import React from 'react'
import SubsectionCard from './SubsectionCard.jsx'

const DIMENSION_ORDER = {
  layout: ['page_structure', 'visual_design_scannability', 'ats_compatibility', 'section_order', 'formalities', 'professional_network'],
  content: ['professional_summary', 'bullet_quality_ownership', 'impact_so_what', 'specialty_fit_rotation_relevance', 'keyword_density', 'relevance_recency', 'soft_skills_integration', 'grammar_spelling_consistency', 'additional_context'],
  red_flags: ['legal_eligibility_status', 'gaps_risk_signals', 'pii_sensitive_data'],
  readability: ['white_space', 'fluff_buzzwords', 'bullet_length_formatting_consistency'],
}

const HIGH_PRIORITY = new Set([
  'legal_eligibility_status',
  'gaps_risk_signals',
  'professional_summary',
  'bullet_quality_ownership',
  'impact_so_what',
  'specialty_fit_rotation_relevance',
  'keyword_density',
  'grammar_spelling_consistency',
])

function AnalysisPanel({ group, groupKey, expandedSub, onToggle }) {
  if (!group?.dimensions) return null

  const orderedKeys = DIMENSION_ORDER[groupKey] || Object.keys(group.dimensions)

  return (
    <div className="analysis-list">
      {orderedKeys.map(dimKey => {
        const dim = group.dimensions[dimKey]
        if (!dim) return null

        const isExpanded = expandedSub?.dimKey === dimKey
        const isHighPriority = HIGH_PRIORITY.has(dimKey)

        return (
          <SubsectionCard
            key={dimKey}
            dimKey={dimKey}
            data={dim}
            isExpanded={isExpanded}
            isHighPriority={isHighPriority}
            onToggle={() => onToggle(groupKey, dimKey)}
          />
        )
      })}
    </div>
  )
}

export default AnalysisPanel
