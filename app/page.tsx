'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Book, Discipline, UserStats, WeeklySchedule, MainTab, AppScreen, Note, Question, IntertextualLink, ScheduleEntry, EnergyLog } from '@/lib/types'
import { sampleBooks, sampleDisciplines, sampleStats, sampleSchedule, sampleAchievements } from '@/lib/sample-data'
import { checkAchievements, createInitialCheckerContext } from '@/lib/achievements-checker'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileNav } from '@/components/mobile-nav'
import { Dashboard } from '@/components/dashboard'
import { Bookshelf } from '@/components/bookshelf'
import { WeeklyCalendar } from '@/components/weekly-calendar'
import { NotesView } from '@/components/notes-view'
import { DisciplinesView } from '@/components/disciplines-view'
import { BookDetail } from '@/components/book-detail'
import { BookForm } from '@/components/book-form'
import { NoteDetail } from '@/components/note-detail'
import { NoteForm } from '@/components/note-form'
import { QuestionForm } from '@/components/question-form'
import { LinkForm } from '@/components/link-form'
import { ScheduleForm } from '@/components/schedule-form'
import { DisciplineDetail } from '@/components/discipline-detail'
import { DisciplineForm } from '@/components/discipline-form'
import { AchievementsView } from '@/components/achievements-view'
import { LoveModal } from '@/components/love-modal'
import type { Achievement } from '@/lib/types'

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>({ type: 'main', tab: 'dashboard' })
  const [books, setBooks] = useState<Book[]>(sampleBooks)
  const [disciplines, setDisciplines] = useState<Discipline[]>(sampleDisciplines)
  const [stats, setStats] = useState<UserStats>(sampleStats)
  const [schedule, setSchedule] = useState<WeeklySchedule>(sampleSchedule)
  const [achievements, setAchievements] = useState<Achievement[]>(sampleAchievements)
  const [greetingClicks, setGreetingClicks] = useState(0)
  const [showLoveModal, setShowLoveModal] = useState(false)
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([])
  const [pagesAtLastEnergyChange, setPagesAtLastEnergyChange] = useState(0)
  
  // Achievement checker context
  const [energyChangeCount, setEnergyChangeCount] = useState(0)
  const [peakDaysCount, setPeakDaysCount] = useState(0)
  const [hasHadLowEnergy, setHasHadLowEnergy] = useState(false)
  const previousEnergyRef = useRef<UserStats['mentalEnergy'] | undefined>(undefined)
  
  // Track energy changes
  useEffect(() => {
    if (previousEnergyRef.current !== undefined && previousEnergyRef.current !== stats.mentalEnergy) {
      setEnergyChangeCount(prev => prev + 1)
    }
    if (stats.mentalEnergy === 'low') {
      setHasHadLowEnergy(true)
    }
    if (stats.mentalEnergy === 'peak') {
      setPeakDaysCount(prev => prev + 1)
    }
    previousEnergyRef.current = stats.mentalEnergy
  }, [stats.mentalEnergy])
  
  // Check achievements whenever relevant data changes
  useEffect(() => {
    const context = {
      books,
      disciplines,
      stats,
      energyChangeCount,
      peakDaysCount,
      hasHadLowEnergy,
      hasRecoveredFromLow: hasHadLowEnergy && stats.mentalEnergy === 'peak',
    }
    
    setAchievements(prevAchievements => {
      const updatedAchievements = checkAchievements(prevAchievements, context)
      
      // Only update if there are changes
      const hasChanges = updatedAchievements.some((ach, i) => 
        ach.unlocked !== prevAchievements[i].unlocked || 
        ach.progress !== prevAchievements[i].progress
      )
      
      return hasChanges ? updatedAchievements : prevAchievements
    })
  }, [books, disciplines, stats, energyChangeCount, peakDaysCount, hasHadLowEnergy])

  // Extract current main tab for sidebar/nav highlighting
  const currentMainTab: MainTab = screen.type === 'main' ? screen.tab : 
    screen.type.startsWith('book') ? 'bookshelf' :
    screen.type.startsWith('note') || screen.type.startsWith('question') || screen.type.startsWith('link') ? 'notes' :
    screen.type.startsWith('schedule') ? 'calendar' :
    screen.type.startsWith('discipline') ? 'disciplines' :
    screen.type.startsWith('achievement') ? 'achievements' : 'dashboard'

  // Navigation helpers
  const navigate = useCallback((newScreen: AppScreen) => {
    setScreen(newScreen)
  }, [])

  const goToMain = useCallback((tab: MainTab) => {
    setScreen({ type: 'main', tab })
  }, [])

  // Easter egg handler
  const handleGreetingClick = useCallback(() => {
    setGreetingClicks(prev => {
      if (prev >= 10) {
        // Already unlocked, show modal again
        setShowLoveModal(true)
        return prev
      }
      const newClicks = prev + 1
      if (newClicks === 10) {
        setShowLoveModal(true)
      }
      return newClicks
    })
  }, [])

  const goBack = useCallback(() => {
    // Determine which main tab to return to
    if (screen.type === 'book-detail' || screen.type === 'book-form') {
      setScreen({ type: 'main', tab: 'bookshelf' })
    } else if (screen.type === 'note-detail' || screen.type === 'note-form' || screen.type === 'question-form' || screen.type === 'link-form') {
      setScreen({ type: 'main', tab: 'notes' })
    } else if (screen.type === 'schedule-form') {
      setScreen({ type: 'main', tab: 'calendar' })
    } else if (screen.type === 'discipline-detail' || screen.type === 'discipline-form') {
      setScreen({ type: 'main', tab: 'disciplines' })
    } else if (screen.type === 'achievement-detail') {
      setScreen({ type: 'main', tab: 'achievements' })
    } else {
      setScreen({ type: 'main', tab: 'dashboard' })
    }
  }, [screen])

  // CRUD operations
  const handleToggleBubble = useCallback((bookId: string, bubbleIndex: number) => {
    setBooks(prev => prev.map(book => {
      if (book.id !== bookId) return book
      const newPagesRead = (bubbleIndex + 1) * book.pagesPerBubble
      const pagesRead = book.pagesRead === newPagesRead 
        ? bubbleIndex * book.pagesPerBubble 
        : Math.min(newPagesRead, book.totalPages)
      
      // Registrar sessao de leitura com energia atual
      const isAdvancing = pagesRead > book.pagesRead
      const newSessions = isAdvancing ? [
        ...book.readingSessions,
        {
          id: `session-${Date.now()}`,
          bookId: book.id,
          date: new Date().toISOString().split('T')[0],
          pagesRead: pagesRead - book.pagesRead,
          timeSlot: new Date().getHours() < 12 ? 'manha' : new Date().getHours() < 18 ? 'tarde' : 'noite',
          duration: 15, // estimativa
          energyLevel: stats.mentalEnergy,
        }
      ] : book.readingSessions
      
      return { ...book, pagesRead, readingSessions: newSessions }
    }))
    setStats(prev => ({
      ...prev,
      weeklyPagesRead: prev.weeklyPagesRead + 5,
      totalPagesRead: prev.totalPagesRead + 5,
    }))
  }, [stats.mentalEnergy])

  const handleSetEnergy = useCallback((energy: UserStats['mentalEnergy']) => {
    // Calcular paginas lidas desde ultimo registro
    const pagesReadSince = stats.totalPagesRead - pagesAtLastEnergyChange
    
    // Criar novo log automaticamente
    const newLog: EnergyLog = {
      id: `energy-${Date.now()}`,
      timestamp: new Date().toISOString(),
      energy,
      pagesReadInSession: pagesReadSince > 0 ? pagesReadSince : undefined,
    }
    
    setEnergyLogs(prev => [...prev, newLog])
    setPagesAtLastEnergyChange(stats.totalPagesRead)
    setStats(prev => ({ ...prev, mentalEnergy: energy }))
  }, [stats.totalPagesRead, pagesAtLastEnergyChange])

  const handleSaveBook = useCallback((book: Book) => {
    setBooks(prev => {
      const exists = prev.find(b => b.id === book.id)
      if (exists) {
        return prev.map(b => b.id === book.id ? book : b)
      }
      return [...prev, book]
    })
    goToMain('bookshelf')
  }, [goToMain])

  const handleDeleteBook = useCallback((bookId: string) => {
    setBooks(prev => prev.filter(b => b.id !== bookId))
    goToMain('bookshelf')
  }, [goToMain])

  const handleSaveNote = useCallback((bookId: string, note: Note) => {
    setBooks(prev => prev.map(book => {
      if (book.id !== bookId) return book
      const exists = book.notes.find(n => n.id === note.id)
      if (exists) {
        return { ...book, notes: book.notes.map(n => n.id === note.id ? note : n) }
      }
      return { ...book, notes: [...book.notes, note] }
    }))
    goToMain('notes')
  }, [goToMain])

  const handleDeleteNote = useCallback((bookId: string, noteId: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id !== bookId) return book
      return { ...book, notes: book.notes.filter(n => n.id !== noteId) }
    }))
    goToMain('notes')
  }, [goToMain])

  const handleSaveQuestion = useCallback((bookId: string, question: Question) => {
    setBooks(prev => prev.map(book => {
      if (book.id !== bookId) return book
      const exists = book.questions.find(q => q.id === question.id)
      if (exists) {
        return { ...book, questions: book.questions.map(q => q.id === question.id ? question : q) }
      }
      return { ...book, questions: [...book.questions, question] }
    }))
    goToMain('notes')
  }, [goToMain])

  const handleDeleteQuestion = useCallback((bookId: string, questionId: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id !== bookId) return book
      return { ...book, questions: book.questions.filter(q => q.id !== questionId) }
    }))
  }, [])

  const handleToggleQuestionResolved = useCallback((bookId: string, questionId: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id !== bookId) return book
      return { 
        ...book, 
        questions: book.questions.map(q => 
          q.id === questionId ? { ...q, resolved: !q.resolved } : q
        ) 
      }
    }))
  }, [])

  const handleSaveLink = useCallback((bookId: string, link: IntertextualLink) => {
    setBooks(prev => prev.map(book => {
      if (book.id !== bookId) return book
      const exists = book.intertextualLinks.find(l => l.id === link.id)
      if (exists) {
        return { ...book, intertextualLinks: book.intertextualLinks.map(l => l.id === link.id ? link : l) }
      }
      return { ...book, intertextualLinks: [...book.intertextualLinks, link] }
    }))
    goToMain('notes')
  }, [goToMain])

  const handleDeleteLink = useCallback((bookId: string, linkId: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id !== bookId) return book
      return { ...book, intertextualLinks: book.intertextualLinks.filter(l => l.id !== linkId) }
    }))
  }, [])

  const handleSaveScheduleEntry = useCallback((entry: ScheduleEntry) => {
    setSchedule(prev => {
      const exists = prev.entries.find(e => e.id === entry.id)
      if (exists) {
        return { ...prev, entries: prev.entries.map(e => e.id === entry.id ? entry : e) }
      }
      return { ...prev, entries: [...prev.entries, entry] }
    })
    goToMain('calendar')
  }, [goToMain])

  const handleDeleteScheduleEntry = useCallback((entryId: string) => {
    setSchedule(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== entryId)
    }))
  }, [])

  const handleSaveDiscipline = useCallback((discipline: Discipline) => {
    setDisciplines(prev => {
      const exists = prev.find(d => d.id === discipline.id)
      if (exists) {
        return prev.map(d => d.id === discipline.id ? discipline : d)
      }
      return [...prev, discipline]
    })
    goToMain('disciplines')
  }, [goToMain])

  const handleDeleteDiscipline = useCallback((disciplineId: string) => {
    setDisciplines(prev => prev.filter(d => d.id !== disciplineId))
    goToMain('disciplines')
  }, [goToMain])

  // Render the current screen
  const renderScreen = () => {
    switch (screen.type) {
      case 'main':
        switch (screen.tab) {
          case 'dashboard':
            return (
              <Dashboard 
                stats={stats} 
                books={books}
                energyLogs={energyLogs}
                onSetEnergy={handleSetEnergy}
                onNavigate={goToMain}
                navigate={navigate}
                greetingClicks={greetingClicks}
                onGreetingClick={handleGreetingClick}
              />
            )
          case 'bookshelf':
            return (
              <Bookshelf 
                books={books} 
                disciplines={disciplines}
                onToggleBubble={handleToggleBubble}
                navigate={navigate}
              />
            )
          case 'calendar':
            return (
              <WeeklyCalendar 
                schedule={schedule} 
                books={books}
                navigate={navigate}
                onDeleteEntry={handleDeleteScheduleEntry}
              />
            )
          case 'notes':
            return (
              <NotesView 
                books={books} 
                disciplines={disciplines}
                navigate={navigate}
                onDeleteNote={handleDeleteNote}
                onDeleteQuestion={handleDeleteQuestion}
                onToggleQuestionResolved={handleToggleQuestionResolved}
                onDeleteLink={handleDeleteLink}
              />
            )
          case 'disciplines':
            return (
              <DisciplinesView 
                disciplines={disciplines} 
                books={books}
                navigate={navigate}
              />
            )
          case 'achievements':
            return (
              <AchievementsView 
                achievements={achievements}
                navigate={navigate}
                greetingClicks={greetingClicks}
              />
            )
        }
        break

      case 'book-detail':
        const detailBook = books.find(b => b.id === screen.bookId)
        if (!detailBook) return null
        return (
          <BookDetail
            book={detailBook}
            disciplines={disciplines}
            onBack={goBack}
            navigate={navigate}
            onToggleBubble={handleToggleBubble}
            onDelete={() => handleDeleteBook(detailBook.id)}
          />
        )

      case 'book-form':
        const editBook = screen.bookId ? books.find(b => b.id === screen.bookId) : undefined
        return (
          <BookForm
            book={editBook}
            disciplines={disciplines}
            onSave={handleSaveBook}
            onBack={goBack}
          />
        )

      case 'note-detail':
        const noteBook = books.find(b => b.id === screen.bookId)
        const note = noteBook?.notes.find(n => n.id === screen.noteId)
        if (!noteBook || !note) return null
        return (
          <NoteDetail
            note={note}
            book={noteBook}
            onBack={goBack}
            navigate={navigate}
            onDelete={() => handleDeleteNote(noteBook.id, note.id)}
          />
        )

      case 'note-form':
        const noteFormBook = books.find(b => b.id === screen.bookId)
        const editNote = screen.noteId ? noteFormBook?.notes.find(n => n.id === screen.noteId) : undefined
        if (!noteFormBook) return null
        return (
          <NoteForm
            book={noteFormBook}
            note={editNote}
            onSave={(note) => handleSaveNote(noteFormBook.id, note)}
            onBack={goBack}
          />
        )

      case 'question-form':
        const questionBook = books.find(b => b.id === screen.bookId)
        const editQuestion = screen.questionId ? questionBook?.questions.find(q => q.id === screen.questionId) : undefined
        if (!questionBook) return null
        return (
          <QuestionForm
            book={questionBook}
            question={editQuestion}
            onSave={(q) => handleSaveQuestion(questionBook.id, q)}
            onBack={goBack}
          />
        )

      case 'link-form':
        const linkBook = books.find(b => b.id === screen.bookId)
        const editLink = screen.linkId ? linkBook?.intertextualLinks.find(l => l.id === screen.linkId) : undefined
        if (!linkBook) return null
        return (
          <LinkForm
            book={linkBook}
            books={books}
            link={editLink}
            onSave={(l) => handleSaveLink(linkBook.id, l)}
            onBack={goBack}
          />
        )

      case 'schedule-form':
        const editEntry = screen.entryId ? schedule.entries.find(e => e.id === screen.entryId) : undefined
        return (
          <ScheduleForm
            entry={editEntry}
            books={books}
            onSave={handleSaveScheduleEntry}
            onBack={goBack}
          />
        )

      case 'discipline-detail':
        const discipline = disciplines.find(d => d.id === screen.disciplineId)
        if (!discipline) return null
        return (
          <DisciplineDetail
            discipline={discipline}
            books={books}
            onBack={goBack}
            navigate={navigate}
            onDelete={() => handleDeleteDiscipline(discipline.id)}
          />
        )

      case 'discipline-form':
        const editDiscipline = screen.disciplineId ? disciplines.find(d => d.id === screen.disciplineId) : undefined
        return (
          <DisciplineForm
            discipline={editDiscipline}
            books={books}
            onSave={handleSaveDiscipline}
            onBack={goBack}
          />
        )
    }
    return null
  }

  // Determine if we should show the bottom nav (only on main screens)
  const showNav = screen.type === 'main'

  return (
    <>
      <div className="flex h-dvh overflow-hidden bg-background">
        {/* Desktop sidebar - always visible */}
        <AppSidebar activeTab={currentMainTab} onTabChange={goToMain} stats={stats} />
        
        {/* Main content */}
        <main className={`flex-1 overflow-y-auto ${showNav ? 'pb-20 lg:pb-0' : ''}`}>
          {renderScreen()}
        </main>

        {/* Mobile bottom nav - only on main screens */}
        {showNav && <MobileNav activeTab={currentMainTab} onTabChange={goToMain} />}
      </div>

      {/* Love modal easter egg */}
      <LoveModal isOpen={showLoveModal} onClose={() => setShowLoveModal(false)} />
    </>
  )
}
