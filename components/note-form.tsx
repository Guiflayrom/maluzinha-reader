'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Mic, MicOff, Play, Pause, Trash2, X } from 'lucide-react'
import type { Book, Note } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface NoteFormProps {
  book: Book
  note?: Note
  onSave: (note: Note) => void
  onBack: () => void
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Nao foi possivel processar o audio gravado.'))
    }

    reader.onerror = () => {
      reject(reader.error ?? new Error('Nao foi possivel processar o audio gravado.'))
    }

    reader.readAsDataURL(blob)
  })
}

export function NoteForm({ book, note, onSave, onBack }: NoteFormProps) {
  const isEditing = !!note

  const [content, setContent] = useState(note?.content || '')
  const [type, setType] = useState<Note['type']>(note?.type || 'anotacao')
  const [page, setPage] = useState(note?.page?.toString() || '')
  const [tags, setTags] = useState<string[]>(note?.tags || [])
  const [tagInput, setTagInput] = useState('')

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | undefined>(note?.audioUrl)
  const [audioDuration, setAudioDuration] = useState<number | undefined>(note?.audioDuration)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const duration = recordingTime

        void blobToDataUrl(audioBlob)
          .then((dataUrl) => {
            setAudioUrl(dataUrl)
            setAudioDuration(duration)
          })
          .catch((error) => {
            console.error('Error processing audio:', error)
            alert('Nao foi possivel processar o audio gravado.')
          })
          .finally(() => {
            stream.getTracks().forEach(track => track.stop())
          })
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Nao foi possivel acessar o microfone. Verifique as permissoes.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    setIsRecording(false)
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const deleteAudio = () => {
    setAudioUrl(undefined)
    setAudioDuration(undefined)
    setIsPlaying(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newNote: Note = {
      id: note?.id || `note-${Date.now()}`,
      bookId: book.id,
      content,
      originalContent: note?.originalContent || (isEditing && note?.content !== content ? note?.content : undefined),
      type,
      page: page ? parseInt(page) : undefined,
      tags,
      audioUrl,
      audioDuration,
      createdAt: note?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      versions: note?.versions || [],
    }

    // Add version history if content changed
    if (isEditing && note && note.content !== content) {
      newNote.versions = [
        ...note.versions,
        { id: `v-${Date.now()}`, content: note.content, createdAt: note.updatedAt }
      ]
    }

    onSave(newNote)
  }

  const isValid = content.trim().length > 0

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
            {isEditing ? 'Editar Anotacao' : 'Nova Anotacao'}
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Book context */}
      <div className="px-4 lg:px-8 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div 
            className="w-2 h-10 rounded-full flex-shrink-0"
            style={{ backgroundColor: book.coverColor }}
          />
          <div>
            <p className="text-sm font-medium text-foreground">{book.title}</p>
            <p className="text-xs text-muted-foreground">{book.author}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 lg:px-8 py-6 flex flex-col gap-6 pb-32">
        {/* Type */}
        <div className="flex flex-col gap-2">
          <Label>Tipo de anotacao</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['fichamento', 'anotacao', 'citacao'] as Note['type'][]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'p-3 rounded-xl border text-center transition-all',
                  type === t
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                )}
              >
                <span className="text-xs font-medium capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Page */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="page">Pagina (opcional)</Label>
          <Input
            id="page"
            type="number"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="Ex: 45"
            className="bg-card w-32"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="content">Conteudo *</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === 'citacao' 
                ? 'Digite a citacao entre aspas...' 
                : type === 'fichamento'
                  ? 'Resuma os principais pontos do texto...'
                  : 'Escreva suas observacoes e reflexoes...'
            }
            className="bg-card min-h-[200px]"
          />
        </div>

        {/* Audio Recording */}
        <div className="flex flex-col gap-2">
          <Label>Audio (opcional)</Label>
          <div className="rounded-xl border border-border bg-card p-4">
            {!audioUrl ? (
              <div className="flex flex-col items-center gap-4">
                {isRecording ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                      <span className="text-lg font-mono text-foreground">{formatTime(recordingTime)}</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={stopRecording}
                      className="w-full"
                    >
                      <MicOff className="w-4 h-4 mr-2" />
                      Parar gravacao
                    </Button>
                  </>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={startRecording}
                    className="w-full"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Gravar audio
                  </Button>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Grave suas reflexoes em voz alta para complementar a anotacao
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  type="button"
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
                    {audioDuration ? formatTime(audioDuration) : '0:00'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={deleteAudio}
                  className="text-destructive hover:text-destructive flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <audio 
                  ref={audioRef} 
                  src={audioUrl} 
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex items-center gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Digite uma tag..."
              className="bg-card flex-1"
            />
            <Button type="button" variant="secondary" onClick={addTag}>
              Adicionar
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Submit button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border lg:left-64">
        <Button 
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          {isEditing ? 'Salvar alteracoes' : 'Criar anotacao'}
        </Button>
      </div>
    </div>
  )
}
