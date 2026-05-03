function normalizeKeyword(keyword) {
  if (keyword == null) return []
  if (Array.isArray(keyword)) return keyword.map((k) => String(k)).filter(Boolean)
  return String(keyword)
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter(Boolean)
}

function normalizeChoices(choicOrChoice) {
  if (choicOrChoice == null) return []
  if (Array.isArray(choicOrChoice)) return choicOrChoice.map((c) => String(c))
  return String(choicOrChoice)
    .split(/\n|\|/)
    .map((c) => c.trim())
    .filter(Boolean)
}

function parseAnswerAsIndex(ans, choices) {
  const n = choices.length
  if (n === 0 || ans == null) return null

  if (typeof ans === 'number' && Number.isFinite(ans)) {
    if (ans >= 1 && ans <= n) return ans - 1
    if (ans >= 0 && ans < n) return ans
    return null
  }

  const s = String(ans).trim()
  if (!s) return null

  // Exact match
  const exact = choices.findIndex((c) => c === s)
  if (exact !== -1) return exact

  // Letter A/B/C...
  if (/^[A-Za-z]$/.test(s)) {
    const idx = s.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
    if (idx >= 0 && idx < n) return idx
  }

  // Numeric string
  if (/^\d+$/.test(s)) {
    const num = Number(s)
    if (num >= 1 && num <= n) return num - 1
    if (num >= 0 && num < n) return num
  }

  return null
}

export function loadAllQuestions() {
  // Vite will bundle any JSON files under src/topic/**/topic.json
  const modules = import.meta.glob('../topic/**/topic.json', { eager: true })

  const questions = []
  for (const [filePath, mod] of Object.entries(modules)) {
    const raw = mod?.default
    if (!Array.isArray(raw)) continue

    raw.forEach((item, index) => {
      const topic = item?.topic != null ? String(item.topic) : ''
      const choices = normalizeChoices(item?.choic ?? item?.choice)
      const ans = item?.ans
      const correctIndex = parseAnswerAsIndex(ans, choices)
      const why = item?.why != null ? String(item.why) : ''
      const keyword = normalizeKeyword(item?.keyword)

      if (!topic) return

      questions.push({
        id: `${filePath}::${index}`,
        topic,
        choices,
        ans,
        correctIndex,
        why,
        keyword,
        source: filePath,
      })
    })
  }

  return questions
}
