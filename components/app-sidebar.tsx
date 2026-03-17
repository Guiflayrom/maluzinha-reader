'use client'

import { BookOpen, LayoutDashboard, Calendar, StickyNote, GraduationCap, Flame, Trophy } from 'lucide-react'
import type { MainTab, UserStats } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
  stats: UserStats
}

const navItems: { key: MainTab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { key: 'bookshelf', label: 'Estante', icon: BookOpen },
  { key: 'calendar', label: 'Calendario', icon: Calendar },
  { key: 'notes', label: 'Anotacoes', icon: StickyNote },
  { key: 'disciplines', label: 'Disciplinas', icon: GraduationCap },
  { key: 'achievements', label: 'Conquistas', icon: Trophy },
]

export function AppSidebar({ activeTab, onTabChange, stats }: AppSidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary">
          <BookOpen className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-primary tracking-tight">Lektor</h1>
          <p className="text-xs text-sidebar-accent-foreground opacity-70">Planner de Leitura</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.key
            return (
              <li key={item.key}>
                <button
                  onClick={() => onTabChange(item.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Streak footer */}
      <div className="px-4 py-5 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-sidebar-accent/40">
          <Flame className="w-6 h-6 text-sidebar-primary" />
          <div>
            <p className="text-sm font-bold text-sidebar-primary">{stats.currentStreak} dias</p>
            <p className="text-xs text-sidebar-foreground/60">Ofensiva ativa</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
