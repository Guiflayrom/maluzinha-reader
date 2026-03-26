export interface Book {
  id: string
  title: string
  author: string
  totalPages: number
  pagesRead: number
  pagesPerBubble: number
  discipline?: string
  isAcademic: boolean
  coverColor: string
  depth: 'none' | 'shallow' | 'medium' | 'deep'
  classWatched: boolean
  questions: Question[]
  notes: Note[]
  intertextualLinks: IntertextualLink[]
  readingSessions: ReadingSession[]
  createdAt: string
}

export interface Question {
  id: string
  bookId: string
  text: string
  context: string
  page?: number
  resolved: boolean
  createdAt: string
}

export interface Note {
  id: string
  bookId: string
  page?: number
  content: string
  originalContent?: string
  type: 'fichamento' | 'anotacao' | 'citacao'
  tags: string[]
  audioUrl?: string // NEW: audio recording support
  audioDuration?: number // duration in seconds
  createdAt: string
  updatedAt: string
  versions: NoteVersion[]
}

export interface NoteVersion {
  id: string
  content: string
  createdAt: string
}

export interface IntertextualLink {
  id: string
  sourceBookId: string
  targetBookId?: string
  targetTitle: string
  description: string
  page?: number
}

export interface ReadingSession {
  id: string
  bookId: string
  date: string
  pagesRead: number
  timeSlot: string
  duration: number // minutes
  energyLevel?: 'low' | 'medium' | 'high' | 'peak' // energia no momento da leitura
}

// Registro automatico de energia mental
export interface EnergyLog {
  id: string
  timestamp: string
  energy: 'low' | 'medium' | 'high' | 'peak'
  pagesReadInSession?: number // paginas lidas desde ultimo registro
}

export interface Discipline {
  id: string
  name: string
  professor: string
  color: string
  bookIds: string[]
  syllabus?: string
  summary?: string
  supplementaryTexts: string[]
}

export interface WeeklySchedule {
  id: string
  weekStart: string
  entries: ScheduleEntry[]
}

export interface ScheduleEntry {
  id: string
  bookId: string
  scheduledDate: string
  timeSlot: string
  pagesToRead: number
}

export interface UserStats {
  currentStreak: number
  longestStreak: number
  totalPagesRead: number
  totalBooksCompleted: number
  mentalEnergy: 'low' | 'medium' | 'high' | 'peak'
  lastReadDate: string
  weeklyGoal: number
  weeklyPagesRead: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  category: 'reading' | 'streak' | 'energy' | 'variety' | 'notes' | 'disciplines' | 'special'
  icon: string
  unlocked: boolean
  unlockedDate?: string
  progress?: number
  progressMax?: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

// Main navigation tabs
export type MainTab = 'dashboard' | 'bookshelf' | 'calendar' | 'notes' | 'disciplines' | 'achievements'

// All possible screens including CRUD sub-screens
export type AppScreen = 
  | { type: 'main'; tab: MainTab }
  | { type: 'book-detail'; bookId: string }
  | { type: 'book-form'; bookId?: string } // undefined = new
  | { type: 'note-detail'; noteId: string; bookId: string }
  | { type: 'note-form'; bookId: string; noteId?: string }
  | { type: 'question-form'; bookId: string; questionId?: string }
  | { type: 'link-form'; bookId: string; linkId?: string }
  | { type: 'schedule-form'; entryId?: string }
  | { type: 'discipline-detail'; disciplineId: string }
  | { type: 'discipline-form'; disciplineId?: string }
  | { type: 'achievement-detail'; achievementId: string }

// For backwards compatibility
export type TabKey = MainTab

export interface AchievementMetrics {
  energyChangeCount: number
  peakDaysCount: number
  hasHadLowEnergy: boolean
}

export interface AppSettings {
  readingMinutesPerPage: number
}

export interface AppData {
  books: Book[]
  disciplines: Discipline[]
  stats: UserStats
  settings: AppSettings
  schedule: WeeklySchedule
  achievements: Achievement[]
  energyLogs: EnergyLog[]
  greetingClicks: number
}

export interface StoredAppState extends AppData {
  pagesAtLastEnergyChange: number
  achievementMetrics: AchievementMetrics
}

export type AppMutation =
  | { type: 'save-book'; book: Book }
  | { type: 'delete-book'; bookId: string }
  | { type: 'toggle-book-progress'; bookId: string; bubbleIndex: number }
  | { type: 'save-note'; bookId: string; note: Note }
  | { type: 'delete-note'; bookId: string; noteId: string }
  | { type: 'save-question'; bookId: string; question: Question }
  | { type: 'delete-question'; bookId: string; questionId: string }
  | { type: 'toggle-question-resolved'; bookId: string; questionId: string }
  | { type: 'save-link'; bookId: string; link: IntertextualLink }
  | { type: 'delete-link'; bookId: string; linkId: string }
  | { type: 'save-schedule-entry'; entry: ScheduleEntry }
  | { type: 'delete-schedule-entry'; entryId: string }
  | { type: 'save-discipline'; discipline: Discipline }
  | { type: 'delete-discipline'; disciplineId: string }
  | { type: 'update-weekly-goal'; weeklyGoal: number }
  | { type: 'update-reading-preferences'; weeklyGoal: number; readingMinutesPerPage: number }
  | { type: 'set-energy'; energy: UserStats['mentalEnergy'] }
  | { type: 'register-greeting-click' }
