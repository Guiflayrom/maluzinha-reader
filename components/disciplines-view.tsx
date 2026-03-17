'use client'

import { GraduationCap, BookOpen, FileText, ChevronRight, MessageCircleQuestion, Plus } from 'lucide-react'
import type { Book, Discipline, AppScreen } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DisciplinesViewProps {
  disciplines: Discipline[]
  books: Book[]
  navigate: (screen: AppScreen) => void
}

export function DisciplinesView({ disciplines, books, navigate }: DisciplinesViewProps) {
  const getDisciplineBooks = (disc: Discipline) => 
    books.filter(b => disc.bookIds.includes(b.id))

  const getDisciplineProgress = (disc: Discipline) => {
    const discBooks = getDisciplineBooks(disc)
    if (discBooks.length === 0) return 0
    const totalPages = discBooks.reduce((sum, b) => sum + b.totalPages, 0)
    const readPages = discBooks.reduce((sum, b) => sum + b.pagesRead, 0)
    return Math.round((readPages / totalPages) * 100)
  }

  const getDisciplineQuestions = (disc: Discipline) => {
    const discBooks = getDisciplineBooks(disc)
    return discBooks.flatMap(b => b.questions).filter(q => !q.resolved)
  }

  // Separate academic disciplines from personal
  const academicDisciplines = disciplines.filter(d => d.professor)
  const personalCategory = disciplines.find(d => !d.professor)

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-4 pt-6 pb-2 lg:px-8 lg:pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Disciplinas</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {disciplines.length} materias | {disciplines.filter(d => getDisciplineProgress(d) >= 100).length} concluidas
            </p>
          </div>
          <Button onClick={() => navigate({ type: 'discipline-form' })} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Nova disciplina
          </Button>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-4 flex flex-col gap-4 pb-8">
        {/* Academic disciplines */}
        {academicDisciplines.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Faculdade</h3>
            </div>
            <div className="flex flex-col gap-3">
              {academicDisciplines.map(disc => {
                const discBooks = getDisciplineBooks(disc)
                const progress = getDisciplineProgress(disc)
                const pendingQuestions = getDisciplineQuestions(disc)

                return (
                  <button
                    key={disc.id}
                    onClick={() => navigate({ type: 'discipline-detail', disciplineId: disc.id })}
                    className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Color indicator */}
                      <div 
                        className="w-3 h-16 rounded-full flex-shrink-0"
                        style={{ backgroundColor: disc.color }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{disc.name}</p>
                            {disc.professor && (
                              <p className="text-xs text-muted-foreground">{disc.professor}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-bold text-foreground">{progress}%</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: disc.color }}
                          />
                        </div>

                        {/* Quick stats */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> {discBooks.length} livros
                          </span>
                          {pendingQuestions.length > 0 && (
                            <span className="text-[10px] text-destructive flex items-center gap-1">
                              <MessageCircleQuestion className="w-3 h-3" /> {pendingQuestions.length} duvidas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Personal readings */}
        {personalCategory && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Leituras Pessoais</h3>
            </div>
            <button
              onClick={() => navigate({ type: 'discipline-detail', disciplineId: personalCategory.id })}
              className="w-full rounded-xl border border-border bg-card p-4 text-left hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-3 h-16 rounded-full flex-shrink-0"
                  style={{ backgroundColor: personalCategory.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">{personalCategory.name}</p>
                      <p className="text-xs text-muted-foreground">Livros fora da faculdade</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-foreground">{getDisciplineProgress(personalCategory)}%</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${getDisciplineProgress(personalCategory)}%`, backgroundColor: personalCategory.color }}
                    />
                  </div>

                  {/* Quick stats */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {getDisciplineBooks(personalCategory).length} livros
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {disciplines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhuma disciplina cadastrada</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate({ type: 'discipline-form' })}
            >
              <Plus className="w-4 h-4 mr-1" />
              Criar primeira disciplina
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
