'use client'

import { useState } from 'react'
import { ArrowLeft, Link2 } from 'lucide-react'
import type { Book, IntertextualLink } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface LinkFormProps {
  book: Book
  books: Book[]
  link?: IntertextualLink
  onSave: (link: IntertextualLink) => void
  onBack: () => void
}

export function LinkForm({ book, books, link, onSave, onBack }: LinkFormProps) {
  const isEditing = !!link

  const [targetBookId, setTargetBookId] = useState(link?.targetBookId || '')
  const [targetTitle, setTargetTitle] = useState(link?.targetTitle || '')
  const [description, setDescription] = useState(link?.description || '')
  const [page, setPage] = useState(link?.page?.toString() || '')

  // Other books (exclude current)
  const otherBooks = books.filter(b => b.id !== book.id)

  const handleTargetBookChange = (bookId: string) => {
    setTargetBookId(bookId)
    if (bookId) {
      const target = books.find(b => b.id === bookId)
      if (target) {
        setTargetTitle(target.title)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newLink: IntertextualLink = {
      id: link?.id || `il-${Date.now()}`,
      sourceBookId: book.id,
      targetBookId: targetBookId || undefined,
      targetTitle: targetTitle || 'Texto externo',
      description,
      page: page ? parseInt(page) : undefined,
    }

    onSave(newLink)
  }

  const isValid = description.trim().length > 0 && (targetBookId || targetTitle.trim())

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
            {isEditing ? 'Editar Link' : 'Nova Intertextualidade'}
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Source book context */}
      <div className="px-4 lg:px-8 py-4 border-b border-border">
        <p className="text-xs text-muted-foreground mb-2">Livro de origem</p>
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
        {/* Target book selector */}
        <div className="flex flex-col gap-2">
          <Label>Conectar com</Label>
          <Select value={targetBookId} onValueChange={handleTargetBookChange}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Selecione um livro da estante..." />
            </SelectTrigger>
            <SelectContent>
              {otherBooks.map(b => (
                <SelectItem key={b.id} value={b.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.coverColor }} />
                    <span>{b.title}</span>
                    <span className="text-muted-foreground">- {b.author}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Or external text */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="targetTitle">Ou digite o titulo de um texto externo</Label>
          <Input
            id="targetTitle"
            value={targetTitle}
            onChange={(e) => { setTargetTitle(e.target.value); setTargetBookId('') }}
            placeholder="Ex: Republica de Platao"
            className="bg-card"
            disabled={!!targetBookId}
          />
          <p className="text-xs text-muted-foreground">
            Use para referencias a textos que nao estao na sua estante
          </p>
        </div>

        {/* Connection visualization */}
        {(targetBookId || targetTitle) && (
          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: book.coverColor }} />
              <span className="text-xs font-medium text-foreground">{book.title}</span>
            </div>
            <Link2 className="w-4 h-4 text-primary" />
            <div className="flex items-center gap-2">
              {targetBookId ? (
                <>
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: books.find(b => b.id === targetBookId)?.coverColor }} />
                  <span className="text-xs font-medium text-foreground">{books.find(b => b.id === targetBookId)?.title}</span>
                </>
              ) : (
                <span className="text-xs font-medium text-foreground">{targetTitle}</span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Descricao da conexao *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Ambos discutem o conceito de soberania, mas Maquiavel e pragmatico enquanto Hobbes e contratualista..."
            className="bg-card min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            Explique como os textos se relacionam ou dialogam entre si
          </p>
        </div>

        {/* Page reference */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="page">Pagina de referencia (opcional)</Label>
          <Input
            id="page"
            type="number"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="Ex: 45"
            className="bg-card w-32"
          />
          <p className="text-xs text-muted-foreground">
            Pagina no livro de origem onde identificou a conexao
          </p>
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
          {isEditing ? 'Salvar alteracoes' : 'Criar intertextualidade'}
        </Button>
      </div>
    </div>
  )
}
