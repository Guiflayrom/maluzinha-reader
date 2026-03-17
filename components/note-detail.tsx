'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Edit, Trash2, Play, Pause, History, Tag, BookOpen } from 'lucide-react'
import type { Book, Note, AppScreen } from '@/lib/types'
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

interface NoteDetailProps {
  note: Note
  book: Book
  onBack: () => void
  navigate: (screen: AppScreen) => void
  onDelete: () => void
}

export function NoteDetail({ note, book, onBack, navigate, onDelete }: NoteDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const typeLabels = { fichamento: 'Fichamento', anotacao: 'Anotacao', citacao: 'Citacao' }
  const typeColors = {
    fichamento: 'bg-primary/10 text-primary',
    anotacao: 'bg-accent/20 text-accent-foreground',
    citacao: 'bg-destructive/10 text-destructive',
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlayback = () => {
    if (!audioRef.current || !note.audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

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
              onClick={() => navigate({ type: 'note-form', bookId: book.id, noteId: note.id })}
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
                  <AlertDialogTitle>Excluir anotacao?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acao nao pode ser desfeita. A anotacao sera permanentemente removida.
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

      {/* Book context */}
      <div className="px-4 lg:px-8 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div 
            className="w-2 h-10 rounded-full flex-shrink-0"
            style={{ backgroundColor: book.coverColor }}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{book.title}</p>
            <p className="text-xs text-muted-foreground">{book.author}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-xs px-2 py-1 rounded-full font-medium', typeColors[note.type])}>
              {typeLabels[note.type]}
            </span>
            {note.page && (
              <span className="text-xs text-muted-foreground">p. {note.page}</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-8 py-6 flex flex-col gap-6">
        {/* Main content */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
        </div>

        {/* Audio playback */}
        {note.audioUrl && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Audio gravado</h3>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayback}
                className="flex-shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary w-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {note.audioDuration ? formatTime(note.audioDuration) : '0:00'}
                </p>
              </div>
              <audio 
                ref={audioRef} 
                src={note.audioUrl} 
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map(tag => (
                <span 
                  key={tag} 
                  className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Version history */}
        {note.versions.length > 0 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Historico de versoes</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {note.versions.length} versao(oes) anterior(es)
              </span>
            </button>
            {showHistory && (
              <div className="border-t border-border p-4 flex flex-col gap-3">
                <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5">
                  <p className="text-xs font-medium text-primary mb-2">Versao atual</p>
                  <p className="text-sm text-foreground">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Atualizado em {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {note.versions.map(version => (
                  <div key={version.id} className="p-3 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(version.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-muted-foreground">{version.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Criado em {new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
          {note.updatedAt !== note.createdAt && (
            <span>Editado em {new Date(note.updatedAt).toLocaleDateString('pt-BR')}</span>
          )}
        </div>
      </div>
    </div>
  )
}
