import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import {
  ACHIEVEMENT_DEFINITIONS,
  createEmptySchedule,
  createEmptySettings,
  createEmptyStats,
  PERSONAL_DISCIPLINE_ID,
} from '@/lib/app-config'
import { checkAchievements } from '@/lib/achievements-checker'
import type {
  AppData,
  AppMutation,
  Book,
  Discipline,
  EnergyLog,
  ScheduleEntry,
  StoredAppState,
  UserStats,
} from '@/lib/types'

const DATA_DIR = process.env.SQLITE_DATA_DIR
  ? path.resolve(process.env.SQLITE_DATA_DIR)
  : path.join(process.cwd(), 'data')
const DB_PATH = process.env.SQLITE_DB_PATH ? path.resolve(process.env.SQLITE_DB_PATH) : path.join(DATA_DIR, 'lektor.sqlite')
const STATE_ID = 'singleton'

type SqliteDatabase = Awaited<ReturnType<typeof open>>

let dbPromise: Promise<SqliteDatabase> | undefined

function deepClone<T>(value: T): T {
  return structuredClone(value)
}

function getDefaultPersonalDiscipline() {
  return {
    id: PERSONAL_DISCIPLINE_ID,
    name: 'Leituras Pessoais',
    professor: '',
    color: '#DEB069',
    bookIds: [] as string[],
    syllabus: '',
    summary: '',
    supplementaryTexts: [] as string[],
  }
}

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

function formatDateString(date: Date) {
  return date.toISOString().split('T')[0]
}

function getNowTimeSlot() {
  const hour = new Date().getHours()

  if (hour < 12) return 'manha'
  if (hour < 18) return 'tarde'

  return 'noite'
}

function getYesterdayString() {
  const now = new Date()
  now.setDate(now.getDate() - 1)
  return now.toISOString().split('T')[0]
}

function getDateFromWeekStart(weekStart: string, dayOfWeek: number) {
  const baseDate = new Date(`${weekStart}T00:00:00`)
  baseDate.setDate(baseDate.getDate() + dayOfWeek)
  return formatDateString(baseDate)
}

function getCurrentWeekStart() {
  const date = new Date()
  date.setDate(date.getDate() - date.getDay())
  return formatDateString(date)
}

function syncCurrentStreak(stats: StoredAppState['stats']) {
  const today = getTodayString()
  const yesterday = getYesterdayString()

  if (!stats.lastReadDate) {
    stats.currentStreak = 0
    return
  }

  if (stats.lastReadDate !== today && stats.lastReadDate !== yesterday) {
    stats.currentStreak = 0
  }

  stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak)
}

function ensureAchievements(state: StoredAppState) {
  const currentById = new Map(state.achievements.map((achievement) => [achievement.id, achievement]))

  state.achievements = ACHIEVEMENT_DEFINITIONS.map((achievement) => ({
    ...achievement,
    ...currentById.get(achievement.id),
  }))
}

function syncAchievements(state: StoredAppState) {
  ensureAchievements(state)

  state.achievements = checkAchievements(state.achievements, {
    books: state.books,
    disciplines: state.disciplines,
    stats: state.stats,
    energyChangeCount: state.achievementMetrics.energyChangeCount,
    peakDaysCount: state.achievementMetrics.peakDaysCount,
    hasHadLowEnergy: state.achievementMetrics.hasHadLowEnergy,
    hasRecoveredFromLow: state.achievementMetrics.hasHadLowEnergy && state.stats.mentalEnergy === 'peak',
  })
}

function clampStats(stats: StoredAppState['stats']) {
  stats.totalPagesRead = Math.max(0, stats.totalPagesRead)
  stats.totalBooksCompleted = Math.max(0, stats.totalBooksCompleted)
  stats.weeklyGoal = Math.max(1, stats.weeklyGoal)
  stats.weeklyPagesRead = Math.max(0, stats.weeklyPagesRead)
}

function clampSettings(settings: StoredAppState['settings']) {
  settings.readingMinutesPerPage = Math.max(0.1, settings.readingMinutesPerPage)
}

