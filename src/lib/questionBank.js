function normalizeKeyword(keyword) {
  if (keyword == null) return []
  if (Array.isArray(keyword)) return keyword.map((k) => String(k)).filter(Boolean)
  return String(keyword)
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter(Boolean)
}

function normalizeChoiceText(choice) {
  const original = choice == null ? '' : String(choice)
  let s = original.trim()
  if (!s) return ''

  // Common option label prefixes:
  // (A) foo, （A）foo, [A] foo
  s = s.replace(/^\s*[\(\[（【]\s*([A-Za-z]|\d{1,2})\s*[\)\]）】]\s*/u, '')
  // A) foo, A. foo, A、foo, 1) foo, 1. foo
  s = s.replace(/^\s*([A-Za-z]|\d{1,2})\s*[\)\.．:：、]\s*/u, '')

  const cleaned = s.trim()
  return cleaned || original.trim()
}

function normalizeChoices(choicOrChoice) {
  if (choicOrChoice == null) return []
  const raw = Array.isArray(choicOrChoice)
    ? choicOrChoice.map((c) => String(c))
    : String(choicOrChoice)
        .split(/\n|\|/)
        .map((c) => c.trim())
        .filter(Boolean)

  return raw.map((c) => normalizeChoiceText(c))
}

function parseAnswerAsIndex(ans, choices) {
  const n = choices.length
  if (n === 0 || ans == null) return null

  const normalizedChoices = choices.map((c) => normalizeChoiceText(c))

  if (typeof ans === 'number' && Number.isFinite(ans)) {
    if (ans >= 1 && ans <= n) return ans - 1
    if (ans >= 0 && ans < n) return ans
    return null
  }

  const s = String(ans).trim()
  if (!s) return null

  // Handle formats like (A) / （A） / [A]
  const bracketed = s.match(/^[\(\[（【]\s*([A-Za-z]|\d{1,2})\s*[\)\]）】]\s*$/u)
  if (bracketed) {
    const inner = bracketed[1]
    if (/^[A-Za-z]$/.test(inner)) {
      const idx = inner.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
      if (idx >= 0 && idx < n) return idx
    }

    if (/^\d{1,2}$/.test(inner)) {
      const num = Number(inner)
      if (num >= 1 && num <= n) return num - 1
      if (num >= 0 && num < n) return num
    }
  }

  // Exact match
  const exact = choices.findIndex((c) => c === s)
  if (exact !== -1) return exact

  const exactNormalized = normalizedChoices.findIndex((c) => c === normalizeChoiceText(s))
  if (exactNormalized !== -1) return exactNormalized

  // Letter A/B/C...
  if (/^[A-Za-z]$/.test(s)) {
    const idx = s.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
    if (idx >= 0 && idx < n) return idx
  }

  // A) / A. / A、
  const letterWithPunct = s.match(/^\s*([A-Za-z])\s*[\)\.．:：、]\s*$/u)
  if (letterWithPunct) {
    const idx = letterWithPunct[1].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
    if (idx >= 0 && idx < n) return idx
  }

  // Numeric string
  if (/^\d+$/.test(s)) {
    const num = Number(s)
    if (num >= 1 && num <= n) return num - 1
    if (num >= 0 && num < n) return num
  }

  // 1) / 1.
  const numWithPunct = s.match(/^\s*(\d{1,2})\s*[\)\.．:：、]\s*$/u)
  if (numWithPunct) {
    const num = Number(numWithPunct[1])
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
