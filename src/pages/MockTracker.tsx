import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, TrendingUp, Trophy, Trash2, Clock, Play, Pause, Square, X } from 'lucide-react'
import { useAppStore, type SubjectPhase } from '../store/useAppStore'
import { format, parseISO } from 'date-fns'
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  XAxis,
  YAxis
} from 'recharts'

export const MockTracker = () => {
  const { mockTests, addMockTest, deleteMockTest } = useAppStore()
  const [isAdding, setIsAdding] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  // Timer State
  const [timeLeft, setTimeLeft] = useState(10800) // 3 hours
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSimulating && isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false)
      alert("Time's up! GATE Exam Simulation Complete.")
    }
    return () => clearInterval(interval)
  }, [isSimulating, isTimerRunning, timeLeft])

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const toggleSimulator = () => {
    if (isSimulating) {
      if (window.confirm("End the simulation? Timer will be reset.")) {
        setIsSimulating(false)
        setIsTimerRunning(false)
        setTimeLeft(10800)
      }
    } else {
      setIsSimulating(true)
    }
  }

  // Form State
  const [name, setName] = useState('')
  const [totalScore, setTotalScore] = useState<number | ''>('')
  const [percentile, setPercentile] = useState<number | ''>('')

  const handleSave = () => {
    if (!name.trim() || totalScore === '' || percentile === '') {
      return alert('Please fill in all basic fields')
    }
    
    addMockTest({
      date: new Date().toISOString(),
      name,
      totalScore: Number(totalScore),
      percentileEstimate: Number(percentile),
      sectionScores: {} as Record<SubjectPhase, number> // Simplified for MVP
    })

    setName('')
    setTotalScore('')
    setPercentile('')
    setIsAdding(false)
  }

  // Sort chronologically for chart
  const chartData = useMemo(() => {
    return [...mockTests]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(test => ({
        ...test,
        displayDate: format(parseISO(test.date), 'MMM dd')
      }))
  }, [mockTests])

  const latestMock = chartData[chartData.length - 1]

  return (
    <div className="space-y-6 pb-24">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading">Mock Test Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Visualize your trajectory to IIT.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleSimulator}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 md:px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 text-sm md:text-base"
          >
            <Clock size={18} /> {isSimulating ? 'End Exam' : '3-Hr Simulator'}
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 text-sm md:text-base"
          >
            {isAdding ? 'Cancel' : <><Plus size={18} /> Log Mock</>}
          </button>
        </div>
      </header>

      {/* Simulator Mode Fullscreen Overlay */}
      <AnimatePresence>
        {isSimulating && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white p-6"
          >
            <button onClick={toggleSimulator} className="absolute top-8 right-8 text-slate-400 hover:text-white">
              <X size={32} />
            </button>
            <div className="text-center max-w-2xl w-full">
              <h2 className="text-3xl font-heading font-bold text-indigo-400 mb-2">GATE Exam Simulator</h2>
              <p className="text-slate-400 mb-12">Treat this exactly like the real 3-hour exam. No distractions.</p>
              
              <div className="text-[15vw] md:text-9xl font-mono font-bold tracking-tighter mb-12 tabular-nums">
                {formatTimer(timeLeft)}
              </div>
              
              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                    isTimerRunning ? 'bg-amber-500 shadow-amber-500/30' : 'bg-emerald-500 shadow-emerald-500/30'
                  }`}
                >
                  {isTimerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                </button>
                <button 
                  onClick={() => { setIsTimerRunning(false); setTimeLeft(10800); }}
                  className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
                >
                  <Square size={24} fill="currentColor" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Form */}
      {isAdding && (
        <motion.section 
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          className="glass-panel p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Test Name (e.g. MadeEasy FLT-1)</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 outline-none focus:ring-2 ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Score (out of 100)</label>
              <input 
                type="number" 
                value={totalScore}
                onChange={e => setTotalScore(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 outline-none focus:ring-2 ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Percentile</label>
              <input 
                type="number" 
                value={percentile}
                onChange={e => setPercentile(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 outline-none focus:ring-2 ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30"
            >
              Save Results
            </button>
          </div>
        </motion.section>
      )}

      {mockTests.length === 0 ? (
         <div className="glass-panel p-12 text-center text-slate-500 border-dashed">
            No mock tests logged yet. Take your first test and track it here!
         </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Score 3D Card */}
          <div className="lg:col-span-1 perspective-1000">
            <motion.div 
              whileHover={{ rotateX: 10, rotateY: -10, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="h-full rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-1 shadow-xl shadow-purple-500/20 transform-style-3d relative"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="h-full rounded-xl bg-slate-900/40 backdrop-blur-md p-6 flex flex-col justify-between text-white relative z-10 border border-white/10">
                <div className="flex justify-between items-start">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Trophy className="text-amber-300" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-indigo-200 text-sm font-medium">Latest Score</div>
                    <div className="text-xs text-indigo-300/70">{latestMock?.name}</div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold font-mono tracking-tighter shadow-sm">{latestMock?.totalScore}</span>
                    <span className="text-indigo-200 font-medium text-lg">/ 100</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-emerald-300 bg-emerald-900/30 inline-flex px-3 py-1 rounded-full text-sm border border-emerald-500/30">
                    <TrendingUp size={16} />
                    {latestMock?.percentileEstimate}%ile
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trend Chart */}
          <div className="lg:col-span-2 glass-panel p-6 h-80">
            <h2 className="text-lg font-bold font-heading mb-6 flex items-center gap-2">
              <Target size={20} className="text-blue-500" /> Score Trajectory
            </h2>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalScore" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      {mockTests.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold font-heading mb-4">Test History</h2>
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="p-4 font-medium text-slate-500">Date</th>
                  <th className="p-4 font-medium text-slate-500">Test Name</th>
                  <th className="p-4 font-medium text-slate-500">Score</th>
                  <th className="p-4 font-medium text-slate-500">Percentile</th>
                  <th className="p-4 font-medium text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockTests.map((test) => (
                  <tr key={test.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-sm">{format(parseISO(test.date), 'MMM dd, yyyy')}</td>
                    <td className="p-4 font-medium">{test.name}</td>
                    <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{test.totalScore}</td>
                    <td className="p-4">{test.percentileEstimate}%ile</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteMockTest(test.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors inline-flex"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
