import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { gradeExam } from '../lib/examEngine.js'
import { useExam } from '../state/ExamContext.jsx'

function renderChoiceLabel(index, { emptyLabel }) {
  if (index == null) return emptyLabel
  return String.fromCharCode('A'.charCodeAt(0) + index)
}

function choiceMarker({ isChosen, isCorrect }) {
  if (isChosen && isCorrect) return '（你的答案 / 正確）'
  if (isCorrect) return '（正確）'
  if (isChosen) return '（你的答案）'
  return ''
}

function ChoiceBadges({ isChosen, isCorrect }) {
  if (!isChosen && !isCorrect) return null

  return (
    <span className="badges">
      {isChosen ? <span className="badge chosen">你的答案</span> : null}
      {isCorrect ? <span className="badge correct">正確答案</span> : null}
    </span>
  )
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const { state, reset } = useExam()
  const [openId, setOpenId] = useState(null)

  if (state.status !== 'finished') {
    return <Navigate to="/" replace />
  }

  const report = useMemo(() => {
    return gradeExam(state.questions, state.answersById)
  }, [state.questions, state.answersById])

  function onBackHome() {
    reset()
    navigate('/')
  }

  return (
    <div className="page">
      <h1>結果頁</h1>

      <div className="card">
        <div className="score">
          得分：{report.correct} / {report.total}
        </div>

        <div className="meta">
          錯題：{report.wrong.length} 題
        </div>

        <div className="actions">
          <button className="button" type="button" onClick={onBackHome}>
            回到題數選擇
          </button>
        </div>
      </div>

      <h2>錯題解析</h2>

      {report.wrong.length === 0 ? (
        <div className="hint">全對！沒有錯題可以檢視。</div>
      ) : (
        <div className="list">
          {report.wrong.map(({ question, chosenIndex }) => {
            const isOpen = openId === question.id
            const correctIndex = question.correctIndex

            const chosenText =
              chosenIndex == null
                ? null
                : question.choices?.[chosenIndex] ?? null

            const correctText =
              correctIndex == null
                ? null
                : question.choices?.[correctIndex] ?? null

            return (
              <div key={question.id} className="card">
                <div className="row split">
                  <div>
                    <div className="question small">{question.topic}</div>
                    <div className="meta">
                      你的答案：
                      {renderChoiceLabel(chosenIndex, { emptyLabel: '（未作答）' })}
                      {chosenText ? ` ${chosenText}` : ''}
                      {'  '}| 正確答案：
                      {renderChoiceLabel(correctIndex, {
                        emptyLabel: '（題庫答案無法解析）',
                      })}
                      {correctText ? ` ${correctText}` : ''}
                    </div>
                  </div>

                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : question.id)}
                  >
                    {isOpen ? '收合' : '看解析'}
                  </button>
                </div>

                {isOpen ? (
                  <div className="explain">
                    <div className="label">題目</div>
                    <div className="text">{question.topic}</div>

                    <div className="label">選項</div>
                    {question.choices?.length ? (
                      <div className="choices">
                        {question.choices.map((c, i) => {
                          const isChosen = chosenIndex === i
                          const isCorrect = correctIndex === i
                          const isWrongChosen = isChosen && !isCorrect
                          const marker = choiceMarker({ isChosen, isCorrect })

                          return (
                            <div
                              key={i}
                              className={
                                'choice option' +
                                (isCorrect ? ' isCorrect' : '') +
                                (isChosen ? ' isChosen' : '') +
                                (isWrongChosen ? ' isWrongChosen' : '')
                              }
                            >
                              <span className="optionText">
                                <span className="optionLabel">
                                  {renderChoiceLabel(i, { emptyLabel: '' })}.
                                </span>{' '}
                                {c}
                                {marker ? <span className="meta"> {marker}</span> : null}
                              </span>

                              <ChoiceBadges isChosen={isChosen} isCorrect={isCorrect} />
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="hint">（此題沒有選項，請檢查題庫的 choic 欄位）</div>
                    )}

                    <div className="label">解析</div>
                    <div className="text">{question.why || '（未提供解析）'}</div>

                    <div className="label">複習重點</div>
                    <div className="keywords">
                      {(question.keyword?.length ? question.keyword : ['（未提供）']).map(
                        (k, i) => (
                          <span key={i} className="tag">
                            {k}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
