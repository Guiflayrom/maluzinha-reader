'use client'

import { useState } from 'react'
import { Search, Filter, BookOpen, MessageCircleQuestion, StickyNote, Link2, History, Tag, Plus, Trash2, CheckCircle2, Circle, ChevronRight, Mic } from 'lucide-react'
import type { Book, Discipline, Note, Question, AppScreen } from '@/lib/types'
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

interface NotesViewProps {
  books: Book[]
  disciplines: Discipline[]
  navigate: (screen: AppScreen) => void
  onDeleteNote: (bookId: string, noteId: string) => void
  onDeleteQuestion: (bookId: string, questionId: string) => void
  onToggleQuestionResolved: (bookId: string, questionId: string) => void
  onDeleteLink: (bookId: string, linkId: string) => void
}

type NotesTab = 'notes' | 'questions' | 'links'

export function NotesView({ books, disciplines, navigate, onDeleteNote, onDeleteQuestion, onToggleQuestionResolved, onDeleteLink }: NotesViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<NotesTab>('notes')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('all')

  const allNotes = books.flatMap(book => 
    book.notes.map(note => ({ ...note, bookTitle: book.title, bookAuthor: book.author, bookColor: book.coverColor }))
  )
  
  const allQuestions = books.flatMap(book => 
    book.questions.map(q => ({ ...q, bookTitle: book.title, bookAuthor: book.author, bookColor: book.coverColor }))
  )

  const allLinks = books.flatMap(book => 
    book.intertextualLinks.map(link => ({ ...link, bookTitle: book.title, bookColor: book.coverColor }))
  )

  const filteredNotes = allNotes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesBook = selectedBookFilter === 'all' || note.bookId === selectedBookFilter
    return matchesSearch && matchesBook
  })

  const filteredQuestions = allQuestions.filter(q => {
    const matchesSearch = searchQuery === '' || q.text.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBook = selectedBookFilter === 'all' || q.bookId === selectedBookFilter
    return matchesSearch && matchesBook
  })

  const getTypeLabel = (type: Note['type']) => {
    switch (type) {
      case 'fichamento': return 'Fichamento'
      case 'anotacao': return 'Anotacao'
      case 'citacao': return 'Citacao'
    }
  }

  const getTypeColor = (type: Note['type']) => {
    switch (type) {
      case 'fichamento': return 'bg-primary/10 text-primary'
      case 'anotacao': return 'bg-accent/20 text-accent-foreground'
      case 'citacao': return 'bg-destructive/10 text-destructive'
    }
  }

  // Get first book for creating new items when no book is selected
  const firstBook = books[0]

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-4 pt-6 pb-2 lg:px-8 lg:pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Anotacoes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {allNotes.length} notas | {allQuestions.filter(q => !q.resolved).length} duvidas pendentes
            </p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 lg:px-8 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por temas, tags ou conteudo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="px-4 lg:px-8 py-2">
        <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1">
          {([
            { key: 'notes' as NotesTab, label: 'Notas', icon: StickyNote, count: allNotes.length },
            { key: 'questions' as NotesTab, label: 'Duvidas', icon: MessageCircleQuestion, count: allQuestions.filter(q => !q.resolved).length },
            { key: 'links' as NotesTab, label: 'Links', icon: Link2, count: allLinks.length },
          ]).map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSubTab(tab.key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                  activeSubTab === tab.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full',
                    activeSubTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-border text-muted-foreground'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Book filter */}
      <div className="px-4 lg:px-8 py-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <button
            onClick={() => setSelectedBookFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              selectedBookFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            )}
          >
            Todos os livros
          </button>
          {books.filter(b => b.notes.length > 0 || b.questions.length > 0 || b.intertextualLinks.length > 0).map(book => (
            <button
              key={book.id}
              onClick={() => setSelectedBookFilter(book.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5',
                selectedBookFilter === book.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: book.coverColor }} />
              {book.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-8 py-4 flex-1 flex flex-col gap-3 pb-8">
        {/* Notes tab */}
        {activeSubTab === 'notes' && (
          <>
            {/* Add button */}
            {firstBook && (
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate({ type: 'note-form', bookId: selectedBookFilter !== 'all' ? selectedBookFilter : firstBook.id })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova anotacao
              </Button>
            )}

            {filteredNotes.length === 0 ? (
              <EmptyState icon={StickyNote} text="Nenhuma anotacao encontrada" />
            ) : (
              filteredNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => navigate({ type: 'note-detail', noteId: note.id, bookId: note.bookId })}
                  className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-2 h-10 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: note.bookColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getTypeColor(note.type))}>
                          {getTypeLabel(note.type)}
                        </span>
                        {note.page && (
                          <span className="text-[10px] text-muted-foreground">p. {note.page}</span>
                        )}
                        {note.audioUrl && (
                          <Mic className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">{note.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <BookOpen className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{note.bookTitle}</span>
                        {note.tags.length > 0 && (
                          <div className="flex items-center gap-1 ml-2">
                            <Tag className="w-3 h-3 text-muted-foreground" />
                            {note.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </>
        )}

        {/* Questions tab */}
        {activeSubTab === 'questions' && (
          <>
            {/* Add button */}
            {firstBook && (
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate({ type: 'question-form', bookId: selectedBookFilter !== 'all' ? selectedBookFilter : firstBook.id })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova duvida
              </Button>
            )}

            {filteredQuestions.length === 0 ? (
              <EmptyState icon={MessageCircleQuestion} text="Nenhuma duvida registrada" />
            ) : (
              <>
                {/* Pending */}
                {filteredQuestions.filter(q => !q.resolved).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      Pendentes - Lembrar antes da aula
                    </p>
                    <div className="flex flex-col gap-2">
                      {filteredQuestions.filter(q => !q.resolved).map(q => (
                        <QuestionCard 
                          key={q.id} 
                          question={q} 
                          onToggleResolved={() => onToggleQuestionResolved(q.bookId, q.id)}
                          onEdit={() => navigate({ type: 'question-form', bookId: q.bookId, questionId: q.id })}
                          onDelete={() => onDeleteQuestion(q.bookId, q.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* Resolved */}
                {filteredQuestions.filter(q => q.resolved).length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Resolvidas</p>
                    <div className="flex flex-col gap-2">
                      {filteredQuestions.filter(q => q.resolved).map(q => (
                        <QuestionCard 
                          key={q.id} 
                          question={q} 
                          onToggleResolved={() => onToggleQuestionResolved(q.bookId, q.id)}
                          onEdit={() => navigate({ type: 'question-form', bookId: q.bookId, questionId: q.id })}
                          onDelete={() => onDeleteQuestion(q.bookId, q.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Intertextual links tab */}
        {activeSubTab === 'links' && (
          <>
            {/* Add button */}
            {firstBook && (
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate({ type: 'link-form', bookId: selectedBookFilter !== 'all' ? selectedBookFilter : firstBook.id })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova intertextualidade
              </Button>
            )}

            {allLinks.length === 0 ? (
              <EmptyState icon={Link2} text="Nenhuma intertextualidade registrada" />
            ) : (
              allLinks.map(link => {
                const targetBook = link.targetBookId ? books.find(b => b.id === link.targetBookId) : null
                return (
                  <div key={link.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-6 rounded-full" style={{ backgroundColor: link.bookColor }} />
                        <span className="text-xs font-medium text-foreground">{link.bookTitle}</span>
                        <Link2 className="w-3 h-3 text-primary mx-1" />
                        {targetBook ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-6 rounded-full" style={{ backgroundColor: targetBook.coverColor }} />
                            <span className="text-xs font-medium text-foreground">{targetBook.title}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">{link.targetTitle}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => navigate({ type: 'link-form', bookId: link.sourceBookId, linkId: link.id })}
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
                              <AlertDialogTitle>Excluir intertextualidade?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acao nao pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => onDeleteLink(link.sourceBookId, link.id)} 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{link.description}</p>
                    {link.page && (
                      <p className="text-[10px] text-muted-foreground mt-2">Referencia na p. {link.page}</p>
                    )}
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

interface QuestionCardProps {
  question: { 
    id: string
    bookId: string
    text: string
    context: string
    page?: number
    resolved: boolean
    bookTitle: string
    bookColor: string 
  }
  onToggleResolved: () => void
  onEdit: () => void
  onDelete: () => void
}

function QuestionCard({ question, onToggleResolved, onEdit, onDelete }: QuestionCardProps) {
  return (
    <div className={cn(
      'rounded-xl border bg-card p-4',
      question.resolved ? 'border-border opacity-60' : 'border-destructive/20'
    )}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleResolved}
          className="flex-shrink-0 mt-0.5"
        >
          {question.resolved ? (
            <CheckCircle2 className="w-5 h-5 text-primary" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>
        <div 
          className="w-2 h-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: question.bookColor }}
        />
        <div className="flex-1">
          <p className={cn('text-sm font-medium', question.resolved ? 'text-muted-foreground line-through' : 'text-foreground')}>
            {question.text}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{question.context}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-muted-foreground">{question.bookTitle}</span>
            {question.page && (
              <span className="text-[10px] text-muted-foreground">| p. {question.page}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit}>
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
                <AlertDialogTitle>Excluir duvida?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acao nao pode ser desfeita.
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
    </div>
  )
}
