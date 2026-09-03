import { useAppStore } from '../store/useAppStore'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { format, parseISO, subDays, isSameDay } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4', '#84cc16']

export const Analytics = () => {
  const { sessions, mockTests } = useAppStore()
  const navigate = useNavigate()

  // Prepare data for Subject Phase Distribution
  const phaseDataMap = new Map<string, number>()
  sessions.forEach(s => {
    const current = phaseDataMap.get(s.phase) || 0
    phaseDataMap.set(s.phase, current + s.durationMinutes)
  })
  
  const phaseData = Array.from(phaseDataMap.entries()).map(([name, value]) => ({
    name,
    value: Math.round(value / 60) // convert to hours for chart
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

  // Prepare data for Last 7 Days Study Time
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i))
  const dailyData = last7Days.map(date => {
    const daySessions = sessions.filter(s => isSameDay(parseISO(s.date), date))
    const totalMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0)
    return {
      day: format(date, 'EEE'),
      hours: Number((totalMins / 60).toFixed(1))
    }
  })

  // Prepare data for Subject Mastery (Radar Chart)
  const subjectScores = new Map<string, number>()
  mockTests.forEach(test => {
    Object.entries(test.sectionScores).forEach(([subject, score]) => {
      const current = subjectScores.get(subject) || 0
      subjectScores.set(subject, current + score)
    })
  })
  const radarData = Array.from(subjectScores.entries()).map(([subject, score]) => ({
    subject,
    score: Math.max(0, Number(score.toFixed(1))) // Don't show negative radii
  }))

  const totalHoursEver = Math.round(sessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60)

  return (
    <div className="space-y-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-heading">Analytics & Insights</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Deep dive into your study metrics.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Hours Metric */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center lg:col-span-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
          <div className="text-sm font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase mb-2">Total Study Time</div>
          <div className="text-6xl font-bold font-heading text-slate-800 dark:text-slate-100">{totalHoursEver} <span className="text-3xl text-slate-400">hrs</span></div>
        </div>

        {/* Bar Chart: Last 7 Days */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold font-heading mb-6 text-slate-700 dark:text-slate-200">Past 7 Days (Hours)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.2} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip 
                  cursor={{fill: '#334155', opacity: 0.1}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Subject Distribution */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold font-heading mb-6 text-slate-700 dark:text-slate-200">Time by Subject (Hours)</h2>
          <div className="h-64 flex items-center justify-center">
            {phaseData.length === 0 ? (
              <div className="text-center">
                <div className="text-slate-400 mb-4">No data to display yet.</div>
                <button onClick={() => navigate('/log')} className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-4 py-2 rounded-lg transition-colors font-semibold">
                  Log a Study Session
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={phaseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {phaseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {phaseData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                {entry.name} ({entry.value}h)
              </div>
            ))}
          </div>
        </div>
        
        {/* Radar Chart: Subject Mastery from Mocks */}
        <div className="glass-panel p-6 lg:col-span-2">
          <h2 className="text-xl font-bold font-heading mb-6 text-slate-700 dark:text-slate-200">Subject Mastery (Based on Test Scores)</h2>
          <div className="h-80 flex items-center justify-center">
            {radarData.length === 0 ? (
              <div className="text-center">
                <div className="text-slate-400 mb-4">Take a mock test to see your strong & weak subjects.</div>
                <button onClick={() => navigate('/mocks')} className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-600 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-400 px-4 py-2 rounded-lg transition-colors font-semibold">
                  Take a Mock Test
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#cbd5e1" opacity={0.3} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
