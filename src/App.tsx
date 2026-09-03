import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { Dashboard } from './pages/Dashboard'
import { StudyLog } from './pages/StudyLog'
import { MistakeLog } from './pages/MistakeLog'
import { MockTracker } from './pages/MockTracker'
import { Calendar } from './pages/Calendar'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <NavBar />
        <main className="md:ml-64 p-4 md:p-8 pb-24 md:pb-8 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/log" element={<StudyLog />} />
              <Route path="/mistakes" element={<MistakeLog />} />
              <Route path="/mocks" element={<MockTracker />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