function dedupeBookIds(bookIds: string[]) {
  return [...new Set(bookIds)]
}

function updateBookDisciplineMembership(state: StoredAppState, book: Book) {
  const personalDisciplineId = state.disciplines.find((discipline) => !discipline.professor)?.id

  state.disciplines = state.disciplines.map((discipline) => {
    let nextBookIds = discipline.bookIds.filter((bookId) => bookId !== book.id)

    if (book.isAcademic && book.discipline && discipline.id === book.discipline) {
      nextBookIds = [...nextBookIds, book.id]
    }

    if (!book.isAcademic && personalDisciplineId && discipline.id === personalDisciplineId) {
      nextBookIds = [...nextBookIds, book.id]
    }

    return {
      ...discipline,
      bookIds: dedupeBookIds(nextBookIds),
    }
  })
}

function ensurePersonalDiscipline(state: StoredAppState) {
  const existingPersonalDiscipline = state.disciplines.find((discipline) => !discipline.professor)

  if (existingPersonalDiscipline) {
    return existingPersonalDiscipline.id
  }

  const discipline = getDefaultPersonalDiscipline()
  state.disciplines.push(discipline)

  return discipline.id
}

function normalizePersonalDiscipline(state: StoredAppState) {
  const hasPersonalBooks = state.books.some((book) => !book.isAcademic)

  if (!hasPersonalBooks) {
    state.disciplines = state.disciplines.filter((discipline) => {
      const isDefaultPersonal =
        discipline.id === PERSONAL_DISCIPLINE_ID &&
        !discipline.professor &&
        discipline.bookIds.length === 0 &&
        !discipline.syllabus &&
        !discipline.summary &&
        discipline.supplementaryTexts.length === 0

      return !isDefaultPersonal
    })

    return
  }

  ensurePersonalDiscipline(state)
}

function syncState(state: StoredAppState) {
  state.disciplines = state.disciplines.map((discipline) => ({
    ...discipline,
    bookIds: dedupeBookIds(discipline.bookIds.filter((bookId) => state.books.some((book) => book.id === bookId))),
  }))

  state.books = state.books.map((book) => {
    if (!book.isAcademic) {
      return {
        ...book,
        discipline: undefined,
      }
    }

    const disciplineExists = book.discipline
      ? state.disciplines.some((discipline) => discipline.id === book.discipline)
      : false

    return {
      ...book,
      discipline: disciplineExists ? book.discipline : undefined,
    }
  })

  normalizePersonalDiscipline(state)
  state.books.forEach((book) => {
    updateBookDisciplineMembership(state, book)
  })

  clampStats(state.stats)
  clampSettings(state.settings)
  syncCurrentStreak(state.stats)
  state.stats.totalBooksCompleted = state.books.filter((book) => book.pagesRead >= book.totalPages).length
  syncAchievements(state)
}

function createSeedState(): StoredAppState {
  const initialStats = createEmptyStats()
  const initialSettings = createEmptySettings()

  const state: StoredAppState = {
    books: [],
    disciplines: [],
    stats: initialStats,
    settings: initialSettings,
    schedule: createEmptySchedule(),
    achievements: deepClone(ACHIEVEMENT_DEFINITIONS),
    energyLogs: [],
    greetingClicks: 0,
    pagesAtLastEnergyChange: initialStats.totalPagesRead,
    achievementMetrics: {
      energyChangeCount: 0,
      peakDaysCount: initialStats.mentalEnergy === 'peak' ? 1 : 0,
      hasHadLowEnergy: initialStats.mentalEnergy === 'low',
    },
  }

  syncState(state)

  return state
}

