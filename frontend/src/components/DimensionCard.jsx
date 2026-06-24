import React from 'react'

const RATING_CLASS = {
  'great': 'great',
  'good with slight improvement': 'good',
  'needs improvement': 'needs',
  'bad': 'bad',
  'not present': 'not',
}

function DimensionCard({ dimensionKey, data, onClick }) {
  const { code, name, priority_tier, rating, confidence, summary, issues, fixes } = data
  const ratingLower = (rating || '').toLowerCase()
  const ratingClass = RATING_CLASS[ratingLower] || 'not'
  const issueCount = issues?.length || 0
  const fixCount = fixes?.length || 0

  return (
    <div className={`flashcard rating-${ratingClass}-bg`} onClick={onClick}>
      <div className="flashcard-top">
        <span className="flashcard-code">{code || dimensionKey.split('_')[0]}</span>
        {priority_tier && priority_tier !== 'P2' && (
          <span className={`flashcard-priority priority-${priority_tier.toLowerCase()}`}>
            {priority_tier === 'P1' ? 'High Priority' : priority_tier === 'P3' ? 'Low Priority' : ''}
          </span>
        )}
      </div>
      <div className="flashcard-name">{name || dimensionKey}</div>
      <span className={`flashcard-rating rating-${ratingClass}`}>{rating}</span>
      <div className="flashcard-summary">{summary}</div>
      <div className="flashcard-footer">
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {issueCount > 0 && <span className="flashcard-issues">{issueCount} issue{issueCount !== 1 ? 's' : ''}</span>}
          {fixCount > 0 && <span className="flashcard-fixes">{fixCount} fix{fixCount !== 1 ? 'es' : ''}</span>}
        </div>
        <span className="flashcard-expand">Click to expand</span>
      </div>
    </div>
  )
}

export default DimensionCard
