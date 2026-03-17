'use client'

import { ArrowLeft, Edit, Trash2, GraduationCap, BookOpen, FileText, CheckCircle2, MessageCircleQuestion, Star, ChevronRight } from 'lucide-react'
import type { Book, Discipline, AppScreen } from '@/lib/types'
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

interface DisciplineDetailProps {
  discipline: Discipline
  books: Book[]
  onBack: () => void
  navigate: (screen: AppScreen) => void
  onDelete: () => void
}

export function DisciplineDetail({ discipline, books, onBack, navigate, onDelete }: DisciplineDetailProps) {
  const discBooks = books.filter(b => discipline.bookIds.includes(b.id))
  
  const totalPages = discBooks.reduce((sum, b) => sum + b.totalPages, 0)
  const readPages = discBooks.reduce((sum, b) => sum + b.pagesRead, 0)
  const progress = totalPages > 0 ? Math.round((readPages / totalPages) * 100) : 0
  
  const pendingQuestions = discBooks.flatMap(b => b.questions).filter(q => !q.resolved)
  const totalNotes = discBooks.reduce((sum, b) => sum + b.notes.length, 0)
  
  const depthStars = { none: 0, shallow: 1, medium: 2, deep: 3 }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 lg:px-8">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate({ type: 'discipline-form', disciplineId: discipline.id })}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir disciplina?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acao nao pode ser desfeita. Os livros associados nao serao excluidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      {/* Discipline Info */}
      <div className="px-4 lg:px-8 py-6">
        <div className="flex items-start gap-4">
          <div 
            className="w-4 h-20 rounded-full flex-shrink-0"
            style={{ backgroundColor: discipline.color }}
          />
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">{discipline.name}</h1>
            {discipline.professor && (
              <p className="text-sm text-muted-foreground mt-1">{discipline.professor}</p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progresso geral</span>
            <span className="text-sm font-bold text-foreground">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: discipline.color }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {readPages} de {totalPages} paginas lidas
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <BookOpen className="w-5 h-5 text-primary mx-auto" />
            <p className="text-xl font-bold text-foreground mt-2">{discBooks.length}</p>
            <p className="text-xs text-muted-foreground">livros</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <FileText className="w-5 h-5 text-accent mx-auto" />
            <p className="text-xl font-bold text-foreground mt-2">{totalNotes}</p>
            <p className="text-xs text-muted-foreground">anotacoes</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <MessageCircleQuestion className="w-5 h-5 text-destructive mx-auto" />
            <p className="text-xl font-bold text-foreground mt-2">{pendingQuestions.length}</p>
            <p className="text-xs text-muted-foreground">duvidas</p>
          </div>
        </div>

        {/* Syllabus */}
        {discipline.syllabus && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Programa da disciplina</h3>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-sm text-foreground leading-relaxed">{discipline.syllabus}</p>
            </div>
          </div>
        )}

        {/* Books */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Bibliografia ({discBooks.length})</h3>
            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => navigate({ type: 'book-form' })}>
              Adicionar livro
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {discBooks.map(book => {
              const bookProgress = Math.round((book.pagesRead / book.totalPages) * 100)
              const isComplete = book.pagesRead >= book.totalPages
              return (
                <button
                  key={book.id}
                  onClick={() => navigate({ type: 'book-detail', bookId: book.id })}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                    isComplete ? 'border-primary/20 bg-primary/5' : 'border-border bg-card hover:border-primary/30'
                  )}
                >
                  <div 
                    className="w-2 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: book.coverColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{book.title}</p>
                      {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs font-bold text-foreground">{bookProgress}%</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            'w-2.5 h-2.5',
                            i < depthStars[book.depth] ? 'text-accent fill-accent' : 'text-border'
                          )} 
                        />
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Supplementary texts */}
        {discipline.supplementaryTexts.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Textos complementares</h3>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <ul className="flex flex-col gap-2">
                {discipline.supplementaryTexts.map((text, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">-</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Pending questions */}
        {pendingQuestions.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircleQuestion className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold text-destructive">Duvidas pendentes para a aula</h3>
            </div>
            <div className="flex flex-col gap-2">
              {pendingQuestions.map(q => {
                const qBook = books.find(b => b.id === q.bookId)
                return (
                  <div key={q.id} className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-sm text-foreground">{q.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{q.context}</p>
                    {qBook && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {qBook.title} {q.page && `| p. ${q.page}`}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Summary (for completed disciplines) */}
        {progress >= 100 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-primary">Resumo da disciplina</h3>
            </div>
            {discipline.summary ? (
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                <p className="text-sm text-foreground leading-relaxed">{discipline.summary}</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Disciplina concluida! Clique em editar para adicionar um resumo geral.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
