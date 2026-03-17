'use client'

import { BookOpen, LayoutDashboard, Calendar, StickyNote, GraduationCap, Trophy } from 'lucide-react'
import type { MainTab } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
}

const navItems: { key: MainTab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { key: 'bookshelf', label: 'Estante', icon: BookOpen },
  { key: 'calendar', label: 'Agenda', icon: Calendar },
  { key: 'notes', label: 'Notas', icon: StickyNote },
  { key: 'disciplines', label: 'Materias', icon: GraduationCap },
  { key: 'achievements', label: 'Conquis.', icon: Trophy },
]

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <ul className="flex items-center justify-around px-2 py-2">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.key
          return (
            <li key={item.key}>
              <button
                onClick={() => onTabChange(item.key)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[56px]',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {isActive && (
                  <span className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
