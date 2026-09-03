import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, AlertTriangle, Target, Calendar, BarChart2, Settings } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/log', icon: BookOpen, label: 'Study Log' },
  { path: '/mistakes', icon: AlertTriangle, label: 'Mistakes' },
  { path: '/mocks', icon: Target, label: 'Mocks' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export const NavBar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass border-r border-white/20 dark:border-slate-700/50 p-4 z-50">
        <div className="flex items-center gap-3 mb-10 px-2 pt-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            G
          </div>
          <span className="text-xl font-bold font-heading text-gradient">GATE 2027</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/20 dark:border-slate-700/50 pb-safe z-50">
        <div className="flex justify-around items-center p-2">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-blue-600 dark:text-blue-400 scale-110" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={24} className={clsx("mb-1", isActive && "drop-shadow-md")} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
