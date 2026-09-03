import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Info } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { addDays, format, parseISO, isSameDay } from 'date-fns'

export const Calendar = () => {
  const { sessions, startDate } = useAppStore()
  const [hoveredDay, setHoveredDay] = useState<{ date: Date, totalMinutes: number } | null>(null)

  // Generate 22 weeks * 7 days = 154 days starting from startDate
  const heatmapDays = useMemo(() => {
    const start = parseISO(startDate)
    const days = []
    for (let i = 0; i < 154; i++) {
      const date = addDays(start, i)
      
      // Calculate total study minutes for this day
      const daySessions = sessions.filter(s => isSameDay(parseISO(s.date), date))
      const totalMinutes = daySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0)
      
      days.push({ date, totalMinutes })
    }
    return days
  }, [sessions, startDate])

  // Split into weeks for the grid
  const weeks = useMemo(() => {
    const result = []
    for (let i = 0; i < heatmapDays.length; i += 7) {
      result.push(heatmapDays.slice(i, i + 7))
    }
    return result
  }, [heatmapDays])

  // Get color based on study intensity
  const getColor = (minutes: number) => {
    if (minutes === 0) return 'bg-slate-200/50 dark:bg-slate-800/50'
    if (minutes < 120) return 'bg-emerald-300 dark:bg-emerald-400' // < 2 hours
    if (minutes < 240) return 'bg-emerald-500' // 2-4 hours
    return 'bg-emerald-700 dark:bg-emerald-600' // > 4 hours
  }

  // Format time helper
  const formatMins = (mins: number) => {
    if (mins === 0) return '0h'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  return (
    <div className="space-y-6 pb-24">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Study Consistency Heatmap</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your 22-week journey day by day.</p>
      </header>

      <div className="glass-panel p-4 md:p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-lg md:text-xl font-bold font-heading flex items-center gap-2">
            <CalendarIcon className="text-blue-500" />
            22-Week Progress
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800/60" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <div className="w-3 h-3 rounded-sm bg-emerald-700" />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 hide-scrollbar">
          <div className="inline-flex gap-1 md:gap-1.5 min-w-max">
            {/* Y-axis labels (Days of week) */}
            <div className="flex flex-col gap-1 md:gap-1.5 mt-[22px] md:mt-[26px] mr-2 text-[10px] md:text-xs text-slate-400 font-medium">
              <div className="h-4 md:h-5" /> {/* Sun */}
              <div className="h-4 md:h-5 flex items-center">Mon</div>
              <div className="h-4 md:h-5" /> {/* Tue */}
              <div className="h-4 md:h-5 flex items-center">Wed</div>
              <div className="h-4 md:h-5" /> {/* Thu */}
              <div className="h-4 md:h-5 flex items-center">Fri</div>
              <div className="h-4 md:h-5" /> {/* Sat */}
            </div>

            {/* Grid */}
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1 md:gap-1.5">
                {/* X-axis labels (Week numbers, every 4 weeks) */}
                <div className="h-4 md:h-5 text-[10px] md:text-xs text-slate-400 font-medium text-center mb-1">
                  {wIdx % 4 === 0 ? wIdx + 1 : ''}
                </div>
                
                {week.map((dayData, dIdx) => {
                  if (!dayData) return <div key={dIdx} className="w-4 h-4 md:w-5 md:h-5" />
                  
                  return (
                    <motion.div
                      key={dIdx}
                      onMouseEnter={() => setHoveredDay(dayData)}
                      onMouseLeave={() => setHoveredDay(null)}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                      className={`w-4 h-4 md:w-5 md:h-5 rounded-sm cursor-pointer transition-colors ${getColor(dayData.totalMinutes)}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-xl">
          <Info size={16} />
          <span>Scroll horizontally to view all 22 weeks. Hover over a cell for details.</span>
        </div>
      </section>

      {/* Floating Tooltip */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 glass-card border-emerald-500/30 !p-4 flex items-center gap-4 shadow-2xl z-50 pointer-events-none min-w-[250px] justify-center"
          >
            <div className="text-right">
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {format(hoveredDay.date, 'EEEE, MMM do')}
              </div>
              <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                {formatMins(hoveredDay.totalMinutes)} studied
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
