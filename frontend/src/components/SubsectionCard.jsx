import React from 'react'

const RATING_CONFIG = {
  'great': { label: 'Great', class: 'rating-great', color: '#22C55E' },
  'good with slight improvement': { label: 'Good with Slight Improvement', class: 'rating-good', color: '#14B8A6' },
  'needs improvement': { label: 'Needs Improvement', class: 'rating-needs', color: '#F59E0B' },
  'bad': { label: 'Bad', class: 'rating-bad', color: '#EF4444' },
  'not present': { label: 'Not Present', class: 'rating-not', color: '#6B7280' },
}

function SubsectionCard({ dimKey, data, isExpanded, isHighPriority, onToggle }) {
  const { name, rating, summary, issues, fixes } = data
  const ratingLower = (rating || '').toLowerCase()
  const ratingConfig = RATING_CONFIG[ratingLower] || RATING_CONFIG['not present']
  const issueCount = issues?.length || 0
  const isGreat = ratingLower === 'great'

  return (
    <div
      className={`subsection-card ${isExpanded ? 'expanded' : ''} ${isGreat ? 'great-card' : ''}`}
      onClick={isGreat ? undefined : onToggle}
      style={isGreat ? { cursor: 'default' } : {}}
    >
      <div className="card-header">
        <div className="card-title">
          <span className="card-name">{name}</span>
        </div>
        <div className="card-meta">
          <span className={`rating-badge ${ratingConfig.class}`}>{ratingConfig.label}</span>
          <span className="issue-count">
            {isGreat ? 'No issues' : issueCount > 0 ? `${issueCount} issue${issueCount !== 1 ? 's' : ''}` : 'No issues'}
          </span>
          {!isGreat && (
            <span className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>▾</span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="card-body">
          {summary && (
            <div className="detail-section">
              <div className="detail-label">Summary</div>
              <p className="detail-text">{summary}</p>
            </div>
          )}

          {issues && issues.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Issues</div>
              <ul className="detail-list issues-list">
                {issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {fixes && fixes.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Fixes</div>
              <ul className="detail-list fixes-list">
                {fixes.map((fix, i) => (
                  <li key={i}>{fix}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SubsectionCard
