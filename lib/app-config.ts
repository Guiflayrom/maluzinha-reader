import type { Achievement, AppSettings, UserStats, WeeklySchedule } from '@/lib/types'

export const BOOK_COLORS = [
  '#8B4513', '#A0522D', '#6B3410', '#4A2808', '#D4A574',
  '#CD853F', '#B8860B', '#DAA520', '#C19A6B', '#8B7355',
  '#556B2F', '#2E4A3E', '#4A6741', '#3B5323',
  '#4A0E0E', '#8B0000', '#722F37', '#5C1A1A',
  '#2C3E50', '#1B3A4B', '#3A506B', '#34495E',
]

export const DEFAULT_WEEKLY_GOAL = 200
export const DEFAULT_READING_MINUTES_PER_PAGE = 2
export const PERSONAL_DISCIPLINE_ID = 'personal-readings'

export function createEmptyStats(): UserStats {
  return {
    currentStreak: 0,
    longestStreak: 0,
    totalPagesRead: 0,
    totalBooksCompleted: 0,
    mentalEnergy: 'medium',
    lastReadDate: '',
    weeklyGoal: DEFAULT_WEEKLY_GOAL,
    weeklyPagesRead: 0,
  }
}

function getWeekStart() {
  const date = new Date()
  const diffToMonday = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - diffToMonday)
  return date.toISOString().split('T')[0]
}

export function createEmptySchedule(): WeeklySchedule {
  return {
    id: 'weekly-schedule',
    weekStart: getWeekStart(),
    entries: [],
  }
}

