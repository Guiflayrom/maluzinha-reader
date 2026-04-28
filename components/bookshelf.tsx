'use client'

import { useState } from 'react'
import { Filter, CheckCircle2, Plus, ChevronRight } from 'lucide-react'
import type { Book, Discipline, AppScreen } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface BookshelfProps {
  books: Book[]
  disciplines: Discipline[]
  onToggleBubble: (bookId: string, bubbleIndex: number) => void
  navigate: (screen: AppScreen) => void
}

type FilterMode = 'all' | 'academic' | 'personal' | 'completed'

export function Bookshelf({ books, disciplines, onToggleBubble, navigate }: BookshelfProps) {
  const [filter, setFilter] = useState<FilterMode>('all')
  const [disciplineFilter, setDisciplineFilter] = useState('all')

  const availableDisciplines = disciplines
    .filter(discipline => discipline.professor && books.some(book => book.discipline === discipline.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const filteredBooks = books.filter(book => {
    const matchesPrimaryFilter =
      filter === 'academic'
        ? book.isAcademic
        : filter === 'personal'
          ? !book.isAcademic
          : filter === 'completed'
            ? book.pagesRead >= book.totalPages
            : true

    const matchesDiscipline = disciplineFilter === 'all' || book.discipline === disciplineFilter

    return matchesPrimaryFilter && matchesDiscipline
  })

  const getDisciplineName = (book: Book) => {
    if (!book.discipline) return book.isAcademic ? 'Academico' : 'Pessoal'
    return disciplines.find(d => d.id === book.discipline)?.name || 'Sem disciplina'
  }

  const depthColors = { none: 'bg-border', shallow: 'bg-accent/50', medium: 'bg-accent', deep: 'bg-primary' }
  const hasActiveFilters = filter !== 'all' || disciplineFilter !== 'all'

  const handlePrimaryFilterChange = (nextFilter: FilterMode) => {
    setFilter(nextFilter)

    if (nextFilter === 'personal') {
      setDisciplineFilter('all')
    }
  }

  const handleDisciplineFilterChange = (nextDisciplineId: string) => {
    setDisciplineFilter(nextDisciplineId)

    if (nextDisciplineId !== 'all' && filter === 'personal') {
      setFilter('academic')
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-4 pt-6 pb-2 lg:px-8 lg:pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Minha Estante</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {hasActiveFilters ? `${filteredBooks.length} de ${books.length} livros` : `${books.length} livros no total`}
            </p>
          </div>
          <Button onClick={() => navigate({ type: 'book-form' })} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Novo livro
          </Button>
        </div>
      </header>

      {/* Filters */}
      <div className="px-4 lg:px-8 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {(['all', 'academic', 'personal', 'completed'] as FilterMode[]).map(f => (
            <button
              key={f}
              onClick={() => handlePrimaryFilterChange(f)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {f === 'all' && 'Todos'}
              {f === 'academic' && 'Faculdade'}
              {f === 'personal' && 'Pessoais'}
              {f === 'completed' && 'Completos'}
            </button>
          ))}
        </div>

        {availableDisciplines.length > 0 && (
          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">Matérias:</span>
            <button
              onClick={() => handleDisciplineFilterChange('all')}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                disciplineFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              Todas
            </button>
            {availableDisciplines.map(discipline => (
              <button
                key={discipline.id}
                onClick={() => handleDisciplineFilterChange(discipline.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                  disciplineFilter === discipline.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {discipline.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Books List */}
      <div className="px-4 lg:px-8 flex flex-col gap-3 pb-8">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhum livro encontrado</p>
            <Button 
              variant="link" 
              onClick={() => navigate({ type: 'book-form' })}
              className="mt-2"
            >
              Adicionar primeiro livro
            </Button>
          </div>
        ) : (
          filteredBooks.map(book => {
            const progress = Math.round((book.pagesRead / book.totalPages) * 100)
            const isCompleted = book.pagesRead >= book.totalPages
            const pendingQuestions = book.questions.filter(q => !q.resolved).length

            return (
              <button
                key={book.id}
                onClick={() => navigate({ type: 'book-detail', bookId: book.id })}
                className={cn(
                  'rounded-xl border bg-card p-4 text-left hover:border-primary/30 transition-all duration-200',
                  isCompleted ? 'border-primary/30' : 'border-border'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Book spine / color indicator */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div 
                      className="w-3 h-14 rounded-full"
                      style={{ backgroundColor: book.coverColor }}
                    />
                    {isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs font-bold text-foreground">{progress}%</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, backgroundColor: book.coverColor }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {book.pagesRead}/{book.totalPages}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-medium',
                        book.isAcademic ? 'bg-primary/10 text-primary' : 'bg-accent/20 text-accent-foreground'
                      )}>
                        {book.isAcademic ? 'Faculdade' : 'Pessoal'}
                      </span>
                      <span className={cn('w-2 h-2 rounded-full', depthColors[book.depth])} />
                      <span className="text-[10px] text-muted-foreground">{getDisciplineName(book)}</span>
                      {pendingQuestions > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                          {pendingQuestions} duvida(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
