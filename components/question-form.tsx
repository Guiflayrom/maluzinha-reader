'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Book, Question } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface QuestionFormProps {
  book: Book
  question?: Question
  onSave: (question: Question) => void
  onBack: () => void
}

export function QuestionForm({ book, question, onSave, onBack }: QuestionFormProps) {
  const isEditing = !!question

  const [text, setText] = useState(question?.text || '')
  const [context, setContext] = useState(question?.context || '')
  const [page, setPage] = useState(question?.page?.toString() || '')
  const [resolved, setResolved] = useState(question?.resolved || false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newQuestion: Question = {
      id: question?.id || `q-${Date.now()}`,
      bookId: book.id,
      text,
      context,
      page: page ? parseInt(page) : undefined,
      resolved,
      createdAt: question?.createdAt || new Date().toISOString().split('T')[0],
    }

    onSave(newQuestion)
  }

  const isValid = text.trim().length > 0

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
            {isEditing ? 'Editar Duvida' : 'Nova Duvida'}
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
        {/* Question text */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="text">Qual e a sua duvida? *</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: Qual a relacao entre virtude e fortuna em Maquiavel?"
            className="bg-card min-h-[100px]"
          />
        </div>

        {/* Context */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="context">Contexto da duvida</Label>
          <Textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ex: No capitulo XXV, Maquiavel discute o papel da fortuna..."
            className="bg-card min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground">
            Descreva o contexto para lembrar onde surgiu a duvida
          </p>
        </div>

        {/* Page */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="page">Pagina (opcional)</Label>
          <Input
            id="page"
            type="number"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="Ex: 130"
            className="bg-card w-32"
          />
        </div>

        {/* Resolved toggle */}
        {isEditing && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div>
              <p className="text-sm font-medium text-foreground">Duvida resolvida</p>
              <p className="text-xs text-muted-foreground">Marque quando a duvida for esclarecida na aula</p>
            </div>
            <Switch checked={resolved} onCheckedChange={setResolved} />
          </div>
        )}

        {/* Tip */}
        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <p className="text-sm text-destructive font-medium mb-1">Dica</p>
          <p className="text-xs text-muted-foreground">
            Registre suas duvidas durante a leitura para nao esquecer de perguntar na aula. 
            Elas aparecerao em destaque na tela de disciplinas.
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
          {isEditing ? 'Salvar alteracoes' : 'Registrar duvida'}
        </Button>
      </div>
    </div>
  )
}
