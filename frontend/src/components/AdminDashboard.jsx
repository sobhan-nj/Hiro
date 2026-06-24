import React, { useState, useEffect } from 'react'
import { getCandidates, getCandidate, downloadCV } from '../api/client.js'
import DimensionCard from './DimensionCard.jsx'

const TIER_CONFIG = {
  'Needs Work': { color: '#ef4444', bg: '#fef2f2' },
  'Entry': { color: '#f97316', bg: '#fff7ed' },
  'Competitive': { color: '#eab308', bg: '#fefce8' },
  'Strong': { color: '#22c55e', bg: '#f0fdf4' },
  'Top 10%': { color: '#3b82f6', bg: '#eff6ff' },
}

function AdminDashboard({ adminKey, onLogout }) {
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCandidates()
  }, [])

  const loadCandidates = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getCandidates(adminKey)
      setCandidates(data.candidates || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  const viewCandidate = async (id) => {
    setSelected(id)
    setDetailLoading(true)
    setError('')
    try {
      const data = await getCandidate(adminKey, id)
      setDetail(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load candidate')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDownload = async (id, filename) => {
    try {
      const response = await downloadCV(adminKey, id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Download failed')
    }
  }

  const goBack = () => {
    setSelected(null)
    setDetail(null)
  }

  if (selected && detail) {
    const analysis = detail.analysis || {}
    const tierConfig = TIER_CONFIG[analysis.tier] || TIER_CONFIG['Competitive']

    return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <button className="btn-back" onClick={goBack}>&larr; Back to list</button>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>

        <div className="candidate-detail">
          <div className="detail-header">
            <div className="tier-badge" style={{ backgroundColor: tierConfig.bg, color: tierConfig.color, borderColor: tierConfig.color }}>
              {analysis.tier || 'N/A'}
            </div>
            <h2>{detail.name || 'Candidate'}</h2>
            <div className="detail-meta">
              <span>Seniority: {detail.seniority_declared}</span>
              <span>Detected: {detail.seniority_detected || 'N/A'}</span>
              <span>Match: {detail.seniority_match || 'N/A'}</span>
              <span>Date: {detail.created_at ? new Date(detail.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
            <button
              className="btn-download"
              onClick={() => handleDownload(detail.id, detail.original_filename)}
            >
              Download CV
            </button>
          </div>

          {analysis.verdict && (
            <div className="verdict-section">
              <h3>Verdict</h3>
              <p>{analysis.verdict}</p>
            </div>
          )}

          {analysis.priority_fixes && analysis.priority_fixes.length > 0 && (
            <div className="priority-fixes">
              <h3>Priority Fixes</h3>
              <ol>
                {analysis.priority_fixes.map((fix, i) => (
                  <li key={i}>{fix}</li>
                ))}
              </ol>
            </div>
          )}

          {analysis.rewrites && analysis.rewrites.length > 0 && (
            <div className="rewrites-section">
              <h3>Suggested Rewrites</h3>
              {analysis.rewrites.map((rewrite, i) => (
                <div key={i} className="rewrite-card">
                  <div className="rewrite-original">
                    <span className="rewrite-label">Original:</span>
                    <p>{rewrite.original}</p>
                  </div>
                  <div className="rewrite-improved">
                    <span className="rewrite-label">Improved:</span>
                    <p>{rewrite.rewritten}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {analysis.dimensions && (
            <div className="dimensions-section">
              <h3>Dimension Analysis</h3>
              <div className="dimensions-grid">
                {Object.entries(analysis.dimensions).map(([key, dim]) => (
                  <DimensionCard key={key} dimensionKey={key} data={dim} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Talent Pool</h1>
        <div className="admin-header-actions">
          <span className="candidate-count">{candidates.length} candidates</span>
          <button className="btn-refresh" onClick={loadCandidates}>Refresh</button>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading candidates...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="empty-state">
          <p>No candidates in the talent pool yet.</p>
          <p className="empty-hint">Upload resumes on the main page to get started.</p>
        </div>
      ) : (
        <div className="candidates-table-wrapper">
          <table className="candidates-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Seniority</th>
                <th>Tier</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => {
                const tc = TIER_CONFIG[c.tier] || TIER_CONFIG['Competitive']
                return (
                  <tr key={c.id} onClick={() => viewCandidate(c.id)} className="candidate-row">
                    <td className="candidate-name">{c.name}</td>
                    <td>{c.seniority}</td>
                    <td>
                      <span className="tier-badge-sm" style={{ backgroundColor: tc.bg, color: tc.color, borderColor: tc.color }}>
                        {c.tier || 'N/A'}
                      </span>
                    </td>
                    <td>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <button className="btn-view" onClick={(e) => { e.stopPropagation(); viewCandidate(c.id) }}>
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
