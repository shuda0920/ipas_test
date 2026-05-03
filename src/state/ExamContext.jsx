import { createContext, useContext, useMemo, useReducer } from 'react'
import { buildExamQuestions } from '../lib/examEngine.js'

const ExamContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_BANK':
      return {
        ...state,
        bank: action.bank,
        bankError: null,
      }
    case 'SET_BANK_ERROR':
      return {
        ...state,
        bank: [],
        bankError: action.error ?? '題庫載入失敗',
      }
    case 'START': {
      const questions = buildExamQuestions(state.bank, action.count)
      const answersById = {}
      for (const q of questions) answersById[q.id] = null

      return {
        ...state,
        status: 'inProgress',
        questions,
        answersById,
        currentIndex: 0,
        finished: false,
      }
    }
    case 'ANSWER': {
      if (state.status !== 'inProgress') return state
      return {
        ...state,
        answersById: {
          ...state.answersById,
          [action.questionId]: action.choiceIndex,
        },
      }
    }
    case 'GOTO': {
      if (state.status !== 'inProgress') return state
      const idx = Math.max(0, Math.min(action.index, state.questions.length - 1))
      return { ...state, currentIndex: idx }
    }
    case 'FINISH': {
      if (state.status !== 'inProgress') return state
      return { ...state, status: 'finished', finished: true }
    }
    case 'RESET':
      return {
        ...state,
        status: 'idle',
        questions: [],
        answersById: {},
        currentIndex: 0,
        finished: false,
      }
    default:
      return state
  }
}

export function ExamProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    status: 'idle',
    bank: [],
    bankError: null,
    questions: [],
    answersById: {},
    currentIndex: 0,
    finished: false,
  })

  const actions = useMemo(() => {
    return {
      setBank: (bank) => dispatch({ type: 'SET_BANK', bank }),
      setBankError: (error) => dispatch({ type: 'SET_BANK_ERROR', error }),
      start: (count) => dispatch({ type: 'START', count }),
      answer: (questionId, choiceIndex) =>
        dispatch({ type: 'ANSWER', questionId, choiceIndex }),
      goto: (index) => dispatch({ type: 'GOTO', index }),
      finish: () => dispatch({ type: 'FINISH' }),
      reset: () => dispatch({ type: 'RESET' }),
    }
  }, [])

  const api = useMemo(() => ({ state, ...actions }), [state, actions])

  return <ExamContext.Provider value={api}>{children}</ExamContext.Provider>
}

export function useExam() {
  const ctx = useContext(ExamContext)
  if (!ctx) throw new Error('useExam must be used within <ExamProvider>')
  return ctx
}
