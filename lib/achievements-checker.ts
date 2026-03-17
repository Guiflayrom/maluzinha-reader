import type { Book, Discipline, UserStats, Achievement, ReadingSession } from './types'

interface CheckerContext {
  books: Book[]
  disciplines: Discipline[]
  stats: UserStats
  previousEnergy?: UserStats['mentalEnergy']
  energyChangeCount: number
  peakDaysCount: number
  hasHadLowEnergy: boolean
  hasRecoveredFromLow: boolean
}

// Helper to get today's date string
function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// Helper to check if a session is in night hours (22:00-06:00)
function isNightSession(session: ReadingSession): boolean {
  const hour = parseInt(session.timeSlot.split(':')[0], 10)
  return hour >= 22 || hour < 6
}

// Helper to check if a session is in late night hours (23:00-06:00)
function isLateNightSession(session: ReadingSession): boolean {
  const hour = parseInt(session.timeSlot.split(':')[0], 10)
  return hour >= 23 || hour < 6
}

// Helper to count unique authors
function getUniqueAuthors(books: Book[]): string[] {
  return [...new Set(books.map(b => b.author))]
}

// Helper to count books by author
function getBooksByAuthor(books: Book[]): Map<string, number> {
  const map = new Map<string, number>()
  books.forEach(b => {
    map.set(b.author, (map.get(b.author) || 0) + 1)
  })
  return map
}

// Helper to get completed books
function getCompletedBooks(books: Book[]): Book[] {
  return books.filter(b => b.pagesRead >= b.totalPages)
}

// Helper to get total pages read today
function getPagesReadToday(books: Book[]): number {
  const today = getTodayString()
  let total = 0
  books.forEach(book => {
    book.readingSessions.forEach(session => {
      if (session.date === today) {
        total += session.pagesRead
      }
    })
  })
  return total
}

