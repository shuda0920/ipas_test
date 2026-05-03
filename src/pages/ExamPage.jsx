import { Navigate } from 'react-router-dom'
import { useExam } from '../state/ExamContext.jsx'

export default function ExamPage() {
  const { state, answer, goto, finish } = useExam()

  if (state.status === 'finished') {
    return <Navigate to="/results" replace />
  }

  if (state.status !== 'inProgress' || state.questions.length === 0) {
    return <Navigate to="/" replace />
  }

  const total = state.questions.length
  const idx = state.currentIndex
  const q = state.questions[idx]
  const chosenIndex = state.answersById[q.id]

  const isFirst = idx === 0
  const isLast = idx === total - 1

  function onNext() {
    if (!isLast) goto(idx + 1)
  }

  function onPrev() {
    if (!isFirst) goto(idx - 1)
  }

  function onFinish() {
    finish()
  }

  return (
    <div className="page">
      <h1>考試頁</h1>

      <div className="meta">
        第 {idx + 1} / {total} 題
      </div>

      <div className="card">
        <div className="question">{q.topic}</div>

        <div className="choices">
          {q.choices.map((c, i) => (
            <label key={i} className="choice">
              <input
                type="radio"
                name={q.id}
                checked={chosenIndex === i}
                onChange={() => answer(q.id, i)}
              />
              <span>{c}</span>
            </label>
          ))}
          {q.choices.length === 0 ? (
            <div className="hint">此題沒有選項（請檢查題庫的 choic 欄位）</div>
          ) : null}
        </div>

        <div className="actions">
          <button className="button secondary" type="button" onClick={onPrev} disabled={isFirst}>
            上一題
          </button>

          {!isLast ? (
            <button className="button" type="button" onClick={onNext}>
              下一題
            </button>
          ) : (
            <button className="button" type="button" onClick={onFinish}>
              交卷
            </button>
          )}
        </div>
      </div>

      <div className="hint">可不作答直接切題，未作答會算錯。</div>
    </div>
  )
}
