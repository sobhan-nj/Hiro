import React, { useState } from 'react'
import UploadForm from './components/UploadForm.jsx'
import Questionnaire from './components/Questionnaire.jsx'
import SplitView from './components/SplitView.jsx'
import AdminLogin from './components/AdminLogin.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import { getCandidates, parseResume, analyzeResume } from './api/client.js'

function App() {
  const [screen, setScreen] = useState(
    window.location.pathname === '/admin' ? 'admin-login' : 'upload'
  )
  const [error, setError] = useState(null)
  const [adminKey, setAdminKey] = useState(null)

  const [parsedData, setParsedData] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisDone, setAnalysisDone] = useState(false)
  const [allQuestionsDone, setAllQuestionsDone] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [answers, setAnswers] = useState({ seniority: 'mid', targetCountry: 'germany', referralSource: '' })

  const showResultsIfNeeded = () => {
    if (analysisDone && analysisResult && allQuestionsDone) {
      setAnalysisResult(analysisResult)
      setScreen('results')
      setError(null)
    }
  }

  const handleParseComplete = (data) => {
    setParsedData(data)
    setScreen('questionnaire')
    setError(null)
  }

  const handleParseError = (msg) => {
    setError(msg)
    setScreen('upload')
  }

  const handleQuestionnaireComplete = (finalAnswers) => {
    setAnswers(finalAnswers)
    setAllQuestionsDone(true)
    if (analysisDone && analysisResult) {
      setAnalysisResult(analysisResult)
      setScreen('results')
      setError(null)
    }
  }

  const fireAnalysis = (seniority) => {
    if (!parsedData || analyzing) return
    setAnalyzing(true)
    analyzeResume({
      resume_text: parsedData.resume_text,
      resume_markdown: parsedData.resume_markdown,
      raw_keywords: JSON.stringify(parsedData.raw_keywords),
      seniority,
      target_country: answers.targetCountry,
      referral_source: answers.referralSource,
      resume_filename: parsedData.filename,
    }).then(data => {
      setAnalysisResult(data)
      setAnalysisDone(true)
      setAnalyzing(false)
      if (allQuestionsDone) {
        setScreen('results')
        setError(null)
      }
    }).catch(err => {
      const msg = err.response?.data?.detail || err.message || 'Analysis failed'
      setError(msg)
      setAnalyzing(false)
    })
  }

  const handleReset = () => {
    setScreen('upload')
    setParsedData(null)
    setAnalysisResult(null)
    setAnalysisDone(false)
    setAllQuestionsDone(false)
    setAnalyzing(false)
    setAnswers({ seniority: 'mid', targetCountry: 'germany', referralSource: '' })
    setError(null)
    window.history.pushState({}, '', '/')
  }

  const handleAdminLogin = async (key) => {
    await getCandidates(key)
    setAdminKey(key)
    setScreen('admin-dashboard')
    setError(null)
  }

  const handleAdminLogout = () => {
    setAdminKey(null)
    setScreen('admin-login')
    window.history.pushState({}, '', '/admin')
  }

  const handleStepAnswer = (stepKey, value) => {
    setAnswers(prev => {
      const next = { ...prev, [stepKey]: value }
      if (stepKey === 'seniority') {
        fireAnalysis(value)
      }
      return next
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={handleReset} style={{ cursor: 'pointer' }}>CV Analyzer</h1>
        <p className="subtitle">AI-Powered Resume Analysis for German Healthcare</p>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        {screen === 'upload' && (
          <UploadForm
            onParseComplete={handleParseComplete}
            onError={handleParseError}
          />
        )}

        {screen === 'questionnaire' && (
          <Questionnaire
            onComplete={handleQuestionnaireComplete}
            onStepAnswer={handleStepAnswer}
            analyzing={analyzing}
            answers={answers}
          />
        )}

        {screen === 'results' && analysisResult && (
          <SplitView results={analysisResult} onReset={handleReset} />
        )}

        {screen === 'admin-login' && (
          <AdminLogin onLogin={handleAdminLogin} />
        )}

        {screen === 'admin-dashboard' && adminKey && (
          <AdminDashboard adminKey={adminKey} onLogout={handleAdminLogout} />
        )}
      </main>
    </div>
  )
}

export default App