function looksLikeLegacySampleState(parsedState: Partial<StoredAppState> | null | undefined) {
  if (!parsedState || !Array.isArray(parsedState.books) || !Array.isArray(parsedState.disciplines)) {
    return false
  }

  const bookIds = new Set(['book-1', 'book-2', 'book-3', 'book-4', 'book-5', 'book-6', 'book-7', 'book-8', 'book-9'])
  const disciplineIds = new Set(['disc-1', 'disc-2', 'disc-3', 'disc-4'])

  return (
    parsedState.books.length === 9 &&
    parsedState.disciplines.length === 4 &&
    parsedState.books.every((book) => bookIds.has(book.id)) &&
    parsedState.disciplines.every((discipline) => disciplineIds.has(discipline.id)) &&
    parsedState.stats?.totalPagesRead === 1055 &&
    (parsedState.energyLogs?.length ?? 0) === 0 &&
    (parsedState.greetingClicks ?? 0) === 0
  )
}

async function writeState(db: SqliteDatabase, state: StoredAppState) {
  await db.run(
    `
      INSERT INTO app_state (id, data, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        data = excluded.data,
        updated_at = excluded.updated_at
    `,
    STATE_ID,
    JSON.stringify(state),
    new Date().toISOString()
  )
}

async function initDb() {
  await mkdir(DATA_DIR, { recursive: true })

  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  const existingState = await db.get<{ data: string }>('SELECT data FROM app_state WHERE id = ?', STATE_ID)

  if (!existingState) {
    await writeState(db, createSeedState())
  }

  return db
}

async function getDb() {
  if (!dbPromise) {
    dbPromise = initDb()
  }

  return dbPromise
}

function normalizeState(parsedState: Partial<StoredAppState> | null | undefined): StoredAppState {
  if (looksLikeLegacySampleState(parsedState)) {
    return createSeedState()
  }

  const seed = createSeedState()
  const baseWeekStart =
    typeof parsedState?.schedule?.weekStart === 'string' && parsedState.schedule.weekStart
      ? parsedState.schedule.weekStart
      : getCurrentWeekStart()
  const normalizedEntries = Array.isArray(parsedState?.schedule?.entries)
    ? parsedState.schedule.entries.map((entry) => {
        const scheduledDate =
          typeof (entry as Partial<ScheduleEntry>).scheduledDate === 'string' && (entry as Partial<ScheduleEntry>).scheduledDate
            ? (entry as ScheduleEntry).scheduledDate
            : typeof (entry as { dayOfWeek?: number }).dayOfWeek === 'number'
              ? getDateFromWeekStart(baseWeekStart, (entry as unknown as { dayOfWeek: number }).dayOfWeek)
              : getTodayString()

        return {
          id: entry.id,
          bookId: entry.bookId,
          scheduledDate,
          timeSlot: entry.timeSlot,
          pagesToRead: entry.pagesToRead,
        }
      })
    : seed.schedule.entries

  const state: StoredAppState = {
    books: Array.isArray(parsedState?.books) ? parsedState.books : seed.books,
    disciplines: Array.isArray(parsedState?.disciplines) ? parsedState.disciplines : seed.disciplines,
    stats: parsedState?.stats ? { ...seed.stats, ...parsedState.stats } : seed.stats,
    settings: parsedState?.settings ? { ...seed.settings, ...parsedState.settings } : seed.settings,
    schedule: parsedState?.schedule
      ? {
          ...seed.schedule,
          ...parsedState.schedule,
          entries: normalizedEntries,
        }
      : seed.schedule,
    achievements: Array.isArray(parsedState?.achievements) ? parsedState.achievements : seed.achievements,
    energyLogs: Array.isArray(parsedState?.energyLogs) ? parsedState.energyLogs : seed.energyLogs,
    greetingClicks: typeof parsedState?.greetingClicks === 'number' ? parsedState.greetingClicks : seed.greetingClicks,
    pagesAtLastEnergyChange:
      typeof parsedState?.pagesAtLastEnergyChange === 'number'
        ? parsedState.pagesAtLastEnergyChange
        : seed.pagesAtLastEnergyChange,
    achievementMetrics: parsedState?.achievementMetrics
      ? {
          ...seed.achievementMetrics,
          ...parsedState.achievementMetrics,
        }
      : seed.achievementMetrics,
  }

  syncState(state)

  return state
}

