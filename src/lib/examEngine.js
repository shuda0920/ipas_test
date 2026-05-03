export const MAX_QUESTIONS_PER_EXAM = 50

export function clampQuestionCount(requested, available) {
  const n = Number(requested)
  if (!Number.isFinite(n)) return 1
  const safe = Math.max(1, Math.floor(n))
  return Math.min(safe, MAX_QUESTIONS_PER_EXAM, Math.max(1, available))
}

export function shuffle(array, rng = Math.random) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildExamQuestions(allQuestions, count) {
  const pool = Array.isArray(allQuestions) ? allQuestions : []
  const actualCount = clampQuestionCount(count, pool.length)
  return shuffle(pool).slice(0, actualCount)
}

export function gradeExam(questions, answersById) {
  const qList = Array.isArray(questions) ? questions : []
  const answers = answersById ?? {}

  let correct = 0
  const wrong = []

  for (const q of qList) {
    const chosenIndex = answers[q.id] ?? null
    const isCorrect =
      q.correctIndex != null && chosenIndex != null && chosenIndex === q.correctIndex

    if (isCorrect) {
      correct += 1
    } else {
      wrong.push({
        question: q,
        chosenIndex,
      })
    }
  }

  return {
    total: qList.length,
    correct,
    wrong,
  }
}
