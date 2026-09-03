import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { Clock, BookOpen, AlertCircle, TrendingUp, PlayCircle, FileText, Calendar as CalendarIcon, CheckCircle2, Flame } from 'lucide-react'
import { syllabusPlan } from '../data/syllabus'
import { gatePlan } from '../data/gate2027_plan'
import { differenceInWeeks, differenceInDays, parseISO, isWeekend, isSameDay, subDays, format } from 'date-fns'
import { generateTopicPYQs } from '../data/pyqGenerator'
import { useNavigate } from 'react-router-dom'

export const Dashboard = () => {
  const { userName, startDate, targetHoursWeekday, targetHoursWeekend, sessions, mistakes, streakCount } = useAppStore()
  const navigate = useNavigate()

  const launchPYQTest = (topic: string) => {
    const questions = generateTopicPYQs(topic, 15)
    navigate('/mocks/take', { 
      state: { 
        questions, 
        duration: 2700, // 45 mins
        title: `Topic Test: ${topic}` 
      } 
    })
  }

  // Calculate current week and day based on start date
  const today = new Date()
  const daysDiff = Math.max(0, differenceInDays(today, parseISO(startDate)))
  const currentDayIndex = Math.min(daysDiff, gatePlan.length - 1)
  const todayPlan = gatePlan[currentDayIndex]
  
  const weeksDiff = differenceInWeeks(today, parseISO(startDate))
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

  // 7-day Heatmap
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i))

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Welcome back, {userName}! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Let's crush today's study goals.</p>
        </div>
        
        {/* Streak and Heatmap */}
        <div className="flex flex-col items-end gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-bold shadow-sm">
            <Flame size={18} className={streakCount > 0 ? "text-orange-500 fill-orange-500 animate-pulse" : "text-slate-400"} />
            {streakCount} Day Streak
          </div>
          <div className="flex gap-1.5">
            {last7Days.map((date, i) => {
              const hasStudied = sessions.some(s => isSameDay(parseISO(s.date), date))
              const isToday = isSameDay(date, today)
              return (
                <div 
                  key={i} 
                  title={format(date, 'MMM d')}
                  className={`w-5 h-5 rounded-sm ${hasStudied ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-200 dark:bg-slate-800'} ${isToday ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-950' : ''} transition-colors`}
                />
              )
            })}
          </div>
        </div>
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
      
      {/* Innovative Daily Study Route Timeline */}
      <section className="mt-12 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none rounded-t-3xl" />
        
        <div className="glass-panel p-6 md:p-8 relative overflow-hidden border-t-4 border-t-blue-500">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-bold mb-3">
                <CalendarIcon size={16} /> Day {todayPlan.day} of 154
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading">Today's Study Route</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Follow this exact path to complete today's targets.</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Week {todayPlan.week}</div>
              <div className="font-medium text-slate-800 dark:text-slate-200">{todayPlan.title.split(' — ')[1] || todayPlan.title.split(': ')[1] || 'Weekly Target'}</div>
            </div>
          </div>
          
          <div className="relative z-10 space-y-0">
            {/* Vertical Line */}
            <div className="absolute top-4 bottom-4 left-[27px] md:left-1/2 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full opacity-20 hidden md:block"></div>
            <div className="absolute top-4 bottom-4 left-[27px] w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full opacity-20 md:hidden"></div>
            
            {todayPlan.topics.map((task, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15, type: 'spring', stiffness: 100 }}
                key={idx} 
                className="relative flex items-center justify-start md:justify-between md:odd:flex-row-reverse group py-6"
              >
                {/* Timeline Node */}
                <div className="absolute left-[16px] md:left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-4 border-blue-500 z-10 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                
                {/* Content Card */}
                <div className="ml-16 md:ml-0 w-full md:w-[calc(50%-3rem)]">
                  <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group-hover:-translate-y-1 duration-300">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">
                      <CheckCircle2 size={14} /> Topic {idx + 1}
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">{task}</h3>
                    
                    <div className="flex flex-wrap gap-3">
                      <a 
                        href={`https://www.youtube.com/results?search_query=GATE+Wallah+CSE+${encodeURIComponent(task)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-2.5 rounded-xl transition-colors"
                      >
                        <PlayCircle size={18} /> Watch Lecture
                      </a>
                      <button 
                        onClick={() => launchPYQTest(task)}
                        className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                      >
                        <FileText size={18} /> Solve PYQs
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Daily Practice & Revision Node */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: todayPlan.topics.length * 0.15, type: 'spring' }}
              className="relative flex items-center justify-start md:justify-between md:odd:flex-row-reverse group py-6"
            >
              <div className="absolute left-[16px] md:left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-4 border-emerald-500 z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
              
              <div className="ml-16 md:ml-0 w-full md:w-[calc(50%-3rem)]">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-xl text-white transform transition-transform hover:-translate-y-1 duration-300">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-100 uppercase tracking-wider mb-2">
                    <TrendingUp size={14} /> Consolidation
                  </div>
                  <h3 className="font-bold text-xl mb-4">Practice & Revision</h3>
                  <ul className="space-y-2 text-sm font-medium text-emerald-50">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 opacity-70">•</span> {todayPlan.practice}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 opacity-70">•</span> {todayPlan.revision}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 opacity-70">•</span> {todayPlan.aptitude}
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
