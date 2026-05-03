import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MAX_QUESTIONS_PER_EXAM, clampQuestionCount } from '../lib/examEngine.js'
import { useExam } from '../state/ExamContext.jsx'

export default function SelectCountPage() {
  const navigate = useNavigate()
  const { state, start, reset } = useExam()
  const available = state.bank.length

  const [countInput, setCountInput] = useState('10')

  const maxAllowed = useMemo(() => {
    if (available <= 0) return MAX_QUESTIONS_PER_EXAM
    return Math.min(MAX_QUESTIONS_PER_EXAM, available)
  }, [available])

  const canStart = available > 0 && !state.bankError

  function onStart() {
    reset()
    const count = clampQuestionCount(countInput, available)
    start(count)
    navigate('/exam')
  }

  return (
    <div className="page">
      <h1>題數選擇</h1>

      {state.bankError ? (
        <div className="alert error">{state.bankError}</div>
      ) : null}

      <div className="card">
        <div className="row">
          <label className="label" htmlFor="count">
            這次要考幾題？（最多 {MAX_QUESTIONS_PER_EXAM} 題）
          </label>
          <input
            id="count"
            className="input"
            inputMode="numeric"
            value={countInput}
            onChange={(e) => setCountInput(e.target.value)}
            placeholder={`1 ~ ${maxAllowed}`}
          />
        </div>

        <div className="meta">
          目前題庫：{available} 題
          {available > 0 ? `（本次最多可出 ${maxAllowed} 題）` : ''}
        </div>

        <button className="button" type="button" onClick={onStart} disabled={!canStart}>
          開始考試
        </button>

        {!canStart ? (
          <div className="hint">
            {available <= 0
              ? '找不到題庫。請在 src/topic/**/topic.json 放入題目。'
              : '題庫載入異常。'}
          </div>
        ) : null}
      </div>
    </div>
  )
}