async function readState() {
  const db = await getDb()
  const row = await db.get<{ data: string }>('SELECT data FROM app_state WHERE id = ?', STATE_ID)

  if (!row) {
    const seed = createSeedState()
    await writeState(db, seed)
    return seed
  }

  return normalizeState(JSON.parse(row.data) as Partial<StoredAppState>)
}

function toAppData(state: StoredAppState): AppData {
  return {
    books: state.books,
    disciplines: state.disciplines,
    stats: state.stats,
    settings: state.settings,
    schedule: state.schedule,
    achievements: state.achievements,
    energyLogs: state.energyLogs,
    greetingClicks: state.greetingClicks,
  }
}

function updateReadingStats(state: StoredAppState, pageDelta: number) {
  if (pageDelta === 0) {
    return
  }

  state.stats.totalPagesRead += pageDelta
  state.stats.weeklyPagesRead += pageDelta

  if (pageDelta <= 0) {
    clampStats(state.stats)
    return
  }

  const today = getTodayString()
  const yesterday = getYesterdayString()

  if (state.stats.lastReadDate !== today) {
    state.stats.currentStreak = state.stats.lastReadDate === yesterday ? state.stats.currentStreak + 1 : 1
    state.stats.longestStreak = Math.max(state.stats.longestStreak, state.stats.currentStreak)
    state.stats.lastReadDate = today
  }

  clampStats(state.stats)
}

function saveBook(state: StoredAppState, book: Book) {
  const nextBook = deepClone(book)
  const index = state.books.findIndex((existingBook) => existingBook.id === nextBook.id)

  if (index >= 0) {
    state.books[index] = nextBook
  } else {
    state.books.push(nextBook)
  }

  updateBookDisciplineMembership(state, nextBook)
}

function deleteBook(state: StoredAppState, bookId: string) {
  state.books = state.books.filter((book) => book.id !== bookId)
  state.disciplines = state.disciplines.map((discipline) => ({
    ...discipline,
    bookIds: discipline.bookIds.filter((existingBookId) => existingBookId !== bookId),
  }))
  state.schedule = {
    ...state.schedule,
    entries: state.schedule.entries.filter((entry) => entry.bookId !== bookId),
  }
  state.books = state.books.map((book) => ({
    ...book,
    intertextualLinks: book.intertextualLinks.map((link) =>
      link.targetBookId === bookId
        ? {
            ...link,
            targetBookId: undefined,
          }
        : link
    ),
  }))
}

function toggleBookProgress(state: StoredAppState, bookId: string, bubbleIndex: number) {
  let pageDelta = 0

  state.books = state.books.map((book) => {
    if (book.id !== bookId) {
      return book
    }

    const rawPagesRead = (bubbleIndex + 1) * book.pagesPerBubble
    const nextPagesRead =
      book.pagesRead === rawPagesRead ? bubbleIndex * book.pagesPerBubble : Math.min(rawPagesRead, book.totalPages)

    pageDelta = nextPagesRead - book.pagesRead

    const readingSessions =
      pageDelta > 0
        ? [
            ...book.readingSessions,
            {
              id: `session-${Date.now()}`,
              bookId: book.id,
              date: getTodayString(),
              pagesRead: pageDelta,
              timeSlot: getNowTimeSlot(),
              duration: 15,
              energyLevel: state.stats.mentalEnergy,
            },
          ]
        : book.readingSessions

    return {
      ...book,
      pagesRead: nextPagesRead,
      readingSessions,
    }
  })

  updateReadingStats(state, pageDelta)
}

function saveNote(state: StoredAppState, bookId: string, note: Book['notes'][number]) {
  state.books = state.books.map((book) => {
    if (book.id !== bookId) {
      return book
    }

    const existingNoteIndex = book.notes.findIndex((existingNote) => existingNote.id === note.id)

    if (existingNoteIndex >= 0) {
      const nextNotes = [...book.notes]
      nextNotes[existingNoteIndex] = deepClone(note)

      return {
        ...book,
        notes: nextNotes,
      }
    }

    return {
      ...book,
      notes: [...book.notes, deepClone(note)],
    }
  })
}

