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
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
            className="glass-card flex flex-col md:flex-row items-start md:items-center gap-3 p-3 md:p-4"
          >
            <div className={`p-2 md:p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
              <stat.icon size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.title}</div>
              <div className="text-lg md:text-xl font-bold">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </section>
      
      {/* Daily Study Plan Timeline */}
      <section className="glass-panel p-4 md:p-6 mt-8">
        <h2 className="text-lg md:text-xl font-bold font-heading mb-6 flex items-center gap-2">
          <Clock size={20} className="text-blue-500" />
          Today's Study Plan
        </h2>
        
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
          {(() => {
            const currentWeekTopics = syllabusPlan[activeWeekIndex]?.topics || '';
            const subtopics = currentWeekTopics.split(/[.,]/).map(s => s.trim()).filter(s => s.length > 4);
            const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday...
            
            // Generate schedule for today
            let todaysTasks: string[] = [];
            let isWeekendPlan = isWeekend(today);

            if (isWeekendPlan) {
              todaysTasks = ['Full-length or Subject-wise Mock Test', 'Deep Review of Error Log', 'Revise weak concepts from Mon-Fri'];
            } else {
              // Pick 1-2 topics based on day of week to spread them out
              const startIndex = (dayOfWeek - 1) % Math.max(1, subtopics.length);
              todaysTasks = [subtopics[startIndex]];
              if (subtopics.length > 1 && dayOfWeek % 2 === 0) {
                 todaysTasks.push(subtopics[(startIndex + 1) % subtopics.length]);
              }
            }

            return todaysTasks.map((task, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base mb-2">{task || 'General Revision'}</h3>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a 
                      href={`https://www.youtube.com/results?search_query=GATE+Wallah+CSE+${encodeURIComponent(task || 'revision')}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-red-500/20 transition-colors"
                    >
                      ▶ Watch Lecture
                    </a>
                    <a 
                      href={`https://gateoverflow.in/`}
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1.5 rounded-md hover:bg-blue-500/20 transition-colors"
                    >
                      📝 Solve PYQs
                    </a>
                  </div>
                </div>
              </motion.div>
            ))
          })()}
        </div>
      </section>
    </div>
  )
}
