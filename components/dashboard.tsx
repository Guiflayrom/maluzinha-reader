'use client'

import { Flame, Brain, BookOpen, Target, TrendingUp, ChevronRight, Zap, BatteryLow, BatteryMedium, BatteryFull, Sparkles, BarChart3, Clock, Calendar, History } from 'lucide-react'
import type { Book, UserStats, MainTab, AppScreen, EnergyLog } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DashboardProps {
  stats: UserStats
  books: Book[]
  energyLogs: EnergyLog[]
  onSetEnergy: (energy: UserStats['mentalEnergy']) => void
  onNavigate: (tab: MainTab) => void
  navigate: (screen: AppScreen) => void
  greetingClicks?: number
  onGreetingClick?: () => void
}

const energyLevels: { value: UserStats['mentalEnergy']; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'low', label: 'Baixa', icon: BatteryLow, color: 'text-destructive' },
  { value: 'medium', label: 'Média', icon: BatteryMedium, color: 'text-accent' },
  { value: 'high', label: 'Alta', icon: BatteryFull, color: 'text-primary' },
  { value: 'peak', label: 'Máximo', icon: Zap, color: 'text-primary' },
]

export function Dashboard({ stats, books, energyLogs, onSetEnergy, onNavigate, navigate, greetingClicks = 0, onGreetingClick }: DashboardProps) {
  const weeklyProgress = Math.min((stats.weeklyPagesRead / stats.weeklyGoal) * 100, 100)
  const activeBooks = books.filter(b => b.pagesRead > 0 && b.pagesRead < b.totalPages)
  const completedBooks = books.filter(b => b.pagesRead >= b.totalPages)
  const totalQuestions = books.reduce((acc, b) => acc + b.questions.filter(q => !q.resolved).length, 0)

  // Calcular estatisticas de energia
  const energyStats = {
    totalLogs: energyLogs.length,
    pagesPerEnergy: {
      low: 0,
      medium: 0,
      high: 0,
      peak: 0,
    },
    mostProductiveEnergy: 'medium' as UserStats['mentalEnergy'],
  }

  energyLogs.forEach(log => {
    if (log.pagesReadInSession) {
      energyStats.pagesPerEnergy[log.energy] += log.pagesReadInSession
    }
  })

  // Determinar energia mais produtiva
  const maxPages = Math.max(
    energyStats.pagesPerEnergy.low,
    energyStats.pagesPerEnergy.medium,
    energyStats.pagesPerEnergy.high,
    energyStats.pagesPerEnergy.peak
  )
  if (maxPages > 0) {
    if (energyStats.pagesPerEnergy.peak === maxPages) energyStats.mostProductiveEnergy = 'peak'
    else if (energyStats.pagesPerEnergy.high === maxPages) energyStats.mostProductiveEnergy = 'high'
    else if (energyStats.pagesPerEnergy.medium === maxPages) energyStats.mostProductiveEnergy = 'medium'
    else energyStats.mostProductiveEnergy = 'low'
  }

  // Sugerir livros baseado na energia atual
  const getSuggestedBooks = () => {
    const unfinished = books.filter(b => b.pagesRead < b.totalPages)
    
    switch (stats.mentalEnergy) {
      case 'low':
        // Priorizar livros leves (shallow/none) ou com pouco restante
        return unfinished
          .filter(b => b.depth === 'shallow' || b.depth === 'none' || (b.totalPages - b.pagesRead) < 30)
          .slice(0, 2)
      case 'medium':
        // Livros de profundidade media
        return unfinished
          .filter(b => b.depth === 'medium' || b.depth === 'shallow')
          .slice(0, 2)
      case 'high':
      case 'peak':
        // Livros mais profundos e desafiadores
        return unfinished
          .filter(b => b.depth === 'deep' || b.depth === 'medium')
          .slice(0, 2)
      default:
        return unfinished.slice(0, 2)
    }
  }

  const suggestedBooks = getSuggestedBooks()

  // Calcular meta semanal sugerida baseada na energia
  const getSuggestedWeeklyGoal = () => {
    const baseGoal = stats.weeklyGoal
    switch (stats.mentalEnergy) {
      case 'low':
        return Math.round(baseGoal * 0.6)
      case 'medium':
        return Math.round(baseGoal * 0.8)
      case 'high':
        return baseGoal
      case 'peak':
        return Math.round(baseGoal * 1.2)
      default:
        return baseGoal
    }
  }

  const suggestedGoal = getSuggestedWeeklyGoal()
  const goalDifference = suggestedGoal - stats.weeklyGoal

  // Analisar horarios mais produtivos baseado nas sessoes de leitura
  const getProductiveTimeSlots = () => {
    const timeSlotPages: Record<string, number> = { manha: 0, tarde: 0, noite: 0 }
    
    books.forEach(book => {
      book.readingSessions.forEach(session => {
        if (session.timeSlot && timeSlotPages[session.timeSlot] !== undefined) {
          timeSlotPages[session.timeSlot] += session.pagesRead
        }
      })
    })

    const maxSlot = Object.entries(timeSlotPages).reduce((a, b) => 
      timeSlotPages[a[0]] > timeSlotPages[b[0]] ? a : b
    )

    return {
      slots: timeSlotPages,
      best: maxSlot[0],
      bestPages: maxSlot[1]
    }
  }

  const productiveSlots = getProductiveTimeSlots()

  // Ultimos registros de energia para historico
  const recentEnergyLogs = energyLogs.slice(-5).reverse()

  // Get greeting based on timezone
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 lg:px-8 lg:pt-8">
        <h2 
          onClick={onGreetingClick}
          className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight text-balance cursor-pointer hover:text-primary/80 transition-colors active:scale-95 duration-150"
          title={greetingClicks > 0 ? `${greetingClicks}/10 cliques` : 'Clique aqui!'}
        >
          {getGreeting()}, leitor!
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Vamos continuar de onde paramos.
        </p>
      </header>

      <div className="px-4 lg:px-8 flex flex-col gap-4 lg:gap-6 pb-8">
        {/* Streak + Weekly Goal Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {/* Streak Card */}
          <div className="col-span-1 rounded-xl border border-border bg-card p-4 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/20">
              <Flame className="w-6 h-6 text-accent" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.currentStreak}</span>
            <span className="text-xs text-muted-foreground text-center">Dias em ofensiva</span>
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-3 h-3 rounded-full transition-colors',
                    i < Math.min(stats.currentStreak, 7)
                      ? 'bg-accent'
                      : 'bg-border'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="col-span-1 rounded-xl border border-border bg-card p-4 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.weeklyPagesRead}</span>
            <span className="text-xs text-muted-foreground text-center">de {stats.weeklyGoal} pags/semana</span>
            {/* Progress ring */}
            <div className="relative w-10 h-10 mt-1">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle
                  cx="20" cy="20" r="16"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${weeklyProgress} ${100 - weeklyProgress}`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                {Math.round(weeklyProgress)}%
              </span>
            </div>
          </div>

          {/* Total Pages */}
          <div className="col-span-1 rounded-xl border border-border bg-card p-4 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.totalPagesRead}</span>
            <span className="text-xs text-muted-foreground text-center">Páginas lidas no total</span>
          </div>

          {/* Longest Streak */}
          <div className="col-span-1 rounded-xl border border-border bg-card p-4 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.longestStreak}</span>
            <span className="text-xs text-muted-foreground text-center">Maior ofensiva</span>
          </div>
        </div>

        {/* Mental Energy Indicator */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Energia Mental</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {energyLevels.map(level => {
              const Icon = level.icon
              const isActive = stats.mentalEnergy === level.value
              return (
                <button
                  key={level.value}
                  onClick={() => onSetEnergy(level.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200',
                    isActive
                      ? 'border-primary bg-primary/5 scale-105'
                      : 'border-transparent bg-secondary/50 hover:border-border hover:bg-secondary'
                  )}
                >
                  <Icon className={cn('w-6 h-6', isActive ? level.color : 'text-muted-foreground')} />
                  <span className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {level.label}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {stats.mentalEnergy === 'low' && 'Foque em leituras leves ou revisões rápidas.'}
            {stats.mentalEnergy === 'medium' && 'Bom momento para leituras moderadas.'}
            {stats.mentalEnergy === 'high' && 'Ótimo para textos densos e anotações detalhadas!'}
            {stats.mentalEnergy === 'peak' && 'Energia máxima! Hora de enfrentar os textos mais difíceis.'}
          </p>

          {/* Estatisticas de energia (aparece apos alguns registros) */}
          {energyLogs.length >= 3 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Sua produtividade por energia</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'peak'] as const).map(level => {
                  const pages = energyStats.pagesPerEnergy[level]
                  const isMax = level === energyStats.mostProductiveEnergy && maxPages > 0
                  return (
                    <div 
                      key={level}
                      className={cn(
                        'text-center p-2 rounded-lg',
                        isMax ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-secondary/30'
                      )}
                    >
                      <span className={cn(
                        'text-lg font-bold',
                        isMax ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {pages}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">pags</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                {energyLogs.length} registros de energia
              </p>
            </div>
          )}
        </div>

        {/* Sugestao de meta semanal ajustada */}
        {stats.mentalEnergy !== 'high' && goalDifference !== 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Meta sugerida para esta semana</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Baseado na sua energia mental atual ({stats.mentalEnergy === 'low' ? 'baixa' : stats.mentalEnergy === 'medium' ? 'média' : 'máxima'}), sugerimos ajustar sua meta:
            </p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Atual</span>
                <span className="text-lg font-bold text-muted-foreground line-through">{stats.weeklyGoal}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Sugerida</span>
                <span className={cn(
                  'text-lg font-bold',
                  goalDifference < 0 ? 'text-destructive' : 'text-primary'
                )}>
                  {suggestedGoal}
                </span>
              </div>
              <span className={cn(
                'text-xs ml-auto px-2 py-1 rounded-full',
                goalDifference < 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
              )}>
                {goalDifference < 0 ? goalDifference : `+${goalDifference}`} pags
              </span>
            </div>
          </div>
        )}

        {/* Horarios mais produtivos */}
        {productiveSlots.bestPages > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Seus horários mais produtivos</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['manha', 'tarde', 'noite'] as const).map(slot => {
                const pages = productiveSlots.slots[slot]
                const isBest = slot === productiveSlots.best && pages > 0
                const icon = slot === 'manha' ? '🌅' : slot === 'tarde' ? '☀️' : '🌙'
                const label = slot === 'manha' ? 'Manhã' : slot === 'tarde' ? 'Tarde' : 'Noite'
                return (
                  <div 
                    key={slot}
                    className={cn(
                      'text-center p-3 rounded-lg',
                      isBest ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-secondary/30'
                    )}
                  >
                    <span className="text-xl">{icon}</span>
                    <span className={cn(
                      'block text-lg font-bold mt-1',
                      isBest ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {pages}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">{label}</span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Você lê melhor de {productiveSlots.best === 'manha' ? 'manhã' : productiveSlots.best === 'tarde' ? 'tarde' : 'noite'}!
            </p>
          </div>
        )}

        {/* Historico de energia recente */}
        {recentEnergyLogs.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Histórico de energia</h3>
            </div>
            <div className="flex flex-col gap-2">
              {recentEnergyLogs.map((log, index) => {
                const level = energyLevels.find(l => l.value === log.energy)
                const Icon = level?.icon || Zap
                const time = new Date(log.timestamp)
                const timeStr = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                const dateStr = time.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                return (
                  <div 
                    key={log.id}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg',
                      index === 0 ? 'bg-secondary/50' : 'bg-secondary/20'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', level?.color || 'text-muted-foreground')} />
                    <span className="text-xs text-foreground flex-1">{level?.label || log.energy}</span>
                    {log.pagesReadInSession && log.pagesReadInSession > 0 && (
                      <span className="text-xs text-primary font-medium">+{log.pagesReadInSession} pags</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{dateStr} {timeStr}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Sugestoes baseadas na energia */}
        {suggestedBooks.length > 0 && (
          <div className="rounded-xl border border-accent/50 bg-accent/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Sugerido para sua energia</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {stats.mentalEnergy === 'low' && 'Leituras leves para este momento:'}
              {stats.mentalEnergy === 'medium' && 'Boas opções para energia moderada:'}
              {stats.mentalEnergy === 'high' && 'Aproveite para avançar nesses:'}
              {stats.mentalEnergy === 'peak' && 'Desafie-se com estes livros:'}
            </p>
            <div className="flex flex-col gap-2">
              {suggestedBooks.map(book => {
                const progress = Math.round((book.pagesRead / book.totalPages) * 100)
                const remaining = book.totalPages - book.pagesRead
                return (
                  <button
                    key={book.id}
                    onClick={() => navigate({ type: 'book-detail', bookId: book.id })}
                    className="flex items-center gap-3 text-left bg-background/50 hover:bg-background p-3 rounded-lg transition-colors"
                  >
                    <div 
                      className="w-2 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: book.coverColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {remaining} pags restantes ({progress}% completo)
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Active Readings */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Leituras em andamento</h3>
            <button 
              onClick={() => onNavigate('bookshelf')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {activeBooks.slice(0, 4).map(book => {
              const progress = Math.round((book.pagesRead / book.totalPages) * 100)
              return (
                <button 
                  key={book.id} 
                  onClick={() => navigate({ type: 'book-detail', bookId: book.id })}
                  className="flex items-center gap-3 text-left hover:bg-secondary/30 -mx-2 px-2 py-1 rounded-lg transition-colors"
                >
                  {/* Book spine */}
                  <div 
                    className="w-2 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: book.coverColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: book.coverColor }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-8 text-right">{progress}%</span>
                  </div>
                </button>
              )
            })}
            {activeBooks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma leitura em andamento
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Pending Questions */}
          <button 
            onClick={() => onNavigate('notes')}
            className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Duvidas pendentes</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold text-destructive mt-1">{totalQuestions}</p>
            <p className="text-xs text-muted-foreground mt-1">Lembre antes das aulas</p>
          </button>

          {/* Completed Books */}
          <button 
            onClick={() => onNavigate('bookshelf')}
            className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Livros completos</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold text-primary mt-1">{completedBooks.length}</p>
            <p className="text-xs text-muted-foreground mt-1">de {books.length} no total</p>
          </button>
        </div>
      </div>
    </div>
  )
}