function deleteNote(state: StoredAppState, bookId: string, noteId: string) {
  state.books = state.books.map((book) =>
    book.id === bookId
      ? {
          ...book,
          notes: book.notes.filter((note) => note.id !== noteId),
        }
      : book
  )
}

function saveQuestion(state: StoredAppState, bookId: string, question: Book['questions'][number]) {
  state.books = state.books.map((book) => {
    if (book.id !== bookId) {
      return book
    }

    const existingQuestionIndex = book.questions.findIndex((existingQuestion) => existingQuestion.id === question.id)

    if (existingQuestionIndex >= 0) {
      const nextQuestions = [...book.questions]
      nextQuestions[existingQuestionIndex] = deepClone(question)

      return {
        ...book,
        questions: nextQuestions,
      }
    }

    return {
      ...book,
      questions: [...book.questions, deepClone(question)],
    }
  })
}

function deleteQuestion(state: StoredAppState, bookId: string, questionId: string) {
  state.books = state.books.map((book) =>
    book.id === bookId
      ? {
          ...book,
          questions: book.questions.filter((question) => question.id !== questionId),
        }
      : book
  )
}

function toggleQuestionResolved(state: StoredAppState, bookId: string, questionId: string) {
  state.books = state.books.map((book) =>
    book.id === bookId
      ? {
          ...book,
          questions: book.questions.map((question) =>
            question.id === questionId
              ? {
                  ...question,
                  resolved: !question.resolved,
                }
              : question
          ),
        }
      : book
  )
}

function saveLink(state: StoredAppState, bookId: string, link: Book['intertextualLinks'][number]) {
  state.books = state.books.map((book) => {
    if (book.id !== bookId) {
      return book
    }

    const existingLinkIndex = book.intertextualLinks.findIndex((existingLink) => existingLink.id === link.id)

    if (existingLinkIndex >= 0) {
      const nextLinks = [...book.intertextualLinks]
      nextLinks[existingLinkIndex] = deepClone(link)

      return {
        ...book,
        intertextualLinks: nextLinks,
      }
    }

    return {
      ...book,
      intertextualLinks: [...book.intertextualLinks, deepClone(link)],
    }
  })
}

function deleteLink(state: StoredAppState, bookId: string, linkId: string) {
  state.books = state.books.map((book) =>
    book.id === bookId
      ? {
          ...book,
          intertextualLinks: book.intertextualLinks.filter((link) => link.id !== linkId),
        }
      : book
  )
}

function saveScheduleEntry(state: StoredAppState, entry: ScheduleEntry) {
  const existingEntryIndex = state.schedule.entries.findIndex((existingEntry) => existingEntry.id === entry.id)

  if (existingEntryIndex >= 0) {
    const nextEntries = [...state.schedule.entries]
    nextEntries[existingEntryIndex] = deepClone(entry)

    state.schedule = {
      ...state.schedule,
      entries: nextEntries,
    }

    return
  }

  state.schedule = {
    ...state.schedule,
    entries: [...state.schedule.entries, deepClone(entry)],
  }
}

function deleteScheduleEntry(state: StoredAppState, entryId: string) {
  state.schedule = {
    ...state.schedule,
    entries: state.schedule.entries.filter((entry) => entry.id !== entryId),
  }
}

function saveDiscipline(state: StoredAppState, discipline: Discipline) {
  const nextDiscipline = {
    ...deepClone(discipline),
    bookIds: dedupeBookIds(discipline.bookIds),
  }

  const existingDisciplineIndex = state.disciplines.findIndex((existingDiscipline) => existingDiscipline.id === nextDiscipline.id)

  if (existingDisciplineIndex >= 0) {
    state.disciplines[existingDisciplineIndex] = nextDiscipline
  } else {
    state.disciplines.push(nextDiscipline)
  }

  state.books = state.books.map((book) => {
    if (!nextDiscipline.bookIds.includes(book.id)) {
      if (book.discipline === nextDiscipline.id) {
        return {
          ...book,
          discipline: undefined,
        }
      }

      return book
    }

    if (!nextDiscipline.professor) {
      return {
        ...book,
        isAcademic: false,
        discipline: undefined,
      }
    }

    return {
      ...book,
      isAcademic: true,
      discipline: nextDiscipline.id,
    }
  })
}

