import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      
      addSession: (session) => set((state) => ({
        sessions: [{ ...session, id: generateId() }, ...state.sessions]
      })),
      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id)
      })),
      
      addMistake: (mistake) => set((state) => ({
        mistakes: [{ ...mistake, id: generateId() }, ...state.mistakes]
      })),
      deleteMistake: (id) => set((state) => ({
        mistakes: state.mistakes.filter(m => m.id !== id)
      })),
      
      addMockTest: (test) => set((state) => ({
        mockTests: [{ ...test, id: generateId() }, ...state.mockTests]
      })),
      deleteMockTest: (id) => set((state) => ({
        mockTests: state.mockTests.filter(m => m.id !== id)
      })),
      
      clearAllData: () => set({
        sessions: [],
        mistakes: [],
        mockTests: []
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
