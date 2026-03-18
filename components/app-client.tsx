'use client'

import { useCallback, useState, useTransition } from 'react'
import { AchievementsView } from '@/components/achievements-view'
import { AppSidebar } from '@/components/app-sidebar'
import { BookDetail } from '@/components/book-detail'
import { BookForm } from '@/components/book-form'
import { Bookshelf } from '@/components/bookshelf'
import { Dashboard } from '@/components/dashboard'
import { DisciplineDetail } from '@/components/discipline-detail'
import { DisciplineForm } from '@/components/discipline-form'
import { DisciplinesView } from '@/components/disciplines-view'
import { LinkForm } from '@/components/link-form'
import { LoveModal } from '@/components/love-modal'
import { MobileNav } from '@/components/mobile-nav'
import { NoteDetail } from '@/components/note-detail'
import { NoteForm } from '@/components/note-form'
import { NotesView } from '@/components/notes-view'
import { QuestionForm } from '@/components/question-form'
import { ScheduleForm } from '@/components/schedule-form'
import { WeeklyCalendar } from '@/components/weekly-calendar'
import type {
  AppData,
  AppMutation,
  AppScreen,
  Book,
  Discipline,
  IntertextualLink,
  MainTab,
  Note,
  Question,
  ScheduleEntry,
  UserStats,
} from '@/lib/types'

interface AppClientProps {
  initialData: AppData
}

async function executeMutation(action: AppMutation) {
  const response = await fetch('/api/actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    body: JSON.stringify(action),
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(error?.error || 'Nao foi possivel concluir a operacao.')
  }

  return (await response.json()) as AppData
}