// Main checker function that evaluates all 50 achievements
export function checkAchievements(
  currentAchievements: Achievement[],
  context: CheckerContext
): Achievement[] {
  const { books, disciplines, stats, energyChangeCount, peakDaysCount, hasHadLowEnergy, hasRecoveredFromLow } = context
  const today = getTodayString()
  
  // Calculate derived stats
  const completedBooks = getCompletedBooks(books)
  const totalNotes = books.reduce((acc, b) => acc + b.notes.length, 0)
  const totalQuestions = books.reduce((acc, b) => acc + b.questions.length, 0)
  const resolvedQuestions = books.reduce((acc, b) => acc + b.questions.filter(q => q.resolved).length, 0)
  const totalLinks = books.reduce((acc, b) => acc + b.intertextualLinks.length, 0)
  const fichamentos = books.reduce((acc, b) => acc + b.notes.filter(n => n.type === 'fichamento').length, 0)
  const citacoes = books.reduce((acc, b) => acc + b.notes.filter(n => n.type === 'citacao').length, 0)
  const notesWithAudio = books.reduce((acc, b) => acc + b.notes.filter(n => n.audioUrl).length, 0)
  const deepBooks = books.filter(b => b.depth === 'deep')
  const completedDeepBooks = deepBooks.filter(b => b.pagesRead >= b.totalPages)
  const uniqueAuthors = getUniqueAuthors(books)
  const authorCounts = getBooksByAuthor(books)
  const maxBooksBySameAuthor = Math.max(...Array.from(authorCounts.values()), 0)
  const pagesReadToday = getPagesReadToday(books)
  
  // Get disciplines with books
  const disciplinesWithCompletedBooks = disciplines.filter(d => {
    const discBooks = books.filter(b => b.discipline === d.id)
    return discBooks.length > 0 && discBooks.every(b => b.pagesRead >= b.totalPages)
  })
  
  const disciplinesWithSummary = disciplines.filter(d => d.summary && d.summary.trim().length > 0)
  const disciplinesWithSupplementary = disciplines.filter(d => d.supplementaryTexts.length > 0)
  
  // Get unique disciplines from completed books
  const completedDisciplines = new Set(completedBooks.map(b => b.discipline).filter(Boolean))
  
  // Check depth variety
  const hasNoneDepth = books.some(b => b.depth === 'none')
  const hasShallowDepth = books.some(b => b.depth === 'shallow')
  const hasMediumDepth = books.some(b => b.depth === 'medium')
  const hasDeepDepth = books.some(b => b.depth === 'deep')
  const hasAllDepths = hasNoneDepth && hasShallowDepth && hasMediumDepth && hasDeepDepth
  
  // Check polymata: 2+ books of each depth
  const noneCount = books.filter(b => b.depth === 'none').length
  const shallowCount = books.filter(b => b.depth === 'shallow').length
  const mediumCount = books.filter(b => b.depth === 'medium').length
  const deepCount = books.filter(b => b.depth === 'deep').length
  const isPolymata = noneCount >= 2 && shallowCount >= 2 && mediumCount >= 2 && deepCount >= 2
  
  // Check night readings
  const allSessions = books.flatMap(b => b.readingSessions)
  const nightSessions = allSessions.filter(isNightSession)
  const lateNightSessions = allSessions.filter(isLateNightSession)
  const uniqueNightBooks = new Set(nightSessions.map(s => s.bookId)).size
  
  // Check academic and personal
  const hasAcademic = books.some(b => b.isAcademic)
  const hasPersonal = books.some(b => !b.isAcademic)
  const hasCompletedAcademic = completedBooks.some(b => b.isAcademic)
  const hasCompletedPersonal = completedBooks.some(b => !b.isAcademic)
  
  // Get disciplines read
  const readDisciplines = new Set(books.filter(b => b.pagesRead > 0 && b.discipline).map(b => b.discipline))
  
  // Now update each achievement
  return currentAchievements.map(ach => {
    let shouldUnlock = ach.unlocked
    let progress = ach.progress
    let unlockedDate = ach.unlockedDate
    
    switch (ach.id) {
      // READING (10)
      case 'ach-1': // Primeiro Passo - Leia seu primeiro livro
        if (books.some(b => b.pagesRead > 0)) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-2': // Leitor Avido - Complete 5 livros
        progress = completedBooks.length
        if (completedBooks.length >= 5) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-3': // Maratona Literaria - Complete 10 livros
        progress = completedBooks.length
        if (completedBooks.length >= 10) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-4': // Bibliotecario - Complete 25 livros
        progress = completedBooks.length
        if (completedBooks.length >= 25) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-5': // Mil Paginas - Leia 1000 paginas
        progress = stats.totalPagesRead
        if (stats.totalPagesRead >= 1000) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-6': // Cinco Mil Paginas - Leia 5000 paginas
        progress = stats.totalPagesRead
        if (stats.totalPagesRead >= 5000) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-7': // Leitura Profunda - Leia 5 livros profundos (deep)
        progress = completedDeepBooks.length
        if (completedDeepBooks.length >= 5) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-8': // Especialista Academico - Complete todos os livros de 1 disciplina
        if (disciplinesWithCompletedBooks.length > 0) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-9': // Fim de Semana de Leitura - Leia 100 paginas em um unico dia
        if (pagesReadToday >= 100) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-10': // Colecionador de Historias - Tenha 50 livros adicionados
        progress = books.length
        if (books.length >= 50) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      // STREAK (8)
      case 'ach-11': // Primeiro Dia - Mantenha uma leitura em 1 dia
        if (stats.currentStreak >= 1) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-12': // Uma Semana de Fogo - Leia por 7 dias consecutivos
        progress = stats.currentStreak
        if (stats.currentStreak >= 7 || stats.longestStreak >= 7) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-13': // Duas Semanas Dedicadas - Leia por 14 dias consecutivos
        progress = stats.currentStreak
        if (stats.currentStreak >= 14 || stats.longestStreak >= 14) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-14': // Um Mes de Consistencia - Leia por 30 dias consecutivos
        progress = stats.currentStreak
        if (stats.currentStreak >= 30 || stats.longestStreak >= 30) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-15': // Trimestre de Ouro - Leia por 90 dias consecutivos
        progress = stats.currentStreak
        if (stats.currentStreak >= 90 || stats.longestStreak >= 90) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-16': // Volta por Cima - Recupere uma sequencia apos interrupcao
        // This requires tracking if user had a streak, lost it, and got it back
        if (stats.longestStreak > stats.currentStreak && stats.currentStreak >= 3) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-17': // Habito Inabalavel - Mantenha uma sequencia de 60 dias
        progress = stats.currentStreak
        if (stats.currentStreak >= 60 || stats.longestStreak >= 60) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-18': // Lenda Viva - Mantenha uma sequencia de 100 dias
        progress = stats.currentStreak
        if (stats.currentStreak >= 100 || stats.longestStreak >= 100) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      // ENERGY (6)
      case 'ach-19': // Repouso Merecido - Tenha energia mental "low" e recupere para "peak"
        if (hasHadLowEnergy && stats.mentalEnergy === 'peak') {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-20': // No Topo - Mantenha energia "peak" por 7 dias
        progress = peakDaysCount
        if (peakDaysCount >= 7) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-21': // Equilibrio Perfeito - Varie entre todos os niveis de energia
        // Track in context if all energy levels have been used
        if (energyChangeCount >= 4) { // Approximate: changed energy at least 4 times
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-22': // Guerreiro Resiliente - Leia 20+ paginas com energia "low"
        // Check if today had reading with low energy
        if (stats.mentalEnergy === 'low' && pagesReadToday >= 20) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-23': // Pico de Produtividade - Complete meta semanal com energia "peak"
        if (stats.mentalEnergy === 'peak' && stats.weeklyPagesRead >= stats.weeklyGoal) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-24': // Conhecedor de Si Mesmo - Use o indicador de energia 20 vezes
        progress = energyChangeCount
        if (energyChangeCount >= 20) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      // VARIETY (8)
      case 'ach-25': // Diversidade de Generos - Leia 3 livros de disciplinas diferentes
        progress = readDisciplines.size
        if (readDisciplines.size >= 3) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-26': // Academico e Prazer - Leia 1 livro academico e 1 pessoal
        if ((hasAcademic && hasPersonal) || (hasCompletedAcademic && hasCompletedPersonal)) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-27': // Profundidade Variada - Leia livros com todos os niveis de profundidade
        if (hasAllDepths) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-28': // Especialista Multi-Disciplinar - Complete livros de 5 disciplinas diferentes
        progress = completedDisciplines.size
        if (completedDisciplines.size >= 5) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-29': // Autor Favorito - Leia 5 livros do mesmo autor
        progress = maxBooksBySameAuthor
        if (maxBooksBySameAuthor >= 5) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-30': // Coletor de Autores - Leia livros de 10 autores diferentes
        progress = uniqueAuthors.length
        if (uniqueAuthors.length >= 10) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-31': // Polimata - Leia 2+ livros de cada categoria de profundidade
        if (isPolymata) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-32': // Explorador Literario - Adicione 8 livros diferentes de autores diversos
        progress = uniqueAuthors.length
        if (uniqueAuthors.length >= 8) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      // NOTES & ANNOTATIONS (8)
      case 'ach-33': // Primeira Anotacao - Crie sua primeira nota
        if (totalNotes >= 1) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-34': // Fichador Diligente - Crie 10 fichamentos
        progress = fichamentos
        if (fichamentos >= 10) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-35': // Coletor de Citacoes - Crie 5 citacoes
        progress = citacoes
        if (citacoes >= 5) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-36': // Pensador Profundo - Crie 25 anotacoes variadas
        progress = totalNotes
        if (totalNotes >= 25) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-37': // Primeira Gravacao - Grave seu primeiro audio em uma nota
        if (notesWithAudio >= 1) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-38': // Registro Sonoro - Tenha 5 notas com audio
        progress = notesWithAudio
        if (notesWithAudio >= 5) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-39': // Rastreador de Duvidas - Resolva 10 duvidas pendentes
        progress = resolvedQuestions
        if (resolvedQuestions >= 10) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-40': // Conexoes Intelectuais - Crie 5 links intertextuais
        progress = totalLinks
        if (totalLinks >= 5) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      // DISCIPLINES (6)
      case 'ach-41': // Primeira Disciplina - Adicione sua primeira disciplina
        if (disciplines.length >= 1) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-42': // Gerenciador de Cursos - Gerencie 5 disciplinas
        progress = disciplines.length
        if (disciplines.length >= 5) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-43': // Excelencia Academica - Complete 100% de uma disciplina
        if (disciplinesWithCompletedBooks.length >= 1) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-44': // Semestre Produtivo - Complete 3 disciplinas
        progress = disciplinesWithCompletedBooks.length
        if (disciplinesWithCompletedBooks.length >= 3) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-45': // Resumista Expert - Escreva resumos de 5 disciplinas
        progress = disciplinesWithSummary.length
        if (disciplinesWithSummary.length >= 5) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-46': // Pesquisador Completo - Adicione textos suplementares a 10 disciplinas
        progress = disciplinesWithSupplementary.length
        if (disciplinesWithSupplementary.length >= 10) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      // SPECIAL (4)
      case 'ach-47': // Coracao Leitor - Dedique-se a leitura 30 dias seguidos (segredo)
        progress = stats.currentStreak
        if (stats.currentStreak >= 30 || stats.longestStreak >= 30) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-48': // Noite de Insonia Produtiva - Leia entre 23:00 e 06:00
        if (lateNightSessions.length > 0) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-49': // Madrugada de Leitura - Leia 5 livros a noite (entre 22:00-06:00)
        progress = uniqueNightBooks
        if (uniqueNightBooks >= 5) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
        
      case 'ach-50': // Perfeccionista - Todas as conquistas desbloqueadas (segredo)
        // Count unlocked achievements (excluding this one)
        const unlockedCount = currentAchievements.filter(a => a.unlocked && a.id !== 'ach-50').length
        progress = unlockedCount
        if (unlockedCount >= 49) {
          shouldUnlock = true
          if (!unlockedDate) unlockedDate = today
        }
        break
    }
    
    return {
      ...ach,
      unlocked: shouldUnlock,
      unlockedDate,
      progress,
    }
  })
}

// Initial context values
export function createInitialCheckerContext(): Omit<CheckerContext, 'books' | 'disciplines' | 'stats'> {
  return {
    energyChangeCount: 0,
    peakDaysCount: 0,
    hasHadLowEnergy: false,
    hasRecoveredFromLow: false,
  }
}