export function createEmptySettings(): AppSettings {
  return {
    readingMinutesPerPage: DEFAULT_READING_MINUTES_PER_PAGE,
  }
}

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  { id: 'ach-1', title: 'Primeiro Passo', description: 'Leia seu primeiro livro', category: 'reading', icon: '📖', unlocked: false, rarity: 'common' },
  { id: 'ach-2', title: 'Leitor Ávido', description: 'Complete 5 livros', category: 'reading', icon: '📚', unlocked: false, progress: 0, progressMax: 5, rarity: 'uncommon' },
  { id: 'ach-3', title: 'Maratona Literária', description: 'Complete 10 livros', category: 'reading', icon: '🏃', unlocked: false, progress: 0, progressMax: 10, rarity: 'rare' },
  { id: 'ach-4', title: 'Bibliotecário', description: 'Complete 25 livros', category: 'reading', icon: '🏛️', unlocked: false, progress: 0, progressMax: 25, rarity: 'epic' },
  { id: 'ach-5', title: 'Mil Páginas', description: 'Leia 1000 páginas', category: 'reading', icon: '📄', unlocked: false, progress: 0, progressMax: 1000, rarity: 'rare' },
  { id: 'ach-6', title: 'Cinco Mil Páginas', description: 'Leia 5000 páginas', category: 'reading', icon: '✨', unlocked: false, progress: 0, progressMax: 5000, rarity: 'epic' },
  { id: 'ach-7', title: 'Leitura Profunda', description: 'Complete 5 livros profundos (deep)', category: 'reading', icon: '🌊', unlocked: false, progress: 0, progressMax: 5, rarity: 'rare' },
  { id: 'ach-8', title: 'Especialista Acadêmico', description: 'Complete todos os livros de 1 disciplina', category: 'reading', icon: '🎓', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-9', title: 'Fim de Semana de Leitura', description: 'Leia 100 páginas em um único dia', category: 'reading', icon: '☀️', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-10', title: 'Colecionador de Histórias', description: 'Tenha 50 livros adicionados', category: 'reading', icon: '🎁', unlocked: false, progress: 0, progressMax: 50, rarity: 'rare' },
  { id: 'ach-11', title: 'Primeiro Dia', description: 'Mantenha uma leitura em 1 dia', category: 'streak', icon: '🔥', unlocked: false, rarity: 'common' },
  { id: 'ach-12', title: 'Uma Semana de Fogo', description: 'Leia por 7 dias consecutivos', category: 'streak', icon: '🔥🔥', unlocked: false, progress: 0, progressMax: 7, rarity: 'uncommon' },
  { id: 'ach-13', title: 'Duas Semanas Dedicadas', description: 'Leia por 14 dias consecutivos', category: 'streak', icon: '🔥🔥🔥', unlocked: false, progress: 0, progressMax: 14, rarity: 'rare' },
  { id: 'ach-14', title: 'Um Mês de Consistência', description: 'Leia por 30 dias consecutivos', category: 'streak', icon: '🌟', unlocked: false, progress: 0, progressMax: 30, rarity: 'epic' },
  { id: 'ach-15', title: 'Trimestre de Ouro', description: 'Leia por 90 dias consecutivos', category: 'streak', icon: '👑', unlocked: false, progress: 0, progressMax: 90, rarity: 'legendary' },
  { id: 'ach-16', title: 'Volta por Cima', description: 'Recupere uma sequência após interrupção', category: 'streak', icon: '💪', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-17', title: 'Hábito Inabalável', description: 'Mantenha uma sequência de 60 dias', category: 'streak', icon: '🏔️', unlocked: false, progress: 0, progressMax: 60, rarity: 'epic' },
  { id: 'ach-18', title: 'Lenda Viva', description: 'Mantenha uma sequência de 100 dias', category: 'streak', icon: '🦸', unlocked: false, progress: 0, progressMax: 100, rarity: 'legendary' },
  { id: 'ach-19', title: 'Repouso Merecido', description: 'Tenha energia mental "low" e recupere para "peak"', category: 'energy', icon: '😴', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-20', title: 'No Topo', description: 'Mantenha energia "peak" por 7 dias', category: 'energy', icon: '⚡', unlocked: false, progress: 0, progressMax: 7, rarity: 'rare' },
  { id: 'ach-21', title: 'Equilíbrio Perfeito', description: 'Varie entre todos os níveis de energia', category: 'energy', icon: '⚖️', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-22', title: 'Guerreiro Resiliente', description: 'Leia 20+ páginas com energia "low"', category: 'energy', icon: '⛑️', unlocked: false, rarity: 'rare' },
  { id: 'ach-23', title: 'Pico de Produtividade', description: 'Complete meta semanal com energia "peak"', category: 'energy', icon: '🚀', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-24', title: 'Conhecedor de Si Mesmo', description: 'Use o indicador de energia 20 vezes', category: 'energy', icon: '🧠', unlocked: false, progress: 0, progressMax: 20, rarity: 'uncommon' },
  { id: 'ach-25', title: 'Diversidade de Gêneros', description: 'Leia 3 livros de disciplinas diferentes', category: 'variety', icon: '🌈', unlocked: false, progress: 0, progressMax: 3, rarity: 'uncommon' },
  { id: 'ach-26', title: 'Acadêmico e Prazer', description: 'Leia 1 livro acadêmico e 1 pessoal', category: 'variety', icon: '🎭', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-27', title: 'Profundidade Variada', description: 'Leia livros com todos os níveis de profundidade', category: 'variety', icon: '🎨', unlocked: false, rarity: 'rare' },
  { id: 'ach-28', title: 'Especialista Multi-Disciplinar', description: 'Complete livros de 5 disciplinas diferentes', category: 'variety', icon: '🏫', unlocked: false, progress: 0, progressMax: 5, rarity: 'epic' },
  { id: 'ach-29', title: 'Autor Favorito', description: 'Leia 5 livros do mesmo autor', category: 'variety', icon: '✍️', unlocked: false, progress: 0, progressMax: 5, rarity: 'uncommon' },
  { id: 'ach-30', title: 'Coletor de Autores', description: 'Leia livros de 10 autores diferentes', category: 'variety', icon: '🎪', unlocked: false, progress: 0, progressMax: 10, rarity: 'rare' },
  { id: 'ach-31', title: 'Polímate', description: 'Leia 2+ livros de cada categoria de profundidade', category: 'variety', icon: '📡', unlocked: false, rarity: 'epic' },
  { id: 'ach-32', title: 'Explorador Literário', description: 'Adicione 8 livros diferentes de autores diversos', category: 'variety', icon: '🧭', unlocked: false, progress: 0, progressMax: 8, rarity: 'uncommon' },
  { id: 'ach-33', title: 'Primeira Anotação', description: 'Crie sua primeira nota', category: 'notes', icon: '📝', unlocked: false, rarity: 'common' },
  { id: 'ach-34', title: 'Fichador Diligente', description: 'Crie 10 fichamentos', category: 'notes', icon: '📋', unlocked: false, progress: 0, progressMax: 10, rarity: 'uncommon' },
  { id: 'ach-35', title: 'Coletor de Citações', description: 'Crie 5 citações', category: 'notes', icon: '💬', unlocked: false, progress: 0, progressMax: 5, rarity: 'uncommon' },
  { id: 'ach-36', title: 'Pensador Profundo', description: 'Crie 25 anotações variadas', category: 'notes', icon: '💭', unlocked: false, progress: 0, progressMax: 25, rarity: 'rare' },
  { id: 'ach-37', title: 'Primeira Gravação', description: 'Grave seu primeiro áudio em uma nota', category: 'notes', icon: '🎙️', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-38', title: 'Registro Sonoro', description: 'Tenha 5 notas com áudio', category: 'notes', icon: '🎵', unlocked: false, progress: 0, progressMax: 5, rarity: 'rare' },
  { id: 'ach-39', title: 'Rastreador de Dúvidas', description: 'Resolva 10 dúvidas pendentes', category: 'notes', icon: '✅', unlocked: false, progress: 0, progressMax: 10, rarity: 'uncommon' },
  { id: 'ach-40', title: 'Conexões Intelectuais', description: 'Crie 5 links intertextuais', category: 'notes', icon: '🔗', unlocked: false, progress: 0, progressMax: 5, rarity: 'rare' },
  { id: 'ach-41', title: 'Primeira Disciplina', description: 'Adicione sua primeira disciplina', category: 'disciplines', icon: '📘', unlocked: false, rarity: 'common' },
  { id: 'ach-42', title: 'Gerenciador de Cursos', description: 'Gerencie 5 disciplinas', category: 'disciplines', icon: '📚', unlocked: false, progress: 0, progressMax: 5, rarity: 'uncommon' },
  { id: 'ach-43', title: 'Excelência Acadêmica', description: 'Complete 100% de uma disciplina', category: 'disciplines', icon: '🏆', unlocked: false, rarity: 'rare' },
  { id: 'ach-44', title: 'Semestre Produtivo', description: 'Complete 3 disciplinas', category: 'disciplines', icon: '📖', unlocked: false, progress: 0, progressMax: 3, rarity: 'uncommon' },
  { id: 'ach-45', title: 'Resumista Expert', description: 'Escreva resumos de 5 disciplinas', category: 'disciplines', icon: '📄', unlocked: false, progress: 0, progressMax: 5, rarity: 'rare' },
  { id: 'ach-46', title: 'Pesquisador Completo', description: 'Adicione textos suplementares a 10 disciplinas', category: 'disciplines', icon: '🔍', unlocked: false, progress: 0, progressMax: 10, rarity: 'epic' },
  { id: 'ach-47', title: 'Coração Leitor', description: 'Dedique-se à leitura 30 dias seguidos (segredo)', category: 'special', icon: '💖', unlocked: false, progress: 0, progressMax: 30, rarity: 'legendary' },
  { id: 'ach-48', title: 'Noite de Insônia Produtiva', description: 'Leia entre 23:00 e 06:00', category: 'special', icon: '🌙', unlocked: false, rarity: 'rare' },
  { id: 'ach-49', title: 'Madrugada de Leitura', description: 'Leia 5 livros à noite (entre 22:00-06:00)', category: 'special', icon: '🌃', unlocked: false, progress: 0, progressMax: 5, rarity: 'epic' },
  { id: 'ach-50', title: 'Perfeccionista', description: 'Todas as conquistas desbloqueadas (segredo)', category: 'special', icon: '🎯', unlocked: false, progress: 0, progressMax: 49, rarity: 'legendary' },
]
