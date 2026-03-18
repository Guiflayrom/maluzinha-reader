'use client'

import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { BOOK_COLORS } from '@/lib/app-config'
import type { Book, Discipline } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BookFormProps {
  book?: Book
  disciplines: Discipline[]
  onSave: (book: Book) => void
  onBack: () => void
}

export function BookForm({ book, disciplines, onSave, onBack }: BookFormProps) {
  const isEditing = !!book

  const [title, setTitle] = useState(book?.title || '')
  const [author, setAuthor] = useState(book?.author || '')
  const [totalPages, setTotalPages] = useState(book?.totalPages?.toString() || '')
  const [pagesPerBubble, setPagesPerBubble] = useState(book?.pagesPerBubble?.toString() || '5')
  const [isAcademic, setIsAcademic] = useState(book?.isAcademic ?? true)
  const [disciplineId, setDisciplineId] = useState(book?.discipline || '')
  const [coverColor, setCoverColor] = useState(book?.coverColor || BOOK_COLORS[0])
  const [depth, setDepth] = useState<Book['depth']>(book?.depth || 'none')
  const [classWatched, setClassWatched] = useState(book?.classWatched || false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newBook: Book = {
      id: book?.id || `book-${Date.now()}`,
      title,
      author,
      totalPages: parseInt(totalPages) || 0,
      pagesRead: book?.pagesRead || 0,
      pagesPerBubble: parseInt(pagesPerBubble) || 5,
      discipline: isAcademic ? disciplineId || undefined : undefined,
      isAcademic,
      coverColor,
      depth,
      classWatched,
      questions: book?.questions || [],
      notes: book?.notes || [],
      intertextualLinks: book?.intertextualLinks || [],
      readingSessions: book?.readingSessions || [],
      createdAt: book?.createdAt || new Date().toISOString().split('T')[0],
    }

    onSave(newBook)
  }

  const isValid = title.trim() && author.trim() && parseInt(totalPages) > 0

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
            {isEditing ? 'Editar Livro' : 'Novo Livro'}
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 lg:px-8 py-6 flex flex-col gap-6 pb-32">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Titulo *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: O Principe"
            className="bg-card"
          />
        </div>

        {/* Author */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="author">Autor(a) *</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Ex: Maquiavel"
            className="bg-card"
          />
        </div>

        {/* Pages */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="totalPages">Total de paginas *</Label>
            <Input
              id="totalPages"
              type="number"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              placeholder="160"
              className="bg-card"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pagesPerBubble">Paginas por bolinha</Label>
            <Select value={pagesPerBubble} onValueChange={setPagesPerBubble}>
              <SelectTrigger className="bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 paginas</SelectItem>
                <SelectItem value="10">10 paginas</SelectItem>
                <SelectItem value="15">15 paginas</SelectItem>
                <SelectItem value="20">20 paginas</SelectItem>
                <SelectItem value="25">25 paginas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Academic toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div>
            <p className="text-sm font-medium text-foreground">Leitura academica</p>
            <p className="text-xs text-muted-foreground">Associar a uma disciplina da faculdade</p>
          </div>
          <Switch checked={isAcademic} onCheckedChange={setIsAcademic} />
        </div>

        {/* Discipline selector */}
        {isAcademic && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="discipline">Disciplina</Label>
            <Select value={disciplineId} onValueChange={setDisciplineId}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Selecione uma disciplina" />
              </SelectTrigger>
              <SelectContent>
                {disciplines.filter(d => d.professor).map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Color picker */}
        <div className="flex flex-col gap-2">
          <Label>Cor do livro</Label>
          <div className="flex flex-wrap gap-2">
            {BOOK_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setCoverColor(color)}
                className={cn(
                  'w-8 h-8 rounded-full transition-all',
                  coverColor === color && 'ring-2 ring-ring ring-offset-2'
                )}
                style={{ backgroundColor: color }}
              >
                {coverColor === color && (
                  <Check className="w-4 h-4 mx-auto text-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Depth */}
        <div className="flex flex-col gap-2">
          <Label>Nivel de profundidade</Label>
          <div className="grid grid-cols-4 gap-2">
            {(['none', 'shallow', 'medium', 'deep'] as Book['depth'][]).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDepth(d)}
                className={cn(
                  'p-3 rounded-xl border text-center transition-all',
                  depth === d
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                )}
              >
                <span className="text-xs font-medium">
                  {d === 'none' && 'Nenhum'}
                  {d === 'shallow' && 'Superficial'}
                  {d === 'medium' && 'Medio'}
                  {d === 'deep' && 'Aprofundado'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Class watched toggle */}
        {isAcademic && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div>
              <p className="text-sm font-medium text-foreground">Aula ja vista</p>
              <p className="text-xs text-muted-foreground">Ja assisti a aula referente a este texto</p>
            </div>
            <Switch checked={classWatched} onCheckedChange={setClassWatched} />
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
          {isEditing ? 'Salvar alteracoes' : 'Adicionar livro'}
        </Button>
      </div>
    </div>
  )
}
