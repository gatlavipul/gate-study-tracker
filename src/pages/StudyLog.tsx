import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWhiteNoise } from '../hooks/useWhiteNoise'
import { Play, Square, Plus, Trash2, Clock, Headphones } from 'lucide-react'
import { useAppStore, type SubjectPhase, type SessionCategory } from '../store/useAppStore'
import { format } from 'date-fns'

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
  const { sessions, addSession, deleteSession } = useAppStore()
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

      <header className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Study Log & Timer</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your focused study sessions.</p>
      </header>

      {/* Timer & Add Session Form */}
      <section className="glass-panel p-6">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="w-full md:w-1/2 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Topic / Chapter</label>
              <input 
                type="text" 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Graph Theory properties"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 ring-blue-500 outline-none transition-all"
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
