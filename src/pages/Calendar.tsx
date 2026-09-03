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
    <div className="space-y-6 relative pb-32">
      <header className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Study Consistency Heatmap</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your 22-week journey day by day.</p>
      </header>

      <section className="glass-panel p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 font-bold font-heading text-lg">
            <CalendarIcon className="text-blue-500" />
            22-Week Progress
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-slate-200/50 dark:bg-slate-800/50" />
            <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-400" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <div className="w-3 h-3 rounded-sm bg-emerald-700 dark:bg-emerald-600" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-4 hide-scrollbar">
          <div className="inline-flex flex-col gap-1.5 min-w-max">
            {/* Week Headers */}
            <div className="flex gap-1.5 mb-2 pl-6">
              {weeks.map((_, i) => (
                <div key={i} className="w-4 flex justify-center text-[10px] text-slate-400 font-medium">
                  {i % 4 === 0 ? i + 1 : ''}
                </div>
              ))}
            </div>
            
            {/* Days Grid (Transposed: Rows are Day of Week, Cols are Weeks) */}
            {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => (
              <div key={dayOfWeek} className="flex gap-1.5 items-center">
                {/* Day Labels */}
                <div className="w-5 text-[10px] text-slate-400 font-medium pr-1 text-right">
                  {dayOfWeek === 1 ? 'Mon' : dayOfWeek === 3 ? 'Wed' : dayOfWeek === 5 ? 'Fri' : ''}
                </div>
                
                {weeks.map((week, weekIdx) => {
                  const dayData = week[dayOfWeek]
                  if (!dayData) return <div key={weekIdx} className="w-4 h-4" />
                  
                  return (
                    <motion.div
                      key={weekIdx}
                      onMouseEnter={() => setHoveredDay(dayData)}
                      onMouseLeave={() => setHoveredDay(null)}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                      className={`w-4 h-4 rounded-sm cursor-pointer transition-colors ${getColor(dayData.totalMinutes)}`}
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
