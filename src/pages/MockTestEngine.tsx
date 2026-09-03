import { useState, useEffect } from 'react'
import { Check, ChevronLeft, ChevronRight, Clock, Flag, Trash2, X } from 'lucide-react'
import { sampleMockQuestions, type MockQuestion } from '../data/sampleMock'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export const MockTestEngine = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeTest, saveActiveTest, clearActiveTest, addMistake, addMockTest } = useAppStore()
  
  // Determine if we should load from activeTest or start a new one
  const isNewTest = !!location.state
  
  const initialQuestions = isNewTest ? location.state.questions : (activeTest ? activeTest.questions : sampleMockQuestions)
  const initialTime = isNewTest ? location.state.duration : (activeTest ? activeTest.timeLeft : 10800)
  const initialTitle = isNewTest ? location.state.title : (activeTest ? activeTest.title : 'GATE Simulator')

  const [questions] = useState<MockQuestion[]>(initialQuestions)
  const [currentIndex, setCurrentIndex] = useState(isNewTest ? 0 : (activeTest ? activeTest.currentIndex : 0))
  const [timeLeft, setTimeLeft] = useState(initialTime) 
  
  // State for user answers: id -> string or string[]
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    isNewTest ? {} : (activeTest ? activeTest.answers : {})
  )
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(
    new Set(isNewTest ? [] : (activeTest ? activeTest.markedForReview : []))
  )
  const [visited, setVisited] = useState<Set<string>>(
    new Set(isNewTest ? [initialQuestions[0].id] : (activeTest ? activeTest.visited : [initialQuestions[0].id]))
  )
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [title] = useState(initialTitle)
  const [loggedMistakes, setLoggedMistakes] = useState<Set<string>>(new Set())

  // Sync to store on change
  useEffect(() => {
    if (!isSubmitted) {
      saveActiveTest({
        questions,
        currentIndex,
        timeLeft,
        answers,
        markedForReview: Array.from(markedForReview),
        visited: Array.from(visited),
        title
      })
    }
  }, [questions, currentIndex, timeLeft, answers, markedForReview, visited, title, isSubmitted, saveActiveTest])

  // Timer
  useEffect(() => {
    if (isSubmitted) return
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isSubmitted])

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const currentQ = questions[currentIndex]

  const handleOptionSelect = (option: string) => {
    if (currentQ.type === 'MCQ') {
      setAnswers(prev => ({ ...prev, [currentQ.id]: option }))
    } else if (currentQ.type === 'MSQ') {
      const prevAnswers = (answers[currentQ.id] as string[]) || []
      if (prevAnswers.includes(option)) {
        setAnswers(prev => ({ ...prev, [currentQ.id]: prevAnswers.filter(a => a !== option) }))
      } else {
        setAnswers(prev => ({ ...prev, [currentQ.id]: [...prevAnswers, option] }))
      }
    }
  }

  const handleNatInput = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }))
  }

  const handleSaveAndNext = () => {
    // Unmark for review if it was marked
    if (markedForReview.has(currentQ.id)) {
      const newMarked = new Set(markedForReview)
      newMarked.delete(currentQ.id)
      setMarkedForReview(newMarked)
    }
    goToQuestion(currentIndex + 1)
  }

  const handleMarkForReview = () => {
    const newMarked = new Set(markedForReview)
    newMarked.add(currentQ.id)
    setMarkedForReview(newMarked)
    goToQuestion(currentIndex + 1)
  }

  const handleClearResponse = () => {
    const newAnswers = { ...answers }
    delete newAnswers[currentQ.id]
    setAnswers(newAnswers)
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index)
      const newVisited = new Set(visited)
      newVisited.add(questions[index].id)
      setVisited(newVisited)
    }
  }

  const handleSubmit = () => {
    if (!isSubmitted && window.confirm("Are you sure you want to submit the test?")) {
      setIsSubmitted(true)
      clearActiveTest()
      
      // Calculate scores to save to store
      let totalMarks = 0
      const sectionScores: Record<string, number> = {}

      questions.forEach(q => {
        const userAnswer = answers[q.id]
        const isAnswered = userAnswer !== undefined && (Array.isArray(userAnswer) ? userAnswer.length > 0 : userAnswer !== '')
        if (!isAnswered) return

        let isCorrect = false
        if (q.type === 'MCQ' || q.type === 'NAT') {
          isCorrect = userAnswer === q.correctAnswer
        } else if (q.type === 'MSQ') {
          const uArr = [...(userAnswer as string[])].sort()
          const cArr = [...(q.correctAnswer as string[])].sort()
          isCorrect = uArr.length === cArr.length && uArr.every((v, i) => v === cArr[i])
        }

        const scoreDelta = isCorrect ? q.marks : -q.negativeMarks
        totalMarks += scoreDelta
        sectionScores[q.subject] = (sectionScores[q.subject] || 0) + scoreDelta
      })

      addMockTest({
        date: new Date().toISOString(),
        name: title,
        totalScore: totalMarks,
        percentileEstimate: Math.min(99.9, Math.max(50, (totalMarks / (questions.length * 2)) * 100)),
        sectionScores: sectionScores as any // SubjectPhase
      })
    }
  }

  const handleAbort = () => {
    if (window.confirm("Are you sure you want to abort this test? All progress will be lost.")) {
      clearActiveTest()
      navigate('/mocks')
    }
  }

  const getStatusColor = (qId: string) => {
    const isAnswered = answers[qId] !== undefined && (Array.isArray(answers[qId]) ? (answers[qId] as string[]).length > 0 : answers[qId] !== '')
    const isMarked = markedForReview.has(qId)
    const isVisited = visited.has(qId)

    if (isMarked && isAnswered) return 'bg-purple-600 text-white border-purple-800' // Answered & Marked
    if (isMarked) return 'bg-purple-400 text-white border-purple-600' // Marked but not answered
    if (isAnswered) return 'bg-emerald-500 text-white border-emerald-700' // Answered
    if (isVisited) return 'bg-rose-500 text-white border-rose-700' // Not answered
    return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600' // Not visited
  }

  // --- Result Calculation ---
  if (isSubmitted) {
    let totalMarks = 0
    let correctCount = 0
    let incorrectCount = 0
    let unattemptedCount = 0

    questions.forEach(q => {
      const userAnswer = answers[q.id]
      const isAnswered = userAnswer !== undefined && (Array.isArray(userAnswer) ? userAnswer.length > 0 : userAnswer !== '')
      
      if (!isAnswered) {
        unattemptedCount++
        return
      }

      let isCorrect = false
      if (q.type === 'MCQ' || q.type === 'NAT') {
        isCorrect = userAnswer === q.correctAnswer
      } else if (q.type === 'MSQ') {
        const uArr = [...(userAnswer as string[])].sort()
        const cArr = [...(q.correctAnswer as string[])].sort()
        isCorrect = uArr.length === cArr.length && uArr.every((v, i) => v === cArr[i])
      }

      if (isCorrect) {
        correctCount++
        totalMarks += q.marks
      } else {
        incorrectCount++
        totalMarks -= q.negativeMarks
      }
    })

    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-900 overflow-y-auto pt-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold font-heading">Test Result Analytics</h1>
            <button 
              onClick={() => navigate('/mocks')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
            >
              <X size={20} /> Close Test
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-6 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase">Score</p>
              <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{totalMarks.toFixed(2)}</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase">Correct</p>
              <p className="text-4xl font-black text-emerald-500 mt-2">{correctCount}</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase">Incorrect</p>
              <p className="text-4xl font-black text-rose-500 mt-2">{incorrectCount}</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase">Unattempted</p>
              <p className="text-4xl font-black text-slate-500 mt-2">{unattemptedCount}</p>
            </div>
          </div>

          <h2 className="text-xl font-bold font-heading mb-4">Detailed Breakdown</h2>
          <div className="space-y-4 mb-12">
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id]
              const isAnswered = userAnswer !== undefined && (Array.isArray(userAnswer) ? userAnswer.length > 0 : userAnswer !== '')
              let isCorrect = false
              
              if (isAnswered) {
                if (q.type === 'MCQ' || q.type === 'NAT') {
                  isCorrect = userAnswer === q.correctAnswer
                } else if (q.type === 'MSQ') {
                  const uArr = [...(userAnswer as string[])].sort()
                  const cArr = [...(q.correctAnswer as string[])].sort()
                  isCorrect = uArr.length === cArr.length && uArr.every((v, i) => v === cArr[i])
                }
              }

              return (
                <div key={q.id} className={`glass-card p-5 border-l-4 ${!isAnswered ? 'border-l-slate-400' : isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold">Question {idx + 1} ({q.type})</span>
                    <div className="flex items-center gap-3">
                      {isAnswered && !isCorrect && (
                        <button
                          onClick={() => {
                            if (loggedMistakes.has(q.id)) return
                            addMistake({
                              date: new Date().toISOString(),
                              question: q.text,
                              wrongAnswer: Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer,
                              correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer,
                              reason: '', // To be filled by user later
                              difficulty: 'medium', // Default
                              topic: q.subject,
                              phase: (q.subject as any) // Assuming subject maps to SubjectPhase
                            })
                            setLoggedMistakes(new Set(loggedMistakes).add(q.id))
                          }}
                          disabled={loggedMistakes.has(q.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                            loggedMistakes.has(q.id) 
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          <Flag size={14} />
                          {loggedMistakes.has(q.id) ? 'Mistake Logged' : 'Log Mistake'}
                        </button>
                      )}
                      <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                        [{q.marks} Mark, -{q.negativeMarks}]
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 whitespace-pre-wrap font-medium">{q.text}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-xs mb-1">Your Answer</span>
                      <span className={`font-semibold ${!isAnswered ? 'text-slate-500' : isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {!isAnswered ? 'Not Attempted' : Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase text-xs mb-1">Correct Answer</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // --- Active Test UI ---
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg font-heading">{title}</h1>
          <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            <span className={timeLeft < 300 ? 'text-rose-500 animate-pulse' : ''}>{formatTimer(timeLeft)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAbort} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            Abort Test
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors"
          >
            <Check size={18} /> Submit Exam
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Question Area */}
        <div className="flex-1 flex flex-col relative">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex justify-between items-center text-sm font-medium text-slate-500">
            <div>Question {currentIndex + 1}</div>
            <div className="flex gap-4">
              <span>Type: <strong className="text-blue-600 dark:text-blue-400">{currentQ.type}</strong></span>
              <span>Marks: <strong className="text-emerald-500">+{currentQ.marks}</strong></span>
              <span>Negative: <strong className="text-rose-500">-{currentQ.negativeMarks}</strong></span>
            </div>
          </div>
          
          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <h2 className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200 mb-8 whitespace-pre-wrap leading-relaxed">
              {currentQ.text}
            </h2>

            <div className="space-y-4 max-w-3xl">
              {currentQ.type === 'MCQ' || currentQ.type === 'MSQ' ? (
                currentQ.options?.map((opt, idx) => {
                  const isChecked = currentQ.type === 'MCQ' 
                    ? answers[currentQ.id] === opt
                    : (answers[currentQ.id] as string[] || []).includes(opt)
                  
                  return (
                    <label 
                      key={idx} 
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isChecked 
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-md shadow-indigo-500/10' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <input 
                        type={currentQ.type === 'MCQ' ? 'radio' : 'checkbox'} 
                        name={`q-${currentQ.id}`} 
                        checked={isChecked}
                        onChange={() => handleOptionSelect(opt)}
                        className="mt-1 w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{opt}</span>
                    </label>
                  )
                })
              ) : (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-slate-500 mb-2">Enter numerical value:</label>
                  <input 
                    type="number" 
                    value={(answers[currentQ.id] as string) || ''}
                    onChange={(e) => handleNatInput(e.target.value)}
                    placeholder="e.g. 42.5"
                    className="w-full max-w-sm p-4 text-lg rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-indigo-500 focus:ring-4 ring-indigo-500/20 font-mono shadow-inner transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="h-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
            <div className="flex gap-3">
              <button 
                onClick={handleMarkForReview}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-purple-200 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold transition-colors"
              >
                <Flag size={18} /> Mark for Review & Next
              </button>
              <button 
                onClick={handleClearResponse}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold transition-colors"
              >
                <Trash2 size={18} /> Clear Response
              </button>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={20} /> Back
              </button>
              <button 
                onClick={handleSaveAndNext}
                className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md"
              >
                Save & Next <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Question Palette */}
        <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">Question Palette</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-emerald-500 border border-emerald-700"></div> Answered</div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-rose-500 border border-rose-700"></div> Not Answered</div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"></div> Not Visited</div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-purple-400 border border-purple-600"></div> Marked</div>
              <div className="flex items-center gap-2 col-span-2"><div className="w-6 h-6 rounded-md bg-purple-600 border border-purple-800 relative after:content-[''] after:absolute after:-bottom-1 after:-right-1 after:w-3 after:h-3 after:bg-emerald-500 after:rounded-full after:border-2 after:border-white dark:after:border-slate-900"></div> Answered & Marked</div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{questions[0].subject}</h4>
            <div className="grid grid-cols-4 gap-3">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  className={`w-12 h-12 rounded-lg font-bold text-sm border-2 transition-transform hover:scale-110 flex items-center justify-center relative ${getStatusColor(q.id)} ${currentIndex === idx ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-110' : ''}`}
                >
                  {idx + 1}
                  {markedForReview.has(q.id) && answers[q.id] !== undefined && (Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length > 0 : answers[q.id] !== '') && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-white dark:border-slate-900"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
