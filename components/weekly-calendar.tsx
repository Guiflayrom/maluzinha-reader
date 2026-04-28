'use client'

import { useState } from 'react'
import { Clock, BookOpen, ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react'
import type { Book, WeeklySchedule, AppScreen } from '@/lib/types'
import { formatLocalDate, getStartOfWeek } from '@/lib/date'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface WeeklyCalendarProps {
  schedule: WeeklySchedule
  books: Book[]
  readingMinutesPerPage: number
  navigate: (screen: AppScreen) => void
  onDeleteEntry: (entryId: string) => void
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const DAYS_FULL = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']
const MONTHS = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function parseDateString(value: string) {
  return new Date(`${value}T00:00:00`)
}

export function WeeklyCalendar({ schedule, books, readingMinutesPerPage, navigate, onDeleteEntry }: WeeklyCalendarProps) {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'month'>('week')
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const getBook = (bookId: string) => books.find(b => b.id === bookId)
  const selectedDateString = formatLocalDate(selectedDate)

  const dayEntries = schedule.entries.filter(e => e.scheduledDate === selectedDateString)
  const totalPagesDay = dayEntries.reduce((sum, e) => sum + e.pagesToRead, 0)

  const estimatedMinutes = Math.round(totalPagesDay * readingMinutesPerPage)
  const hours = Math.floor(estimatedMinutes / 60)
  const minutes = estimatedMinutes % 60

  const weekStart = getStartOfWeek(selectedDate)
  const weekDaySummary = DAYS.map((_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateString = formatLocalDate(date)
    const entries = schedule.entries.filter(e => e.scheduledDate === dateString)
    const totalPages = entries.reduce((sum, e) => sum + e.pagesToRead, 0)
    return { day: i, date, dateString, entries, totalPages }
  })

  const totalWeekPages = weekDaySummary.reduce((sum, d) => sum + d.totalPages, 0)

  // Month calendar helpers
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay()

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const getEntriesForDate = (dayNum: number) => {
    const dateString = formatLocalDate(new Date(currentYear, currentMonth, dayNum))
    return schedule.entries.filter(e => e.scheduledDate === dateString)
  }

  const weekRangeLabel = `${weekDaySummary[0]?.date.getDate()} a ${weekDaySummary[6]?.date.getDate()} de ${MONTHS[weekDaySummary[0]?.date.getMonth() ?? currentMonth].toLowerCase()}`

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-4 pt-6 pb-2 lg:px-8 lg:pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Calendario</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {viewMode === 'month' ? `${MONTHS[currentMonth]} ${currentYear}` : `Semana de ${weekRangeLabel}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  viewMode === 'week' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                )}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  viewMode === 'day' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                )}
              >
                Dia
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  viewMode === 'month' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                )}
              >
                Mes
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Week summary bar */}
      <div className="px-4 lg:px-8 py-3">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
          <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Total da semana:</span>
          <span className="text-sm font-bold text-foreground">{totalWeekPages} paginas</span>
          <span className="text-xs text-muted-foreground ml-auto">
            ~{Math.floor(Math.round(totalWeekPages * readingMinutesPerPage) / 60)}h {Math.round(totalWeekPages * readingMinutesPerPage) % 60}min
          </span>
          <Button size="sm" onClick={() => navigate({ type: 'schedule-form' })}>
            <Plus className="w-4 h-4 mr-1" />
            Agendar
          </Button>
        </div>
      </div>

      {/* Month view */}
      {viewMode === 'month' && (
        <div className="px-4 lg:px-8 py-4 flex-1">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-secondary">
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h3 className="text-lg font-semibold text-foreground">
              {MONTHS[currentMonth]} {currentYear}
            </h3>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-secondary">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {DAYS.map(day => (
                <div key={day} className="p-2 text-center">
                  <span className="text-xs font-medium text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {/* Empty cells for days before the first day of month */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 min-h-[80px] border-b border-r border-border bg-secondary/20" />
              ))}

              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1
                const entries = getEntriesForDate(dayNum)
                const isToday = dayNum === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()
                const totalPages = entries.reduce((sum, e) => sum + e.pagesToRead, 0)

                return (
                  <button
                    key={dayNum}
                    onClick={() => {
                      const date = new Date(currentYear, currentMonth, dayNum)
                      setSelectedDate(date)
                      setViewMode('day')
                    }}
                    className={cn(
                      'p-2 min-h-[80px] border-b border-r border-border text-left hover:bg-secondary/30 transition-colors',
                      isToday && 'bg-primary/5'
                    )}
                  >
                    <span className={cn(
                      'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                      isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                    )}>
                      {dayNum}
                    </span>
                    {entries.length > 0 && (
                      <div className="mt-1 flex flex-col gap-0.5">
                        {entries.slice(0, 2).map(entry => {
                          const book = getBook(entry.bookId)
                          if (!book) return null
                          return (
                            <div key={entry.id} className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: book.coverColor }} />
                              <span className="text-[9px] text-muted-foreground truncate">{book.title.substring(0, 10)}...</span>
                            </div>
                          )
                        })}
                        {entries.length > 2 && (
                          <span className="text-[9px] text-muted-foreground">+{entries.length - 2} mais</span>
                        )}
                        {totalPages > 0 && (
                          <span className="text-[9px] font-medium text-primary">{totalPages}p</span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Day selector (for week/day views) */}
      {viewMode !== 'month' && (
        <div className="px-4 lg:px-8 py-2">
          <div className="grid grid-cols-7 gap-1.5">
            {weekDaySummary.map((day, i) => {
              const isSelectedDay = selectedDateString === day.dateString
              const isToday = formatLocalDate(new Date()) === day.dateString
              const hasEntries = day.entries.length > 0
              
              return (
                <button
                  key={i}
                  onClick={() => { setSelectedDate(day.date); setViewMode('day') }}
                  className={cn(
                    'flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all duration-200',
                    isSelectedDay
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : isToday
                        ? 'bg-accent/20 text-foreground'
                        : 'hover:bg-secondary text-foreground'
                  )}
                >
                  <span className={cn(
                    'text-[10px] font-medium',
                    isSelectedDay ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}>
                    {DAYS[i]}
                  </span>
                  <span className={cn(
                    'text-sm font-bold',
                    isSelectedDay ? 'text-primary-foreground' : 'text-foreground'
                  )}>
                    {day.date.getDate()}
                  </span>
                  {hasEntries && (
                    <div className={cn('flex gap-0.5 mt-0.5')}>
                      {day.entries.slice(0, 3).map((_, j) => (
                        <div 
                          key={j} 
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            isSelectedDay ? 'bg-primary-foreground/60' : 'bg-accent'
                          )} 
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Day detail */}
      {viewMode === 'day' && (
        <div className="px-4 lg:px-8 py-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const nextDate = new Date(selectedDate)
                  nextDate.setDate(nextDate.getDate() - 1)
                  setSelectedDate(nextDate)
                }}
                className="p-1.5 rounded-lg hover:bg-secondary"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <h3 className="text-sm font-semibold text-foreground">
                {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(selectedDate)}
              </h3>
              <button 
                onClick={() => {
                  const nextDate = new Date(selectedDate)
                  nextDate.setDate(nextDate.getDate() + 1)
                  setSelectedDate(nextDate)
                }}
                className="p-1.5 rounded-lg hover:bg-secondary"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {totalPagesDay} pags | ~{hours > 0 ? `${hours}h ` : ''}{minutes}min
              </span>
            </div>
          </div>

          {dayEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhuma leitura agendada</p>
              <p className="text-xs text-muted-foreground mt-1">Dia livre para descansar ou adiantar</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate({ type: 'schedule-form' })}>
                <Plus className="w-4 h-4 mr-1" />
                Agendar leitura
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {dayEntries.map(entry => {
                const book = getBook(entry.bookId)
                if (!book) return null
                const bubbles = Math.ceil(entry.pagesToRead / book.pagesPerBubble)
                
                return (
                  <div 
                    key={entry.id}
                    className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-2 h-full min-h-[60px] rounded-full flex-shrink-0"
                        style={{ backgroundColor: book.coverColor }}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{book.title}</p>
                            <p className="text-xs text-muted-foreground">{book.author}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                              {entry.timeSlot}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => navigate({ type: 'schedule-form', entryId: entry.id })}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acao nao pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => onDeleteEntry(entry.id)} 
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{entry.pagesToRead} pags</span>
                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(bubbles, 20) }).map((_, i) => (
                              <div 
                                key={i}
                                className="w-3 h-3 rounded-full border-2"
                                style={{ borderColor: book.coverColor }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Week overview grid */}
      {viewMode === 'week' && (
        <div className="px-4 lg:px-8 py-4 flex-1">
          <div className="flex flex-col gap-3">
            {weekDaySummary.filter(d => d.entries.length > 0).map(day => (
              <div 
                key={day.dateString}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    {DAYS_FULL[day.day]} · {day.date.getDate()}/{`${day.date.getMonth() + 1}`.padStart(2, '0')}
                  </h4>
                  <span className="text-xs text-muted-foreground">{day.totalPages} paginas</span>
                </div>
                <div className="flex flex-col gap-2">
                  {day.entries.map(entry => {
                    const book = getBook(entry.bookId)
                    if (!book) return null
                    return (
                      <div key={entry.id} className="flex items-center gap-2">
                        <div 
                          className="w-2 h-8 rounded-full flex-shrink-0"
                          style={{ backgroundColor: book.coverColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{book.title}</p>
                          <p className="text-[10px] text-muted-foreground">{entry.timeSlot}</p>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{entry.pagesToRead}p</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => navigate({ type: 'schedule-form', entryId: entry.id })}
                        >
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            
            {weekDaySummary.every(d => d.entries.length === 0) && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum agendamento esta semana</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate({ type: 'schedule-form' })}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agendar leitura
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
