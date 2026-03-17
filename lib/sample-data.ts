import type { Book, Discipline, UserStats, WeeklySchedule, Achievement } from './types'

export const BOOK_COLORS = [
  '#8B4513', '#A0522D', '#6B3410', '#4A2808', '#D4A574',
  '#CD853F', '#B8860B', '#DAA520', '#C19A6B', '#8B7355',
  '#556B2F', '#2E4A3E', '#4A6741', '#3B5323',
  '#4A0E0E', '#8B0000', '#722F37', '#5C1A1A',
  '#2C3E50', '#1B3A4B', '#3A506B', '#34495E',
]

export const sampleDisciplines: Discipline[] = [
  {
    id: 'disc-1',
    name: 'Teoria Politica I',
    professor: 'Prof. Dr. Marcos Almeida',
    color: '#7F6000',
    bookIds: ['book-1', 'book-2', 'book-3'],
    syllabus: 'Estudo das principais correntes de pensamento politico classico e moderno.',
    summary: '',
    supplementaryTexts: ['Dicionario de Politica - Bobbio', 'Manual de Ciencia Politica']
  },
  {
    id: 'disc-2',
    name: 'Metodos em Politica',
    professor: 'Prof. Dra. Carolina Santos',
    color: '#C41026',
    bookIds: ['book-4', 'book-5'],
    syllabus: 'Metodologias de pesquisa aplicadas a ciencia politica.',
    summary: '',
    supplementaryTexts: ['Metodologia Cientifica - Lakatos']
  },
  {
    id: 'disc-3',
    name: 'Sociologia Contemporanea',
    professor: 'Prof. Dr. Rafael Oliveira',
    color: '#3D0604',
    bookIds: ['book-6', 'book-7'],
    syllabus: 'Analise das teorias sociologicas do seculo XX e XXI.',
    summary: '',
    supplementaryTexts: []
  },
  {
    id: 'disc-4',
    name: 'Leituras Pessoais',
    professor: '',
    color: '#DEB069',
    bookIds: ['book-8', 'book-9'],
    syllabus: '',
    summary: '',
    supplementaryTexts: []
  }
]

