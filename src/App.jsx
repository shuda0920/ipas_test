import './App.css'

import { useEffect } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { loadAllQuestions } from './lib/questionBank.js'
import ExamPage from './pages/ExamPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import SelectCountPage from './pages/SelectCountPage.jsx'
import { useExam } from './state/ExamContext.jsx'

function App() {
  const { setBank, setBankError } = useExam()

  useEffect(() => {
    try {
      const questions = loadAllQuestions()
      setBank(questions)
    } catch (e) {
      setBankError(e instanceof Error ? e.message : String(e))
    }
  }, [setBank, setBankError])

  return (
    <div className="app">
      <header className="header">
        <Link className="brand" to="/">
          考試系統
        </Link>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<SelectCountPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
