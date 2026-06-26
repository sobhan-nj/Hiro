import React, { useState } from 'react'

function CVPreviewPanel({ candidateId, resumeFilename }) {
  const [showCV, setShowCV] = useState(true)

  if (!candidateId) {
    return (
      <div className="cv-preview-empty">
        <p>No CV data available</p>
      </div>
    )
  }

  const cvUrl = `/analysis/${candidateId}/pdf`

  return (
    <div className="cv-preview-container">
      <div className="cv-preview-header">
        <span className="cv-filename">{resumeFilename || 'Resume'}</span>
        <button
          className="cv-toggle"
          onClick={() => setShowCV(!showCV)}
        >
          {showCV ? 'Hide CV' : 'Show CV'}
        </button>
      </div>

      {showCV && (
        <div className="cv-document-wrapper">
          <iframe
            src={cvUrl}
            className="cv-iframe"
            title="CV Preview"
          />
        </div>
      )}
    </div>
  )
}

export default CVPreviewPanel
