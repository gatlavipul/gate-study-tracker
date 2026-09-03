import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWhiteNoise } from '../hooks/useWhiteNoise'
import { Play, Square, Plus, Trash2, Clock, Headphones, Target } from 'lucide-react'
import { useAppStore, type SubjectPhase, type SessionCategory } from '../store/useAppStore'
import { format, differenceInDays } from 'date-fns'
import { gatePlan } from '../data/gate2027_plan'

const phases: SubjectPhase[] = ['Math', 'Programming', 'OS', 'DBMS', 'Networks', 'TOC', 'Compiler', 'COA', 'DigitalLogic', 'Aptitude']
const categories: SessionCategory[] = ['theory', 'practice', 'revision']

const quotes = [
  "Discipline is choosing between what you want now and what you want most.",
  "Don't stop when you're tired. Stop when you're done.",
  "The secret of your future is hidden in your daily routine.",
  "Focus on the step in front of you, not the whole staircase.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "You don't have to be extreme, just consistent."
]

export const StudyLog = () => {
  const { sessions, addSession, deleteSession, startDate } = useAppStore()
  
  // Calculate today's plan
  const daysPassed = Math.max(0, differenceInDays(new Date(), new Date(startDate)))
  const currentDayIndex = Math.min(daysPassed, gatePlan.length - 1)
  const todayPlan = gatePlan[currentDayIndex]

  const [topic, setTopic] = useState('')
  const [phase, setPhase] = useState<SubjectPhase>('Math')
  const [category, setCategory] = useState<SessionCategory>('theory')
  
  // Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)

  const { isPlaying: isNoisePlaying, toggleNoise } = useWhiteNoise()

  useEffect(() => {
    let interval: number | undefined
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Rotate quotes every 2 minutes in focus mode
  useEffect(() => {
    let quoteInterval: number | undefined
    if (isTimerRunning) {
      quoteInterval = window.setInterval(() => {
        setQuoteIndex(prev => (prev + 1) % quotes.length)
      }, 120000)
    }
    return () => clearInterval(quoteInterval)
  }, [isTimerRunning])

  const handleStartStop = () => {
    if (!topic.trim() && !isTimerRunning) {
      return alert('Please enter a topic before starting the focus timer!')
    }
    setIsTimerRunning(!isTimerRunning)
  }

  const handleSaveSession = () => {
    if (!topic.trim()) return alert('Please enter a topic')
    const minutes = Math.floor(seconds / 60)
    if (minutes < 1) {
      setIsTimerRunning(false)
      return alert('Session must be at least 1 minute long to save')
    }

    addSession({
      date: new Date().toISOString(),
      topic,
      durationMinutes: minutes,
      phase,
      category
    })
    
    // Reset form and timer
    setTopic('')
    setSeconds(0)
    setIsTimerRunning(false)
  }

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Distraction-Free Focus Mode Overlay */}
      <AnimatePresence>
        {isTimerRunning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center text-white"
          >
            <div className="absolute top-8 right-8 flex gap-4">
              <button
                onClick={toggleNoise}
                className={`p-4 rounded-full transition-all flex items-center gap-2 ${
                  isNoisePlaying ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle Deep Focus Noise"
              >
                <Headphones size={24} />
                {isNoisePlaying && <span className="font-medium pr-2">Focus Audio On</span>}
              </button>
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center max-w-2xl px-6"
            >
              <div className="text-emerald-400 font-medium tracking-widest uppercase mb-4 text-sm">Deep Work in Progress</div>
              <h2 className="text-3xl md:text-5xl font-bold font-heading mb-12 text-slate-100">{topic}</h2>
              
              <div className="text-8xl md:text-[12rem] font-bold font-mono tracking-tighter mb-16 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 tabular-nums">
                {formatTime(seconds)}
              </div>

              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={handleStartStop}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-amber-500/20 flex items-center gap-3 hover:scale-105"
                >
                  <Square fill="currentColor" /> Pause & Exit
                </button>
                {seconds >= 60 && (
                  <button 
                    onClick={handleSaveSession}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3 hover:scale-105"
                  >
                    <Plus /> Save Session
                  </button>
                )}
              </div>
            </motion.div>

            <motion.div 
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute bottom-12 text-center text-slate-400 text-lg max-w-xl italic px-4"
            >
              "{quotes[quoteIndex]}"
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-6 md:mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading">Deep Work Log</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Focus on one thing. Track your hours.</p>
        </div>
      </header>

      {/* Daily Target Plan */}
      <section className="mb-8">
        <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
          <Target size={20} className="text-emerald-500" />
          Today's Target (Day {todayPlan.day} / {gatePlan.length})
        </h2>
        <div className="glass-panel p-5 md:p-6 border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10">
          <h3 className="font-semibold text-lg mb-4 text-slate-800 dark:text-white">
            Week {todayPlan.week} — {todayPlan.title.replace(`Day ${todayPlan.day}: `, '')}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Topics to Learn</p>
              <ul className="space-y-2">
                {todayPlan.topics.map((t, idx) => (
                  <li 
                    key={idx} 
                    onClick={() => {
                      setTopic(t)
                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                    }}
                    className="flex items-start gap-2 text-sm cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                  >
                    <span className="text-emerald-500 mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity">•</span>
                    <span>{t} <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1">(Click to track)</span></span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Practice</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{todayPlan.practice}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Revision</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{todayPlan.revision.replace('Morning: ', '')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Aptitude</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{todayPlan.aptitude.replace('15 min ', '')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Mode Panel */}
      <section className={`glass-panel p-4 md:p-6 transition-all duration-700 relative overflow-hidden ${
        isTimerRunning 
          ? 'ring-4 ring-indigo-500/50 shadow-2xl shadow-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.02]' 
          : ''
      }`}>
        {/* Ambient background glow when focusing */}
        {isTimerRunning && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 animate-pulse pointer-events-none" />
        )}
        
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">What are you studying?</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. C Programming: Pointers"
                disabled={isTimerRunning}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 outline-none focus:ring-2 ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Subject Phase</label>
                <select 
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as SubjectPhase)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 outline-none"
                >
                  {phases.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SessionCategory)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 outline-none capitalize"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-full md:w-1/3 relative">
            <button
              onClick={toggleNoise}
              className={`absolute -top-4 right-0 p-3 rounded-full transition-all shadow-md flex items-center gap-2 ${
                isNoisePlaying ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Toggle White Noise"
            >
              <Headphones size={20} />
              {isNoisePlaying && <span className="text-xs font-medium pr-1">Focus Audio</span>}
            </button>
            <div className="text-6xl font-bold font-mono tracking-wider mb-6 text-slate-800 dark:text-white mt-4">
              {formatTime(seconds)}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleStartStop}
                className={`p-4 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 shadow-lg ${isTimerRunning ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'}`}
                title="Start Focus Timer"
              >
                {isTimerRunning ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              <button 
                onClick={handleSaveSession}
                disabled={isTimerRunning || seconds < 60}
                className="p-4 rounded-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-emerald-500/30"
                title="Save Session"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Sessions */}
      <section>
        <h2 className="text-xl font-bold font-heading mb-4 mt-8 flex items-center gap-2">
          <Clock size={20} className="text-blue-500" />
          Recent Sessions
        </h2>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center p-8 text-slate-500 glass-panel border-dashed">
              No study sessions yet. Start the timer to log your first session!
            </div>
          ) : (
            sessions.slice(0, 10).map((session, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={session.id} 
                className="glass-card flex items-center justify-between !p-4 hover:border-blue-500/30 transition-colors"
              >
                <div>
                  <div className="font-semibold text-lg">{session.topic}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="capitalize">{session.category}</span>
                    <span>•</span>
                    <span>{session.phase}</span>
                    <span>•</span>
                    <span>{format(new Date(session.date), 'MMM d, p')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="font-mono text-xl font-bold text-blue-600 dark:text-blue-400">
                    {session.durationMinutes}m
                  </div>
                  <button 
                    onClick={() => deleteSession(session.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
