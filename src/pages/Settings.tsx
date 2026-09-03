import { useAppStore } from '../store/useAppStore'
import { Moon, Sun, Bell, Trash2 } from 'lucide-react'

export const Settings = () => {
  const { darkMode, toggleDarkMode, notificationsEnabled, toggleNotifications, userName, setUserName, clearAllData } = useAppStore()

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your study environment.</p>
      </header>
      
      <section className="glass-panel p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Display Name</label>
          <input 
            type="text" 
            value={userName}
            onChange={e => setUserName(e.target.value)}
            className="w-full max-w-md p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 outline-none focus:ring-2 ring-blue-500 transition-all"
          />
        </div>
        
        <div className="flex items-center justify-between max-w-md p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/30 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={20} className="text-blue-500" /> : <Sun size={20} className="text-amber-500" />}
            <div>
              <div className="font-medium">Dark Mode</div>
              <div className="text-sm text-slate-500">Easier on the eyes for night study</div>
            </div>
          </div>
          <button 
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between max-w-md p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/30 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-emerald-500" />
            <div>
              <div className="font-medium">Notifications</div>
              <div className="text-sm text-slate-500">Daily study reminders</div>
            </div>
          </div>
          <button 
            onClick={toggleNotifications}
            className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </section>
      <section className="glass-panel p-6 space-y-6 border-red-500/20">
        <div>
          <h2 className="text-xl font-bold mb-1">Data Management</h2>
          <p className="text-sm text-slate-500 mb-4">Manage your local study data.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              clearAllData()
            }}
            className="flex items-center gap-2 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 px-4 py-2 rounded-xl transition-colors font-semibold text-sm"
          >
            <Trash2 size={16} /> Clear All Data
          </button>
        </div>
      </section>
    </div>
  )
}