export const sampleBooks: Book[] = [
  {
    id: 'book-1',
    title: 'O Principe',
    author: 'Maquiavel',
    totalPages: 160,
    pagesRead: 95,
    pagesPerBubble: 5,
    discipline: 'disc-1',
    isAcademic: true,
    coverColor: BOOK_COLORS[0],
    depth: 'deep',
    classWatched: true,
    questions: [
      { id: 'q-1', bookId: 'book-1', text: 'Qual a relacao entre virtude e fortuna?', context: 'Cap. XXV - Discussao sobre o papel da fortuna', page: 130, resolved: false, createdAt: '2026-02-28' }
    ],
    notes: [
      { id: 'n-1', bookId: 'book-1', page: 15, content: 'Maquiavel distingue principados hereditarios dos novos. Os hereditarios sao mais faceis de manter.', originalContent: 'Maquiavel distingue principados hereditarios dos novos.', type: 'fichamento', tags: ['poder', 'principado'], createdAt: '2026-02-20', updatedAt: '2026-02-25', versions: [{ id: 'v-1', content: 'Maquiavel distingue principados hereditarios dos novos.', createdAt: '2026-02-20' }] }
    ],
    intertextualLinks: [
      { id: 'il-1', sourceBookId: 'book-1', targetBookId: 'book-2', targetTitle: 'Leviatao', description: 'Conceito de soberania: Maquiavel pragmatico vs Hobbes contratualista', page: 45 }
    ],
    readingSessions: [
      { id: 'rs-1', bookId: 'book-1', date: '2026-03-01', pagesRead: 15, timeSlot: '07:00', duration: 30 },
      { id: 'rs-2', bookId: 'book-1', date: '2026-02-28', pagesRead: 20, timeSlot: '19:00', duration: 45 },
    ],
    createdAt: '2026-02-01'
  },
  {
    id: 'book-2',
    title: 'Leviatao',
    author: 'Thomas Hobbes',
    totalPages: 480,
    pagesRead: 120,
    pagesPerBubble: 10,
    discipline: 'disc-1',
    isAcademic: true,
    coverColor: BOOK_COLORS[3],
    depth: 'medium',
    classWatched: false,
    questions: [
      { id: 'q-2', bookId: 'book-2', text: 'Como o estado de natureza se relaciona com a fundamentacao do Estado?', context: 'Parte I - Do Homem', page: 80, resolved: false, createdAt: '2026-02-25' }
    ],
    notes: [],
    intertextualLinks: [],
    readingSessions: [
      { id: 'rs-3', bookId: 'book-2', date: '2026-03-01', pagesRead: 10, timeSlot: '14:00', duration: 25 },
    ],
    createdAt: '2026-02-01'
  },
  {
    id: 'book-3',
    title: 'O Contrato Social',
    author: 'Rousseau',
    totalPages: 200,
    pagesRead: 0,
    pagesPerBubble: 5,
    discipline: 'disc-1',
    isAcademic: true,
    coverColor: BOOK_COLORS[10],
    depth: 'none',
    classWatched: false,
    questions: [],
    notes: [],
    intertextualLinks: [],
    readingSessions: [],
    createdAt: '2026-02-01'
  },
  {
    id: 'book-4',
    title: 'Desenho de Pesquisa',
    author: 'King, Keohane & Verba',
    totalPages: 320,
    pagesRead: 180,
    pagesPerBubble: 10,
    discipline: 'disc-2',
    isAcademic: true,
    coverColor: BOOK_COLORS[16],
    depth: 'medium',
    classWatched: true,
    questions: [],
    notes: [],
    intertextualLinks: [],
    readingSessions: [
      { id: 'rs-4', bookId: 'book-4', date: '2026-03-02', pagesRead: 20, timeSlot: '08:00', duration: 40 },
    ],
    createdAt: '2026-02-10'
  },
  {
    id: 'book-5',
    title: 'Metodologia das Ciencias Sociais',
    author: 'Pedro Demo',
    totalPages: 280,
    pagesRead: 50,
    pagesPerBubble: 10,
    discipline: 'disc-2',
    isAcademic: true,
    coverColor: BOOK_COLORS[18],
    depth: 'shallow',
    classWatched: false,
    questions: [],
    notes: [],
    intertextualLinks: [],
    readingSessions: [],
    createdAt: '2026-02-10'
  },
  {
    id: 'book-6',
    title: 'A Etica Protestante',
    author: 'Max Weber',
    totalPages: 300,
    pagesRead: 300,
    pagesPerBubble: 10,
    discipline: 'disc-3',
    isAcademic: true,
    coverColor: BOOK_COLORS[6],
    depth: 'deep',
    classWatched: true,
    questions: [],
    notes: [],
    intertextualLinks: [],
    readingSessions: [],
    createdAt: '2026-01-15'
  },
  {
    id: 'book-7',
    title: 'Economia e Sociedade',
    author: 'Max Weber',
    totalPages: 580,
    pagesRead: 80,
    pagesPerBubble: 10,
    discipline: 'disc-3',
    isAcademic: true,
    coverColor: BOOK_COLORS[8],
    depth: 'shallow',
    classWatched: false,
    questions: [],
    notes: [],
    intertextualLinks: [],
    readingSessions: [],
    createdAt: '2026-02-20'
  },
  {
    id: 'book-8',
    title: '1984',
    author: 'George Orwell',
    totalPages: 328,
    pagesRead: 200,
    pagesPerBubble: 10,
    isAcademic: false,
    coverColor: BOOK_COLORS[14],
    depth: 'medium',
    classWatched: false,
    questions: [],
    notes: [],
    intertextualLinks: [],
    readingSessions: [
      { id: 'rs-5', bookId: 'book-8', date: '2026-03-01', pagesRead: 30, timeSlot: '22:00', duration: 40 },
    ],
    createdAt: '2026-02-14'
  },
  {
    id: 'book-9',
    title: 'O Processo',
    author: 'Franz Kafka',
    totalPages: 250,
    pagesRead: 30,
    pagesPerBubble: 5,
    isAcademic: false,
    coverColor: BOOK_COLORS[20],
    depth: 'none',
    classWatched: false,
    questions: [],
    notes: [],
    intertextualLinks: [],
    readingSessions: [],
    createdAt: '2026-02-20'
  }
]

export const sampleStats: UserStats = {
  currentStreak: 7,
  longestStreak: 14,
  totalPagesRead: 1055,
  totalBooksCompleted: 1,
  mentalEnergy: 'high',
  lastReadDate: '2026-03-02',
  weeklyGoal: 200,
  weeklyPagesRead: 95,
}

export const sampleSchedule: WeeklySchedule = {
  id: 'ws-1',
  weekStart: '2026-03-02',
  entries: [
    { id: 'se-1', bookId: 'book-1', dayOfWeek: 1, timeSlot: '07:00 - 08:00', pagesToRead: 15 },
    { id: 'se-2', bookId: 'book-2', dayOfWeek: 1, timeSlot: '14:00 - 15:30', pagesToRead: 20 },
    { id: 'se-3', bookId: 'book-4', dayOfWeek: 2, timeSlot: '08:00 - 09:30', pagesToRead: 25 },
    { id: 'se-4', bookId: 'book-1', dayOfWeek: 2, timeSlot: '19:00 - 20:00', pagesToRead: 15 },
    { id: 'se-5', bookId: 'book-8', dayOfWeek: 3, timeSlot: '22:00 - 23:00', pagesToRead: 30 },
    { id: 'se-6', bookId: 'book-5', dayOfWeek: 4, timeSlot: '08:00 - 09:00', pagesToRead: 20 },
    { id: 'se-7', bookId: 'book-7', dayOfWeek: 4, timeSlot: '14:00 - 15:00', pagesToRead: 15 },
    { id: 'se-8', bookId: 'book-2', dayOfWeek: 5, timeSlot: '07:00 - 08:30', pagesToRead: 20 },
    { id: 'se-9', bookId: 'book-9', dayOfWeek: 6, timeSlot: '10:00 - 11:00', pagesToRead: 25 },
  ]
}