export function AppClient({ initialData }: AppClientProps) {
  const [screen, setScreen] = useState<AppScreen>({ type: 'main', tab: 'dashboard' })
  const [appData, setAppData] = useState<AppData>(initialData)
  const [showLoveModal, setShowLoveModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { books, disciplines, stats, settings, schedule, achievements, energyLogs, greetingClicks } = appData

  const currentMainTab: MainTab =
    screen.type === 'main'
      ? screen.tab
      : screen.type.startsWith('book')
        ? 'bookshelf'
        : screen.type.startsWith('note') || screen.type.startsWith('question') || screen.type.startsWith('link')
          ? 'notes'
          : screen.type.startsWith('schedule')
            ? 'calendar'
            : screen.type.startsWith('discipline')
              ? 'disciplines'
              : screen.type.startsWith('achievement')
                ? 'achievements'
                : 'dashboard'

  const navigate = useCallback((newScreen: AppScreen) => {
    setScreen(newScreen)
  }, [])

  const goToMain = useCallback((tab: MainTab) => {
    setScreen({ type: 'main', tab })
  }, [])

  const goBack = useCallback(() => {
    if (screen.type === 'book-detail' || screen.type === 'book-form') {
      setScreen({ type: 'main', tab: 'bookshelf' })
      return
    }

    if (
      screen.type === 'note-detail' ||
      screen.type === 'note-form' ||
      screen.type === 'question-form' ||
      screen.type === 'link-form'
    ) {
      setScreen({ type: 'main', tab: 'notes' })
      return
    }

    if (screen.type === 'schedule-form') {
      setScreen({ type: 'main', tab: 'calendar' })
      return
    }

    if (screen.type === 'discipline-detail' || screen.type === 'discipline-form') {
      setScreen({ type: 'main', tab: 'disciplines' })
      return
    }

    if (screen.type === 'achievement-detail') {
      setScreen({ type: 'main', tab: 'achievements' })
      return
    }

    setScreen({ type: 'main', tab: 'dashboard' })
  }, [screen])

  const runMutation = useCallback(async (action: AppMutation) => {
    try {
      const nextData = await executeMutation(action)

      startTransition(() => {
        setAppData(nextData)
      })

      return nextData
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Nao foi possivel concluir a operacao.')
      return null
    }
  }, [])

  const handleGreetingClick = useCallback(async () => {
    const nextData = await runMutation({ type: 'register-greeting-click' })

    if (nextData && (greetingClicks >= 10 || nextData.greetingClicks >= 10)) {
      setShowLoveModal(true)
    }
  }, [greetingClicks, runMutation])

  const handleToggleBubble = useCallback(async (bookId: string, bubbleIndex: number) => {
    await runMutation({ type: 'toggle-book-progress', bookId, bubbleIndex })
  }, [runMutation])

  const handleSetEnergy = useCallback(async (energy: UserStats['mentalEnergy']) => {
    await runMutation({ type: 'set-energy', energy })
  }, [runMutation])

  const handleUpdateReadingPreferences = useCallback(async (weeklyGoal: number, readingMinutesPerPage: number) => {
    await runMutation({ type: 'update-reading-preferences', weeklyGoal, readingMinutesPerPage })
  }, [runMutation])

  const handleSaveBook = useCallback(async (book: Book) => {
    const nextData = await runMutation({ type: 'save-book', book })

    if (nextData) {
      goToMain('bookshelf')
    }
  }, [goToMain, runMutation])

  const handleDeleteBook = useCallback(async (bookId: string) => {
    const nextData = await runMutation({ type: 'delete-book', bookId })

    if (nextData) {
      goToMain('bookshelf')
    }
  }, [goToMain, runMutation])

  const handleSaveNote = useCallback(async (bookId: string, note: Note) => {
    const nextData = await runMutation({ type: 'save-note', bookId, note })

    if (nextData) {
      goToMain('notes')
    }
  }, [goToMain, runMutation])

  const handleDeleteNote = useCallback(async (bookId: string, noteId: string) => {
    const nextData = await runMutation({ type: 'delete-note', bookId, noteId })

    if (nextData) {
      goToMain('notes')
    }
  }, [goToMain, runMutation])

  const handleSaveQuestion = useCallback(async (bookId: string, question: Question) => {
    const nextData = await runMutation({ type: 'save-question', bookId, question })

    if (nextData) {
      goToMain('notes')
    }
  }, [goToMain, runMutation])

  const handleDeleteQuestion = useCallback(async (bookId: string, questionId: string) => {
    await runMutation({ type: 'delete-question', bookId, questionId })
  }, [runMutation])

  const handleToggleQuestionResolved = useCallback(async (bookId: string, questionId: string) => {
    await runMutation({ type: 'toggle-question-resolved', bookId, questionId })
  }, [runMutation])

  const handleSaveLink = useCallback(async (bookId: string, link: IntertextualLink) => {
    const nextData = await runMutation({ type: 'save-link', bookId, link })

    if (nextData) {
      goToMain('notes')
    }
  }, [goToMain, runMutation])

  const handleDeleteLink = useCallback(async (bookId: string, linkId: string) => {
    await runMutation({ type: 'delete-link', bookId, linkId })
  }, [runMutation])

  const handleSaveScheduleEntry = useCallback(async (entry: ScheduleEntry) => {
    const nextData = await runMutation({ type: 'save-schedule-entry', entry })

    if (nextData) {
      goToMain('calendar')
    }
  }, [goToMain, runMutation])

  const handleDeleteScheduleEntry = useCallback(async (entryId: string) => {
    await runMutation({ type: 'delete-schedule-entry', entryId })
  }, [runMutation])

  const handleSaveDiscipline = useCallback(async (discipline: Discipline) => {
    const nextData = await runMutation({ type: 'save-discipline', discipline })

    if (nextData) {
      goToMain('disciplines')
    }
  }, [goToMain, runMutation])

  const handleDeleteDiscipline = useCallback(async (disciplineId: string) => {
    const nextData = await runMutation({ type: 'delete-discipline', disciplineId })

    if (nextData) {
      goToMain('disciplines')
    }
  }, [goToMain, runMutation])

  const renderScreen = () => {
    switch (screen.type) {
      case 'main':
        switch (screen.tab) {
          case 'dashboard':
            return (
              <Dashboard
                stats={stats}
                settings={settings}
                books={books}
                energyLogs={energyLogs}
                onSetEnergy={handleSetEnergy}
                onUpdateReadingPreferences={handleUpdateReadingPreferences}
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
                readingMinutesPerPage={settings.readingMinutesPerPage}
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
      case 'book-detail': {
        const detailBook = books.find((book) => book.id === screen.bookId)

        if (!detailBook) {
          return null
        }

        return (
          <BookDetail
            book={detailBook}
            disciplines={disciplines}
            onBack={goBack}
            navigate={navigate}
            onToggleBubble={handleToggleBubble}
            onDelete={() => {
              void handleDeleteBook(detailBook.id)
            }}
          />
        )
      }
      case 'book-form': {
        const editBook = screen.bookId ? books.find((book) => book.id === screen.bookId) : undefined

        return (
          <BookForm
            book={editBook}
            disciplines={disciplines}
            onSave={handleSaveBook}
            onBack={goBack}
          />
        )
      }
      case 'note-detail': {
        const noteBook = books.find((book) => book.id === screen.bookId)
        const note = noteBook?.notes.find((item) => item.id === screen.noteId)

        if (!noteBook || !note) {
          return null
        }

        return (
          <NoteDetail
            note={note}
            book={noteBook}
            onBack={goBack}
            navigate={navigate}
            onDelete={() => {
              void handleDeleteNote(noteBook.id, note.id)
            }}
          />
        )
      }
      case 'note-form': {
        const noteBook = books.find((book) => book.id === screen.bookId)
        const editNote = screen.noteId ? noteBook?.notes.find((note) => note.id === screen.noteId) : undefined

        if (!noteBook) {
          return null
        }

        return (
          <NoteForm
            book={noteBook}
            note={editNote}
            onSave={(note) => {
              void handleSaveNote(noteBook.id, note)
            }}
            onBack={goBack}
          />
        )
      }
      case 'question-form': {
        const questionBook = books.find((book) => book.id === screen.bookId)
        const editQuestion = screen.questionId
          ? questionBook?.questions.find((question) => question.id === screen.questionId)
          : undefined

        if (!questionBook) {
          return null
        }

        return (
          <QuestionForm
            book={questionBook}
            question={editQuestion}
            onSave={(question) => {
              void handleSaveQuestion(questionBook.id, question)
            }}
            onBack={goBack}
          />
        )
      }
      case 'link-form': {
        const linkBook = books.find((book) => book.id === screen.bookId)
        const editLink = screen.linkId
          ? linkBook?.intertextualLinks.find((link) => link.id === screen.linkId)
          : undefined

        if (!linkBook) {
          return null
        }

        return (
          <LinkForm
            book={linkBook}
            books={books}
            link={editLink}
            onSave={(link) => {
              void handleSaveLink(linkBook.id, link)
            }}
            onBack={goBack}
          />
        )
      }
      case 'schedule-form': {
        const editEntry = screen.entryId ? schedule.entries.find((entry) => entry.id === screen.entryId) : undefined

        return (
          <ScheduleForm
            entry={editEntry}
            books={books}
            readingMinutesPerPage={settings.readingMinutesPerPage}
            onSave={handleSaveScheduleEntry}
            onBack={goBack}
          />
        )
      }
      case 'discipline-detail': {
        const discipline = disciplines.find((item) => item.id === screen.disciplineId)

        if (!discipline) {
          return null
        }

        return (
          <DisciplineDetail
            discipline={discipline}
            books={books}
            onBack={goBack}
            navigate={navigate}
            onDelete={() => {
              void handleDeleteDiscipline(discipline.id)
            }}
          />
        )
      }
      case 'discipline-form': {
        const editDiscipline = screen.disciplineId
          ? disciplines.find((discipline) => discipline.id === screen.disciplineId)
          : undefined

        return (
          <DisciplineForm
            discipline={editDiscipline}
            books={books}
            onSave={handleSaveDiscipline}
            onBack={goBack}
          />
        )
      }
      case 'achievement-detail':
        return null
    }

    return null
  }

  const showNav = screen.type === 'main'

  return (
    <>
      <div className="flex h-dvh overflow-hidden bg-background">
        <AppSidebar activeTab={currentMainTab} onTabChange={goToMain} stats={stats} />

        <main className={`flex-1 overflow-y-auto ${showNav ? 'pb-20 lg:pb-0' : ''}`}>
          {renderScreen()}
        </main>

        {showNav && <MobileNav activeTab={currentMainTab} onTabChange={goToMain} />}
      </div>

      {isPending && (
        <div className="fixed right-4 top-4 z-50 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm">
          Sincronizando...
        </div>
      )}

      <LoveModal isOpen={showLoveModal} onClose={() => setShowLoveModal(false)} />
    </>
  )
}
