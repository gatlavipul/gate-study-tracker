import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { Clock, BookOpen, AlertCircle, TrendingUp } from 'lucide-react'
import { syllabusPlan } from '../data/syllabus'
import { differenceInWeeks, parseISO, isWeekend, isSameDay } from 'date-fns'

export const Dashboard = () => {
  const { userName, startDate, targetHoursWeekday, targetHoursWeekend, sessions, mistakes } = useAppStore()
  
  // Calculate current week based on start date
  const today = new Date()
  const weeksDiff = differenceInWeeks(today, parseISO(startDate))
  // Week 1 is index 0. If before start date, it's week 1.
  const activeWeekIndex = Math.max(0, Math.min(21, weeksDiff))

  // Daily target logic
  const dailyTargetHours = isWeekend(today) ? targetHoursWeekend : targetHoursWeekday
  
  // Calculate today's completion
  const todaysSessions = sessions.filter(s => isSameDay(parseISO(s.date), today))
  const completedMinutes = todaysSessions.reduce((acc, s) => acc + s.durationMinutes, 0)
  
  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m.toString().padStart(2, '0')}m`
  }

  // Calculate unique topics studied today
  const uniqueTopicsToday = new Set(todaysSessions.map(s => s.topic)).size

  // Pending mistakes to review
  const pendingMistakesCount = mistakes.length // Placeholder logic for MVP

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-heading">Welcome back, {userName}! 👋</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Let's crush today's study goals.</p>
      </header>

      {/* 22-Week Master Plan Timeline */}
      <section>
        <h2 className="text-xl font-bold font-heading mb-4">22-Week Master Plan</h2>
        <div className="flex overflow-x-auto pb-6 pt-2 snap-x snap-mandatory gap-4 hide-scrollbar">
          {syllabusPlan.map((week, index) => {
            const isActive = index === activeWeekIndex;
            const isPast = index < activeWeekIndex;
            return (
            <motion.div
              key={week.weekNum}
              whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
              className={`snap-center shrink-0 w-64 h-32 rounded-2xl p-4 flex flex-col justify-between cursor-pointer perspective-1000 transition-shadow ${
                isActive 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-300 ring-offset-2 dark:ring-offset-slate-900'
                  : isPast 
                    ? 'glass opacity-75 border-emerald-500/30'
                    : 'glass text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="font-bold whitespace-nowrap">Week {week.weekNum}</div>
                <div className="text-xs font-medium bg-black/10 dark:bg-white/10 px-2 py-1 rounded-md">{week.dates}</div>
              </div>
              <div className={`text-sm line-clamp-3 ${isActive ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>
                {week.topics}
              </div>
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse mt-auto absolute bottom-4 right-4 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </motion.div>
            )
          })}
        </div>
      </section>

      {/* Today's Status Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Today's Target", value: `${dailyTargetHours}h 00m`, icon: Clock, color: "text-blue-500" },
          { title: "Completed", value: formatMins(completedMinutes), icon: TrendingUp, color: "text-emerald-500" },
          { title: "Topics", value: `${uniqueTopicsToday} Tasks`, icon: BookOpen, color: "text-indigo-500" },
          { title: "Pending Review", value: `${pendingMistakesCount} Mistakes`, icon: AlertCircle, color: "text-rose-500" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.title}</div>
              <div className="text-xl font-bold">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </section>
      
      {/* Week at a glance placeholder */}
      <section className="glass-panel p-6 mt-8">
        <h2 className="text-xl font-bold font-heading mb-4">Week at a Glance</h2>
        <div className="h-48 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          Progress Chart Placeholder
        </div>
      </section>
    </div>
  )
}