// 50 ACHIEVEMENTS - Progress will be calculated dynamically by achievements-checker
export const sampleAchievements: Achievement[] = [
  // READING (10)
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

  // STREAK (8)
  { id: 'ach-11', title: 'Primeiro Dia', description: 'Mantenha uma leitura em 1 dia', category: 'streak', icon: '🔥', unlocked: false, rarity: 'common' },
  { id: 'ach-12', title: 'Uma Semana de Fogo', description: 'Leia por 7 dias consecutivos', category: 'streak', icon: '🔥🔥', unlocked: false, progress: 0, progressMax: 7, rarity: 'uncommon' },
  { id: 'ach-13', title: 'Duas Semanas Dedicadas', description: 'Leia por 14 dias consecutivos', category: 'streak', icon: '🔥🔥🔥', unlocked: false, progress: 0, progressMax: 14, rarity: 'rare' },
  { id: 'ach-14', title: 'Um Mês de Consistência', description: 'Leia por 30 dias consecutivos', category: 'streak', icon: '🌟', unlocked: false, progress: 0, progressMax: 30, rarity: 'epic' },
  { id: 'ach-15', title: 'Trimestre de Ouro', description: 'Leia por 90 dias consecutivos', category: 'streak', icon: '👑', unlocked: false, progress: 0, progressMax: 90, rarity: 'legendary' },
  { id: 'ach-16', title: 'Volta por Cima', description: 'Recupere uma sequência após interrupção', category: 'streak', icon: '💪', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-17', title: 'Hábito Inabalável', description: 'Mantenha uma sequência de 60 dias', category: 'streak', icon: '🏔️', unlocked: false, progress: 0, progressMax: 60, rarity: 'epic' },
  { id: 'ach-18', title: 'Lenda Viva', description: 'Mantenha uma sequência de 100 dias', category: 'streak', icon: '🦸', unlocked: false, progress: 0, progressMax: 100, rarity: 'legendary' },

  // ENERGY (6)
  { id: 'ach-19', title: 'Repouso Merecido', description: 'Tenha energia mental "low" e recupere para "peak"', category: 'energy', icon: '😴', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-20', title: 'No Topo', description: 'Mantenha energia "peak" por 7 dias', category: 'energy', icon: '⚡', unlocked: false, progress: 0, progressMax: 7, rarity: 'rare' },
  { id: 'ach-21', title: 'Equilíbrio Perfeito', description: 'Varie entre todos os níveis de energia', category: 'energy', icon: '⚖️', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-22', title: 'Guerreiro Resiliente', description: 'Leia 20+ páginas com energia "low"', category: 'energy', icon: '⛑️', unlocked: false, rarity: 'rare' },
  { id: 'ach-23', title: 'Pico de Produtividade', description: 'Complete meta semanal com energia "peak"', category: 'energy', icon: '🚀', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-24', title: 'Conhecedor de Si Mesmo', description: 'Use o indicador de energia 20 vezes', category: 'energy', icon: '🧠', unlocked: false, progress: 0, progressMax: 20, rarity: 'uncommon' },

  // VARIETY (8)
  { id: 'ach-25', title: 'Diversidade de Gêneros', description: 'Leia 3 livros de disciplinas diferentes', category: 'variety', icon: '🌈', unlocked: false, progress: 0, progressMax: 3, rarity: 'uncommon' },
  { id: 'ach-26', title: 'Acadêmico e Prazer', description: 'Leia 1 livro acadêmico e 1 pessoal', category: 'variety', icon: '🎭', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-27', title: 'Profundidade Variada', description: 'Leia livros com todos os níveis de profundidade', category: 'variety', icon: '🎨', unlocked: false, rarity: 'rare' },
  { id: 'ach-28', title: 'Especialista Multi-Disciplinar', description: 'Complete livros de 5 disciplinas diferentes', category: 'variety', icon: '🏫', unlocked: false, progress: 0, progressMax: 5, rarity: 'epic' },
  { id: 'ach-29', title: 'Autor Favorito', description: 'Leia 5 livros do mesmo autor', category: 'variety', icon: '✍️', unlocked: false, progress: 0, progressMax: 5, rarity: 'uncommon' },
  { id: 'ach-30', title: 'Coletor de Autores', description: 'Leia livros de 10 autores diferentes', category: 'variety', icon: '🎪', unlocked: false, progress: 0, progressMax: 10, rarity: 'rare' },
  { id: 'ach-31', title: 'Polímate', description: 'Leia 2+ livros de cada categoria de profundidade', category: 'variety', icon: '📡', unlocked: false, rarity: 'epic' },
  { id: 'ach-32', title: 'Explorador Literário', description: 'Adicione 8 livros diferentes de autores diversos', category: 'variety', icon: '🧭', unlocked: false, progress: 0, progressMax: 8, rarity: 'uncommon' },

  // NOTES & ANNOTATIONS (8)
  { id: 'ach-33', title: 'Primeira Anotação', description: 'Crie sua primeira nota', category: 'notes', icon: '📝', unlocked: false, rarity: 'common' },
  { id: 'ach-34', title: 'Fichador Diligente', description: 'Crie 10 fichamentos', category: 'notes', icon: '📋', unlocked: false, progress: 0, progressMax: 10, rarity: 'uncommon' },
  { id: 'ach-35', title: 'Coletor de Citações', description: 'Crie 5 citações', category: 'notes', icon: '💬', unlocked: false, progress: 0, progressMax: 5, rarity: 'uncommon' },
  { id: 'ach-36', title: 'Pensador Profundo', description: 'Crie 25 anotações variadas', category: 'notes', icon: '💭', unlocked: false, progress: 0, progressMax: 25, rarity: 'rare' },
  { id: 'ach-37', title: 'Primeira Gravação', description: 'Grave seu primeiro áudio em uma nota', category: 'notes', icon: '🎙️', unlocked: false, rarity: 'uncommon' },
  { id: 'ach-38', title: 'Registro Sonoro', description: 'Tenha 5 notas com áudio', category: 'notes', icon: '🎵', unlocked: false, progress: 0, progressMax: 5, rarity: 'rare' },
  { id: 'ach-39', title: 'Rastreador de Dúvidas', description: 'Resolva 10 dúvidas pendentes', category: 'notes', icon: '✅', unlocked: false, progress: 0, progressMax: 10, rarity: 'uncommon' },
  { id: 'ach-40', title: 'Conexões Intelectuais', description: 'Crie 5 links intertextuais', category: 'notes', icon: '🔗', unlocked: false, progress: 0, progressMax: 5, rarity: 'rare' },

  // DISCIPLINES (6)
  { id: 'ach-41', title: 'Primeira Disciplina', description: 'Adicione sua primeira disciplina', category: 'disciplines', icon: '📖', unlocked: false, rarity: 'common' },
  { id: 'ach-42', title: 'Gerenciador de Cursos', description: 'Gerencie 5 disciplinas', category: 'disciplines', icon: '📚', unlocked: false, progress: 0, progressMax: 5, rarity: 'uncommon' },
  { id: 'ach-43', title: 'Excelência Acadêmica', description: 'Complete 100% de uma disciplina', category: 'disciplines', icon: '🏆', unlocked: false, rarity: 'rare' },
  { id: 'ach-44', title: 'Semestre Produtivo', description: 'Complete 3 disciplinas', category: 'disciplines', icon: '📖', unlocked: false, progress: 0, progressMax: 3, rarity: 'uncommon' },
  { id: 'ach-45', title: 'Resumista Expert', description: 'Escreva resumos de 5 disciplinas', category: 'disciplines', icon: '📄', unlocked: false, progress: 0, progressMax: 5, rarity: 'rare' },
  { id: 'ach-46', title: 'Pesquisador Completo', description: 'Adicione textos suplementares a 10 disciplinas', category: 'disciplines', icon: '🔍', unlocked: false, progress: 0, progressMax: 10, rarity: 'epic' },

  // SPECIAL (4)
  { id: 'ach-47', title: 'Coração Leitor', description: 'Dedique-se à leitura 30 dias seguidos (segredo)', category: 'special', icon: '💖', unlocked: false, progress: 0, progressMax: 30, rarity: 'legendary' },
  { id: 'ach-48', title: 'Noite de Insônia Produtiva', description: 'Leia entre 23:00 e 06:00', category: 'special', icon: '🌙', unlocked: false, rarity: 'rare' },
  { id: 'ach-49', title: 'Madrugada de Leitura', description: 'Leia 5 livros à noite (entre 22:00-06:00)', category: 'special', icon: '🌃', unlocked: false, progress: 0, progressMax: 5, rarity: 'epic' },
  { id: 'ach-50', title: 'Perfeccionista', description: 'Todas as conquistas desbloqueadas (segredo)', category: 'special', icon: '🎯', unlocked: false, progress: 0, progressMax: 49, rarity: 'legendary' },
]
