import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MockQuestion } from '../data/sampleMock'

export type SessionCategory = 'theory' | 'practice' | 'revision'
export type SubjectPhase = 'Math' | 'Programming' | 'OS' | 'DBMS' | 'Networks' | 'TOC' | 'Compiler' | 'COA' | 'DigitalLogic' | 'Aptitude'

export interface StudySession {
  id: string
  date: string // ISO string
  topic: string
  durationMinutes: number
  category: SessionCategory
  phase: SubjectPhase
}

export interface Mistake {
  id: string
  date: string
  question: string
  wrongAnswer: string
  correctAnswer: string
  reason: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  phase: SubjectPhase
}

export interface MockTest {
  id: string
  date: string
  name: string
  totalScore: number
  percentileEstimate: number
  sectionScores: Record<SubjectPhase, number>
}

export interface ActiveTest {
  questions: MockQuestion[]
  currentIndex: number
  timeLeft: number
  answers: Record<string, string | string[]>
  markedForReview: string[] // Store as array in Zustand, convert to Set in component
  visited: string[]
  title: string
}

interface AppState {
  // Settings
  userName: string
  startDate: string // ISO string
  targetHoursWeekday: number
  targetHoursWeekend: number
  darkMode: boolean
  notificationsEnabled: boolean
  
  // Data
  sessions: StudySession[]
  mistakes: Mistake[]
  mockTests: MockTest[]
  activeTest: ActiveTest | null
  
  // Gamification
  streakCount: number
  lastStudyDate: string | null
  
  // Actions
  setUserName: (name: string) => void
  setStartDate: (date: string) => void
  setTargetHours: (weekday: number, weekend: number) => void
  toggleDarkMode: () => void
  toggleNotifications: () => void
  
  addSession: (session: Omit<StudySession, 'id'>) => void
  deleteSession: (id: string) => void
  
  addMistake: (mistake: Omit<Mistake, 'id'>) => void
  deleteMistake: (id: string) => void
  
  addMockTest: (test: Omit<MockTest, 'id'>) => void
  deleteMockTest: (id: string) => void
  
  saveActiveTest: (test: ActiveTest) => void
  clearActiveTest: () => void

  updateStreak: (dateStr: string) => void
  
  clearAllData: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial Settings
      userName: 'GATE Aspirant',
      startDate: '2026-09-04',
      targetHoursWeekday: 4,
      targetHoursWeekend: 6,
      darkMode: false,
      notificationsEnabled: false,
      
      // Initial Data
      sessions: [],
      mistakes: [],
      mockTests: [],
      activeTest: null,
      
      // Gamification
      streakCount: 0,
      lastStudyDate: null,
      
      // Actions
      setUserName: (name) => set({ userName: name }),
      setStartDate: (date) => set({ startDate: date }),
      setTargetHours: (weekday, weekend) => set({ targetHoursWeekday: weekday, targetHoursWeekend: weekend }),
      toggleDarkMode: () => set((state) => {
        const newMode = !state.darkMode
        if (newMode) {
          document.body.classList.add('dark')
        } else {
          document.body.classList.remove('dark')
        }
        return { darkMode: newMode }
      }),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      
      addSession: (session) => set((state) => {
        // Streak logic
        const dateStr = session.date.split('T')[0] // or similar
        let newStreak = state.streakCount
        let newLastDate = state.lastStudyDate

        if (!state.lastStudyDate) {
          newStreak = 1
          newLastDate = dateStr
        } else if (state.lastStudyDate !== dateStr) {
          const lastDate = new Date(state.lastStudyDate)
          const todayDate = new Date(dateStr)
          const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays === 1) {
            newStreak = state.streakCount + 1
            newLastDate = dateStr
          } else if (diffDays > 1) {
            newStreak = 1
            newLastDate = dateStr
          }
        }

        return {
          sessions: [{ ...session, id: generateId() }, ...state.sessions],
          streakCount: newStreak,
          lastStudyDate: newLastDate
        }
      }),
      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id)
      })),
      
      addMistake: (mistake) => set((state) => ({
        mistakes: [{ ...mistake, id: generateId() }, ...state.mistakes]
      })),
      deleteMistake: (id) => set((state) => ({
        mistakes: state.mistakes.filter(m => m.id !== id)
      })),
      
      addMockTest: (test) => set((state) => {
        // Streak logic
        const dateStr = test.date.split('T')[0]
        let newStreak = state.streakCount
        let newLastDate = state.lastStudyDate

        if (!state.lastStudyDate) {
          newStreak = 1
          newLastDate = dateStr
        } else if (state.lastStudyDate !== dateStr) {
          const lastDate = new Date(state.lastStudyDate)
          const todayDate = new Date(dateStr)
          const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays === 1) {
            newStreak = state.streakCount + 1
            newLastDate = dateStr
          } else if (diffDays > 1) {
            newStreak = 1
            newLastDate = dateStr
          }
        }

        return {
          mockTests: [{ ...test, id: generateId() }, ...state.mockTests],
          streakCount: newStreak,
          lastStudyDate: newLastDate
        }
      }),
      deleteMockTest: (id) => set((state) => ({
        mockTests: state.mockTests.filter(m => m.id !== id)
      })),
      
      saveActiveTest: (test) => set({ activeTest: test }),
      clearActiveTest: () => set({ activeTest: null }),

      updateStreak: (dateStr) => set((state) => {
        if (!state.lastStudyDate) {
          return { streakCount: 1, lastStudyDate: dateStr }
        }
        if (state.lastStudyDate === dateStr) {
          return {} // Already updated today
        }
        
        const lastDate = new Date(state.lastStudyDate)
        const todayDate = new Date(dateStr)
        const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          return { streakCount: state.streakCount + 1, lastStudyDate: dateStr }
        } else if (diffDays > 1) {
          return { streakCount: 1, lastStudyDate: dateStr } // Streak broken
        }
        return {}
      }),
      
      clearAllData: () => set({
        sessions: [],
        mistakes: [],
        mockTests: [],
        activeTest: null,
        streakCount: 0,
        lastStudyDate: null
      })
    }),
    {
      name: 'gate-tracker-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.body.classList.add('dark')
        }
      }
    }
  )
)
