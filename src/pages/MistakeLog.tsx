import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, AlertTriangle, Lightbulb, BookX, CheckCircle2 } from 'lucide-react'
import { useAppStore, type SubjectPhase } from '../store/useAppStore'
import { format } from 'date-fns'

const phases: SubjectPhase[] = ['Math', 'Programming', 'OS', 'DBMS', 'Networks', 'TOC', 'Compiler', 'COA', 'DigitalLogic', 'Aptitude']

export const MistakeLog = () => {
  const { mistakes, addMistake, deleteMistake } = useAppStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  // Form State
  const [topic, setTopic] = useState('')
  const [phase, setPhase] = useState<SubjectPhase>('Programming')
  const [question, setQuestion] = useState('')
  const [wrongAnswer, setWrongAnswer] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [reason, setReason] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  const handleSave = () => {
    if (!topic || !question || !correctAnswer || !reason) {
      return alert('Please fill in the required fields (Topic, Question, Correct Answer, Reason).')
    }
    
    addMistake({
      date: new Date().toISOString(),
      topic,
      phase,
      question,
      wrongAnswer,
      correctAnswer,
      reason,
      difficulty
    })
    
    setTopic('')
    setQuestion('')
    setWrongAnswer('')
    setCorrectAnswer('')
    setReason('')
    setDifficulty('medium')
    setIsFormOpen(false)
  }

  return (
    <div className="space-y-6 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle size={24} className="md:w-7 md:h-7" />
            Mistake Log
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Log errors to never repeat them. Analysis is key to rank improvement.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-bold transition-all shadow-lg shadow-rose-500/30 flex items-center gap-2 justify-center"
        >
          {isFormOpen ? 'Cancel' : <><Plus size={20} /> Add Mistake</>}
        </button>
      </header>

      {/* Add Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-4 md:p-6 border border-rose-500/20 mb-8">
              <h2 className="text-xl font-bold font-heading mb-6">Log a New Error</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject Phase</label>
                    <select 
                      value={phase}
                      onChange={(e) => setPhase(e.target.value as SubjectPhase)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 outline-none"
                    >
                      {phases.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Topic *</label>
                    <input 
                      type="text" 
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. Memory Management"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 ring-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <select 
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 outline-none capitalize"
                    >
                      <option value="easy">Easy (Silly Mistake)</option>
                      <option value="medium">Medium (Concept Gap)</option>
                      <option value="hard">Hard (Completely Lost)</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2"><Lightbulb size={16}/> Question context *</label>
                    <textarea 
                      value={question}
                      onChange={e => setQuestion(e.target.value)}
                      placeholder="Brief description of the question"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 ring-rose-500 outline-none resize-none h-24"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-rose-500 flex items-center gap-2"><BookX size={16}/> What you did wrong</label>
                    <input 
                      type="text" 
                      value={wrongAnswer}
                      onChange={e => setWrongAnswer(e.target.value)}
                      placeholder="Your wrong approach"
                      className="w-full p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 focus:ring-2 ring-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-emerald-500 flex items-center gap-2"><CheckCircle2 size={16}/> Correct Approach *</label>
                    <input 
                      type="text" 
                      value={correctAnswer}
                      onChange={e => setCorrectAnswer(e.target.value)}
                      placeholder="The right way to solve it"
                      className="w-full p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 focus:ring-2 ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Root Cause / Reason *</label>
                  <textarea 
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Why did you make this mistake? E.g., Didn't read the 'NOT' in the question, or forgot formula."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 ring-rose-500 outline-none resize-none h-24"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                >
                  Save Mistake
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mistakes List */}
      <div className="space-y-4">
        {mistakes.length === 0 ? (
          <div className="text-center p-12 text-slate-500 glass-panel border-dashed">
            No mistakes logged yet. Every mistake is a learning opportunity!
          </div>
        ) : (
          mistakes.map((mistake, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={mistake.id} 
              className="glass-card flex flex-col md:flex-row gap-6 !p-4 md:!p-6 border-l-4 border-l-rose-500 relative group overflow-hidden"
            >
              {/* Difficulty Banner */}
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl ${
                mistake.difficulty === 'hard' ? 'bg-rose-500 text-white' :
                mistake.difficulty === 'medium' ? 'bg-amber-500 text-white' :
                'bg-emerald-500 text-white'
              }`}>
                {mistake.difficulty.toUpperCase()}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-bold text-xl">{mistake.topic}</h3>
                  <span className="text-xs font-medium bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">
                    {mistake.phase}
                  </span>
                  <span className="text-xs text-slate-400">
                    {format(new Date(mistake.date), 'MMM d, yyyy')}
                  </span>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Question Context:</span>
                  {mistake.question}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mistake.wrongAnswer && (
                    <div className="text-sm bg-rose-50 dark:bg-rose-900/10 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
                      <span className="font-bold text-rose-600 block mb-1">What I did:</span>
                      {mistake.wrongAnswer}
                    </div>
                  )}
                  <div className="text-sm bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    <span className="font-bold text-emerald-600 block mb-1">Correct Approach:</span>
                    {mistake.correctAnswer}
                  </div>
                </div>
                
                <div className="text-sm italic text-slate-600 dark:text-slate-400 border-l-2 border-slate-300 pl-3 mt-2">
                  <span className="font-bold not-italic">Root Cause: </span>
                  {mistake.reason}
                </div>
              </div>

              <div className="flex items-start">
                <button 
                  onClick={() => deleteMistake(mistake.id)}
                  className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Mistake"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