function deleteDiscipline(state: StoredAppState, disciplineId: string) {
  state.disciplines = state.disciplines.filter((discipline) => discipline.id !== disciplineId)
  state.books = state.books.map((book) =>
    book.discipline === disciplineId
      ? {
          ...book,
          discipline: undefined,
        }
      : book
  )
}

function updateWeeklyGoal(state: StoredAppState, weeklyGoal: number) {
  state.stats.weeklyGoal = weeklyGoal
}

function updateReadingPreferences(state: StoredAppState, weeklyGoal: number, readingMinutesPerPage: number) {
  state.stats.weeklyGoal = weeklyGoal
  state.settings.readingMinutesPerPage = readingMinutesPerPage
}

function setEnergy(state: StoredAppState, energy: UserStats['mentalEnergy']) {
  const previousEnergy = state.stats.mentalEnergy
  const pagesReadSinceLastChange = state.stats.totalPagesRead - state.pagesAtLastEnergyChange

  const nextLog: EnergyLog = {
    id: `energy-${Date.now()}`,
    timestamp: new Date().toISOString(),
    energy,
    pagesReadInSession: pagesReadSinceLastChange > 0 ? pagesReadSinceLastChange : undefined,
  }

  state.energyLogs = [...state.energyLogs, nextLog]
  state.pagesAtLastEnergyChange = state.stats.totalPagesRead

  if (previousEnergy !== energy) {
    state.achievementMetrics.energyChangeCount += 1
  }

  if (energy === 'low') {
    state.achievementMetrics.hasHadLowEnergy = true
  }

  if (energy === 'peak' && previousEnergy !== 'peak') {
    state.achievementMetrics.peakDaysCount += 1
  }

  state.stats.mentalEnergy = energy
}

function registerGreetingClick(state: StoredAppState) {
  if (state.greetingClicks < 10) {
    state.greetingClicks += 1
  }
}

function runMutation(state: StoredAppState, action: AppMutation) {
  switch (action.type) {
    case 'save-book':
      saveBook(state, action.book)
      break
    case 'delete-book':
      deleteBook(state, action.bookId)
      break
    case 'toggle-book-progress':
      toggleBookProgress(state, action.bookId, action.bubbleIndex)
      break
    case 'save-note':
      saveNote(state, action.bookId, action.note)
      break
    case 'delete-note':
      deleteNote(state, action.bookId, action.noteId)
      break
    case 'save-question':
      saveQuestion(state, action.bookId, action.question)
      break
    case 'delete-question':
      deleteQuestion(state, action.bookId, action.questionId)
      break
    case 'toggle-question-resolved':
      toggleQuestionResolved(state, action.bookId, action.questionId)
      break
    case 'save-link':
      saveLink(state, action.bookId, action.link)
      break
    case 'delete-link':
      deleteLink(state, action.bookId, action.linkId)
      break
    case 'save-schedule-entry':
      saveScheduleEntry(state, action.entry)
      break
    case 'delete-schedule-entry':
      deleteScheduleEntry(state, action.entryId)
      break
    case 'save-discipline':
      saveDiscipline(state, action.discipline)
      break
    case 'delete-discipline':
      deleteDiscipline(state, action.disciplineId)
      break
    case 'update-weekly-goal':
      updateWeeklyGoal(state, action.weeklyGoal)
      break
    case 'update-reading-preferences':
      updateReadingPreferences(state, action.weeklyGoal, action.readingMinutesPerPage)
      break
    case 'set-energy':
      setEnergy(state, action.energy)
      break
    case 'register-greeting-click':
      registerGreetingClick(state)
      break
  }
}

export async function getAppData() {
  const state = await readState()
  return toAppData(state)
}

export async function applyMutation(action: AppMutation) {
  const db = await getDb()
  const state = await readState()
  const nextState = deepClone(state)

  runMutation(nextState, action)
  syncState(nextState)
  await writeState(db, nextState)

  return toAppData(nextState)
}
