import { Navigate } from 'react-router-dom'
import { useExam } from '../state/ExamContext.jsx'

export default function ExamPage() {
  const { state, answer, goto, finish, toggleFlag } = useExam()

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
  const hasChosen = chosenIndex != null
  const isFlagged = !!state.flaggedById?.[q.id]

  const isFirst = idx === 0
  const isLast = idx === total - 1

  function onNext() {
    if (!hasChosen) return
    if (!isLast) goto(idx + 1)
  }

  function onPrev() {
    if (!isFirst) goto(idx - 1)
  }

  function onFinish() {
    if (!hasChosen) return
    finish()
  }

  function onToggleFlag() {
    toggleFlag(q.id)
  }

  return (
    <div className="page">
      <h1>考試頁</h1>

      <div className="meta">
        第 {idx + 1} / {total} 題
      </div>

      <div className="card">
        <div className="row split">
          <div className="meta">{isFlagged ? '已標記此題' : '未標記'}</div>
          <button className="button secondary" type="button" onClick={onToggleFlag}>
            {isFlagged ? '取消標記' : '標記'}
          </button>
        </div>

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
            <button className="button" type="button" onClick={onNext} disabled={!hasChosen}>
              下一題
            </button>
          ) : (
            <button className="button" type="button" onClick={onFinish} disabled={!hasChosen}>
              交卷
            </button>
          )}
        </div>
      </div>

      <div className="hint">必須先作答，才能按「下一題」或「交卷」。</div>
    </div>
  )
}
