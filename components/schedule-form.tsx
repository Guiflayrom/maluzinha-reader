'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Book, ScheduleEntry } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ScheduleFormProps {
  entry?: ScheduleEntry
  books: Book[]
  readingMinutesPerPage: number
  onSave: (entry: ScheduleEntry) => void
  onBack: () => void
}

const DAYS_FULL = ['Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado']

const TIME_SLOTS = [
  '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
  '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
  '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00', '23:00 - 00:00'
]

export function ScheduleForm({ entry, books, readingMinutesPerPage, onSave, onBack }: ScheduleFormProps) {
  const isEditing = !!entry

  const [bookId, setBookId] = useState(entry?.bookId || '')
  const [dayOfWeek, setDayOfWeek] = useState(entry?.dayOfWeek?.toString() || '')
  const [timeSlot, setTimeSlot] = useState(entry?.timeSlot || '')
  const [pagesToRead, setPagesToRead] = useState(entry?.pagesToRead?.toString() || '')

  const selectedBook = books.find(b => b.id === bookId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newEntry: ScheduleEntry = {
      id: entry?.id || `se-${Date.now()}`,
      bookId,
      dayOfWeek: parseInt(dayOfWeek),
      timeSlot,
      pagesToRead: parseInt(pagesToRead) || 0,
    }

    onSave(newEntry)
  }

  const isValid = bookId && dayOfWeek !== '' && timeSlot && parseInt(pagesToRead) > 0

  // Calculate estimated time
  const pages = parseInt(pagesToRead) || 0
  const estimatedMinutes = Math.round(pages * readingMinutesPerPage)
  const hours = Math.floor(estimatedMinutes / 60)
  const mins = estimatedMinutes % 60

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 lg:px-8">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Cancelar</span>
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 lg:px-8 py-6 flex flex-col gap-6 pb-32">
        {/* Book selector */}
        <div className="flex flex-col gap-2">
          <Label>Qual livro voce vai ler? *</Label>
          <Select value={bookId} onValueChange={setBookId}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Selecione um livro..." />
            </SelectTrigger>
            <SelectContent>
              {books.filter(b => b.pagesRead < b.totalPages).map(book => (
                <SelectItem key={book.id} value={book.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: book.coverColor }} />
                    <span>{book.title}</span>
                    <span className="text-muted-foreground text-xs">
                      ({book.totalPages - book.pagesRead} pags restantes)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected book preview */}
        {selectedBook && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
            <div 
              className="w-2 h-12 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedBook.coverColor }}
            />
            <div>
              <p className="text-sm font-medium text-foreground">{selectedBook.title}</p>
              <p className="text-xs text-muted-foreground">{selectedBook.author}</p>
              <p className="text-xs text-muted-foreground">
                {selectedBook.pagesRead}/{selectedBook.totalPages} paginas lidas | {selectedBook.totalPages - selectedBook.pagesRead} restantes
              </p>
            </div>
          </div>
        )}

        {/* Day of week */}
        <div className="flex flex-col gap-2">
          <Label>Dia da semana *</Label>
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS_FULL.map((day, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDayOfWeek(i.toString())}
                className={cn(
                  'p-2 rounded-lg border text-center transition-all',
                  dayOfWeek === i.toString()
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                )}
              >
                <span className="text-[10px] font-medium">{day.substring(0, 3)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time slot */}
        <div className="flex flex-col gap-2">
          <Label>Horario *</Label>
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Selecione um horario..." />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map(slot => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pages to read */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="pages">Quantas paginas? *</Label>
          <div className="flex items-center gap-3">
            <Input
              id="pages"
              type="number"
              value={pagesToRead}
              onChange={(e) => setPagesToRead(e.target.value)}
              placeholder="Ex: 20"
              className="bg-card w-32"
            />
            <span className="text-sm text-muted-foreground">paginas</span>
          </div>
          {pages > 0 && (
            <p className="text-xs text-muted-foreground">
              Tempo estimado: ~{hours > 0 ? `${hours}h ` : ''}{mins}min (baseado em {readingMinutesPerPage} min/pagina)
            </p>
          )}
        </div>

        {/* Quick select pages */}
        {selectedBook && (
          <div className="flex flex-col gap-2">
            <Label>Sugestoes rapidas</Label>
            <div className="flex flex-wrap gap-2">
              {[10, 15, 20, 25, 30].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPagesToRead(p.toString())}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    pagesToRead === p.toString()
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {p} pags
                </button>
              ))}
              {/* Remaining pages button */}
              {selectedBook.totalPages - selectedBook.pagesRead > 0 && (
                <button
                  type="button"
                  onClick={() => setPagesToRead((selectedBook.totalPages - selectedBook.pagesRead).toString())}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    pagesToRead === (selectedBook.totalPages - selectedBook.pagesRead).toString()
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent/20 text-accent-foreground hover:bg-accent/30'
                  )}
                >
                  Tudo ({selectedBook.totalPages - selectedBook.pagesRead}p)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {isValid && selectedBook && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium text-foreground mb-2">Resumo do agendamento</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selectedBook.title}</span>
              {' '}na{' '}
              <span className="font-medium text-foreground">{DAYS_FULL[parseInt(dayOfWeek)]}</span>
              {' '}das{' '}
              <span className="font-medium text-foreground">{timeSlot}</span>
              {' '}- {' '}
              <span className="font-medium text-foreground">{pagesToRead} paginas</span>
            </p>
          </div>
        )}
      </form>

      {/* Submit button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border lg:left-64">
        <Button 
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          {isEditing ? 'Salvar alteracoes' : 'Criar agendamento'}
        </Button>
      </div>
    </div>
  )
}
