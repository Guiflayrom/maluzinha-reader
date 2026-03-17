'use client'

import { useState } from 'react'
import { ArrowLeft, Check, Plus, X } from 'lucide-react'
import type { Book, Discipline } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface DisciplineFormProps {
  discipline?: Discipline
  books: Book[]
  onSave: (discipline: Discipline) => void
  onBack: () => void
}

const DISCIPLINE_COLORS = [
  '#7F6000', '#C41026', '#3D0604', '#DEB069', '#3D2304',
  '#2E4A3E', '#4A6741', '#1B3A4B', '#3A506B', '#722F37',
]

export function DisciplineForm({ discipline, books, onSave, onBack }: DisciplineFormProps) {
  const isEditing = !!discipline

  const [name, setName] = useState(discipline?.name || '')
  const [professor, setProfessor] = useState(discipline?.professor || '')
  const [color, setColor] = useState(discipline?.color || DISCIPLINE_COLORS[0])
  const [syllabus, setSyllabus] = useState(discipline?.syllabus || '')
  const [summary, setSummary] = useState(discipline?.summary || '')
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>(discipline?.bookIds || [])
  const [supplementaryTexts, setSupplementaryTexts] = useState<string[]>(discipline?.supplementaryTexts || [])
  const [newSupplementaryText, setNewSupplementaryText] = useState('')

  // Books not yet associated with another discipline
  const availableBooks = books.filter(b => 
    !b.discipline || b.discipline === discipline?.id || selectedBookIds.includes(b.id)
  )

  const toggleBook = (bookId: string) => {
    setSelectedBookIds(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    )
  }

  const addSupplementaryText = () => {
    if (newSupplementaryText.trim()) {
      setSupplementaryTexts(prev => [...prev, newSupplementaryText.trim()])
      setNewSupplementaryText('')
    }
  }

  const removeSupplementaryText = (index: number) => {
    setSupplementaryTexts(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newDiscipline: Discipline = {
      id: discipline?.id || `disc-${Date.now()}`,
      name,
      professor,
      color,
      bookIds: selectedBookIds,
      syllabus: syllabus || undefined,
      summary: summary || undefined,
      supplementaryTexts,
    }

    onSave(newDiscipline)
  }

  const isValid = name.trim().length > 0

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
            {isEditing ? 'Editar Disciplina' : 'Nova Disciplina'}
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 lg:px-8 py-6 flex flex-col gap-6 pb-32">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nome da disciplina *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Teoria Politica I"
            className="bg-card"
          />
        </div>

        {/* Professor */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="professor">Professor(a)</Label>
          <Input
            id="professor"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            placeholder="Ex: Prof. Dr. Marcos Almeida"
            className="bg-card"
          />
        </div>

        {/* Color picker */}
        <div className="flex flex-col gap-2">
          <Label>Cor da disciplina</Label>
          <div className="flex flex-wrap gap-2">
            {DISCIPLINE_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'w-8 h-8 rounded-full transition-all',
                  color === c && 'ring-2 ring-ring ring-offset-2'
                )}
                style={{ backgroundColor: c }}
              >
                {color === c && (
                  <Check className="w-4 h-4 mx-auto text-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Syllabus */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="syllabus">Programa/Ementa</Label>
          <Textarea
            id="syllabus"
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            placeholder="Descreva o programa da disciplina..."
            className="bg-card min-h-[100px]"
          />
        </div>

        {/* Books selection */}
        <div className="flex flex-col gap-2">
          <Label>Bibliografia associada</Label>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {availableBooks.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3 rounded-lg bg-secondary/50 text-center">
                Nenhum livro disponivel. Adicione livros primeiro.
              </p>
            ) : (
              availableBooks.map(book => {
                const isSelected = selectedBookIds.includes(book.id)
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => toggleBook(book.id)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    )}
                  >
                    <div 
                      className="w-2 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: book.coverColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>
          {selectedBookIds.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedBookIds.length} livro(s) selecionado(s)
            </p>
          )}
        </div>

        {/* Supplementary texts */}
        <div className="flex flex-col gap-2">
          <Label>Textos complementares</Label>
          <div className="flex items-center gap-2">
            <Input
              value={newSupplementaryText}
              onChange={(e) => setNewSupplementaryText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSupplementaryText())}
              placeholder="Ex: Dicionario de Politica - Bobbio"
              className="bg-card flex-1"
            />
            <Button type="button" variant="secondary" onClick={addSupplementaryText}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {supplementaryTexts.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-2">
              {supplementaryTexts.map((text, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50"
                >
                  <span className="text-sm text-foreground flex-1">{text}</span>
                  <button 
                    type="button" 
                    onClick={() => removeSupplementaryText(i)} 
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary (for editing completed disciplines) */}
        {isEditing && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="summary">Resumo geral da disciplina</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Escreva um resumo apos concluir todas as leituras..."
              className="bg-card min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Util para revisar o conteudo apos concluir a disciplina.
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
          {isEditing ? 'Salvar alteracoes' : 'Criar disciplina'}
        </Button>
      </div>
    </div>
  )
}
