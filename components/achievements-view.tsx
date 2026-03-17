'use client'

import { useState } from 'react'
import { Trophy, Lock, Star, X } from 'lucide-react'
import type { Achievement, AppScreen } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface AchievementsViewProps {
  achievements: Achievement[]
  navigate: (screen: AppScreen) => void
  greetingClicks?: number
}

const rarityColors = {
  common: 'border-gray-400 bg-gray-50 dark:bg-gray-900',
  uncommon: 'border-green-400 bg-green-50 dark:bg-green-900',
  rare: 'border-blue-400 bg-blue-50 dark:bg-blue-900',
  epic: 'border-purple-400 bg-purple-50 dark:bg-purple-900',
  legendary: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900',
}

const rarityBadgeColors = {
  common: 'bg-gray-200 text-gray-800',
  uncommon: 'bg-green-200 text-green-800',
  rare: 'bg-blue-200 text-blue-800',
  epic: 'bg-purple-200 text-purple-800',
  legendary: 'bg-yellow-200 text-yellow-800',
}

const rarityLabels = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Rara',
  epic: 'Épica',
  legendary: 'Lendária',
}

const categoryNames = {
  reading: 'Leitura',
  streak: 'Sequências',
  energy: 'Energia',
  variety: 'Variedade',
  notes: 'Anotações',
  disciplines: 'Disciplinas',
  special: 'Especiais',
}

export function AchievementsView({ achievements, navigate, greetingClicks = 0 }: AchievementsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const categories: Array<Achievement['category'] | 'all'> = ['all', 'reading', 'streak', 'energy', 'variety', 'notes', 'disciplines', 'special']

  if (greetingClicks < 10) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-background via-background to-secondary p-4 lg:p-8 flex flex-col items-center justify-center">
        <Card className="p-8 border-2 border-accent text-center max-w-md">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Conquistas Bloqueadas</h1>
          <p className="text-muted-foreground mb-4">
            Clique no cumprimento no painel de controle 10 vezes para desbloquear suas conquistas!
          </p>
          <p className="text-sm text-accent font-semibold">
            Progresso: {greetingClicks}/10 cliques
          </p>
          <div className="w-full bg-muted rounded-full h-2 mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent to-accent/60 transition-all duration-300"
              style={{ width: `${(greetingClicks / 10) * 100}%` }}
            />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background to-secondary p-4 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-bold text-foreground">Conquistas</h1>
        </div>
        
        <Card className="p-4 border-gold-dark bg-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Progresso Geral</p>
            <span className="text-lg font-bold text-accent">{unlockedCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gold to-red transition-all duration-300"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round((unlockedCount / totalCount) * 100)}% desbloqueadas
          </p>
        </Card>
      </div>

      <div className="mb-6 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 min-w-min">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-accent text-accent-foreground shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {category === 'all' ? 'Todas' : categoryNames[category]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <button
            key={achievement.id}
            onClick={() => setSelectedAchievement(achievement)}
            className={`text-left transition-all hover:shadow-lg cursor-pointer ${
              achievement.unlocked ? 'hover:scale-105' : 'opacity-75 hover:opacity-90'
            }`}
          >
            <Card className={`p-4 border-2 h-full ${rarityColors[achievement.rarity]} ${
              achievement.unlocked ? '' : 'border-dashed'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{achievement.icon}</div>
                {achievement.unlocked ? (
                  <Star className="w-5 h-5 fill-accent text-accent" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <h3 className="font-bold text-foreground mb-1 line-clamp-2">{achievement.title}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{achievement.description}</p>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-1 rounded ${rarityBadgeColors[achievement.rarity]}`}>
                  {rarityLabels[achievement.rarity]}
                </span>
                {achievement.progress !== undefined && achievement.progressMax !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {achievement.progress}/{achievement.progressMax}
                  </span>
                )}
              </div>

              {achievement.progress !== undefined && achievement.progressMax !== undefined && (
                <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gold-dark to-accent transition-all"
                    style={{ width: `${Math.min((achievement.progress / achievement.progressMax) * 100, 100)}%` }}
                  />
                </div>
              )}
            </Card>
          </button>
        ))}
      </div>

      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-xs w-full p-4 border-2 border-accent bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">{selectedAchievement.icon}</div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground leading-tight">{selectedAchievement.title}</h2>
                <div className="flex gap-1 mt-1">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${rarityBadgeColors[selectedAchievement.rarity]}`}>
                    {rarityLabels[selectedAchievement.rarity]}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary text-primary-foreground">
                    {categoryNames[selectedAchievement.category]}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAchievement(null)}
                className="text-muted-foreground hover:text-foreground p-1 self-start"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{selectedAchievement.description}</p>

            {selectedAchievement.unlocked && selectedAchievement.unlockedDate && (
              <p className="text-xs text-foreground mb-3">
                Desbloqueada em {new Date(selectedAchievement.unlockedDate).toLocaleDateString('pt-BR')}
              </p>
            )}

            {selectedAchievement.progress !== undefined && selectedAchievement.progressMax !== undefined && (
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Progresso</p>
                  <span className="text-xs font-bold text-accent">
                    {selectedAchievement.progress}/{selectedAchievement.progressMax}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gold-dark to-accent transition-all"
                    style={{ width: `${Math.min((selectedAchievement.progress / selectedAchievement.progressMax) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={() => setSelectedAchievement(null)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Fechar
            </Button>
          </Card>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-gold-dark text-center">
          <div className="text-3xl font-bold text-accent mb-1">
            {achievements.filter(a => a.unlocked).length}
          </div>
          <p className="text-sm text-muted-foreground">Desbloqueadas</p>
        </Card>
        <Card className="p-4 border-gold-dark text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {achievements.filter(a => !a.unlocked && a.progress && a.progressMax && a.progress > 0).length}
          </div>
          <p className="text-sm text-muted-foreground">Em Progresso</p>
        </Card>
        <Card className="p-4 border-gold-dark text-center">
          <div className="text-3xl font-bold text-wine mb-1">
            {achievements.filter(a => !a.unlocked && (!a.progress || a.progress === 0)).length}
          </div>
          <p className="text-sm text-muted-foreground">Travadas</p>
        </Card>
        <Card className="p-4 border-gold-dark text-center">
          <div className="text-3xl font-bold text-red mb-1">
            {achievements.filter(a => a.rarity === 'legendary').length}
          </div>
          <p className="text-sm text-muted-foreground">Lendarias</p>
        </Card>
      </div>
    </div>
  )
}
