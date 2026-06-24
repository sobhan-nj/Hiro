import React, { useState } from 'react'
import DimensionCard from './DimensionCard.jsx'

function DimensionCategory({ name, icon, dimensions, defaultOpen = false }) {
  const [expanded, setExpanded] = useState(defaultOpen)

  return (
    <div className={`dimension-category ${expanded ? 'expanded' : ''}`}>
      <div className="category-header" onClick={() => setExpanded(!expanded)}>
        <div className="category-title">
          <span className="category-icon">{icon}</span>
          <span className="category-name">{name}</span>
          <span className="category-count">{Object.keys(dimensions).length} dimensions</span>
        </div>
        <span className="expand-icon">{expanded ? '−' : '+'}</span>
      </div>

      {expanded && (
        <div className="category-body">
          {Object.entries(dimensions).map(([key, dim]) => (
            <DimensionCard key={key} dimensionKey={key} data={dim} />
          ))}
        </div>
      )}
    </div>
  )
}

export default DimensionCategory
