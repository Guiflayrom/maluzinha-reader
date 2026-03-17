'use client'

import { ArrowLeft, Edit, Trash2, Star, Eye, EyeOff, MessageCircleQuestion, Link2, CheckCircle2, BookOpen } from 'lucide-react'
import type { Book, Discipline, AppScreen } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ProgressBubbles } from '@/components/progress-bubbles'
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

interface BookDetailProps {
  book: Book
  disciplines: Discipline[]
  onBack: () => void
  navigate: (screen: AppScreen) => void
  onToggleBubble: (bookId: string, bubbleIndex: number) => void
  onDelete: () => void
}

export function BookDetail({ book, disciplines, onBack, navigate, onToggleBubble, onDelete }: BookDetailProps) {
  const discipline = disciplines.find(d => d.id === book.discipline)
  const progress = Math.round((book.pagesRead / book.totalPages) * 100)
  const isCompleted = book.pagesRead >= book.totalPages
  const totalBubbles = Math.ceil(book.totalPages / book.pagesPerBubble)
  const filledBubbles = Math.floor(book.pagesRead / book.pagesPerBubble)
  const pendingQuestions = book.questions.filter(q => !q.resolved)

  const depthLabels = { none: 'Nao iniciado', shallow: 'Superficial', medium: 'Medio', deep: 'Aprofundado' }
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
              onClick={() => navigate({ type: 'book-form', bookId: book.id })}
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
                  <AlertDialogTitle>Excluir livro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acao nao pode ser desfeita. Todas as anotacoes, duvidas e links intertextuais serao excluidos.
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

      {/* Book Info */}
      <div className="px-4 lg:px-8 py-6">
        <div className="flex items-start gap-4">
          <div 
            className="w-4 h-24 rounded-full flex-shrink-0"
            style={{ backgroundColor: book.coverColor }}
          />
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">{book.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={cn(
                'text-xs px-2.5 py-1 rounded-full font-medium',
                book.isAcademic ? 'bg-primary/10 text-primary' : 'bg-accent/20 text-accent-foreground'
              )}>
                {book.isAcademic ? 'Faculdade' : 'Pessoal'}
              </span>
              {discipline && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {discipline.name}
                </span>
              )}
              {isCompleted && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Concluido
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Progresso</p>
            <p className="text-2xl font-bold text-foreground mt-1">{progress}%</p>
            <p className="text-xs text-muted-foreground">{book.pagesRead} de {book.totalPages} pags</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Profundidade</p>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    'w-5 h-5',
                    i < depthStars[book.depth] ? 'text-accent fill-accent' : 'text-border'
                  )} 
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{depthLabels[book.depth]}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Aula</p>
            <div className="flex items-center gap-2 mt-1">
              {book.classWatched ? (
                <Eye className="w-5 h-5 text-primary" />
              ) : (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">
                {book.classWatched ? 'Vista' : 'Pendente'}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Duvidas</p>
            <p className="text-2xl font-bold text-foreground mt-1">{pendingQuestions.length}</p>
            <p className="text-xs text-muted-foreground">pendente(s)</p>
          </div>
        </div>

        {/* Progress Bubbles */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Progresso ({book.pagesPerBubble} pags/bolinha)
            </h3>
            <p className="text-xs text-muted-foreground">
              {filledBubbles}/{totalBubbles} completas
            </p>
          </div>
          <ProgressBubbles
            totalBubbles={totalBubbles}
            filledBubbles={filledBubbles}
            color={book.coverColor}
            pagesPerBubble={book.pagesPerBubble}
            onToggle={(index) => onToggleBubble(book.id, index)}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <Button 
            variant="outline" 
            className="justify-start h-auto py-3"
            onClick={() => navigate({ type: 'note-form', bookId: book.id })}
          >
            <BookOpen className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm">Nova anotacao</span>
          </Button>
          <Button 
            variant="outline" 
            className="justify-start h-auto py-3"
            onClick={() => navigate({ type: 'question-form', bookId: book.id })}
          >
            <MessageCircleQuestion className="w-4 h-4 mr-2 text-destructive" />
            <span className="text-sm">Nova duvida</span>
          </Button>
          <Button 
            variant="outline" 
            className="justify-start h-auto py-3"
            onClick={() => navigate({ type: 'link-form', bookId: book.id })}
          >
            <Link2 className="w-4 h-4 mr-2 text-accent" />
            <span className="text-sm">Novo link</span>
          </Button>
        </div>

        {/* Pending Questions Alert */}
        {pendingQuestions.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <h3 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
              <MessageCircleQuestion className="w-4 h-4" />
              Duvidas pendentes para a aula
            </h3>
            <div className="flex flex-col gap-2">
              {pendingQuestions.map(q => (
                <div key={q.id} className="p-3 rounded-lg bg-card border border-border">
                  <p className="text-sm text-foreground">{q.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{q.context}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Preview */}
        {book.notes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Anotacoes ({book.notes.length})
            </h3>
            <div className="flex flex-col gap-2">
              {book.notes.slice(0, 3).map(note => (
                <button
                  key={note.id}
                  onClick={() => navigate({ type: 'note-detail', noteId: note.id, bookId: book.id })}
                  className="p-3 rounded-lg border border-border bg-card text-left hover:border-primary/30 transition-colors"
                >
                  <p className="text-sm text-foreground line-clamp-2">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {note.type} {note.page && `| p. ${note.page}`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Intertextual Links */}
        {book.intertextualLinks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Links Intertextuais ({book.intertextualLinks.length})
            </h3>
            <div className="flex flex-col gap-2">
              {book.intertextualLinks.map(link => (
                <div key={link.id} className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-foreground">{link.targetTitle}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
