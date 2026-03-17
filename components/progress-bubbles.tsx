'use client'

import { cn } from '@/lib/utils'

interface ProgressBubblesProps {
  totalBubbles: number
  filledBubbles: number
  color: string
  pagesPerBubble: number
  onToggle: (index: number) => void
}

export function ProgressBubbles({ totalBubbles, filledBubbles, color, pagesPerBubble, onToggle }: ProgressBubblesProps) {
  const maxDisplay = 60

  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: Math.min(totalBubbles, maxDisplay) }).map((_, i) => {
        const isFilled = i < filledBubbles
        const isNext = i === filledBubbles
        return (
          <button
            key={i}
            onClick={() => onToggle(i)}
            title={`${(i + 1) * pagesPerBubble} paginas`}
            className={cn(
              'w-5 h-5 rounded-full border-2 transition-all duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              isFilled 
                ? 'scale-100' 
                : isNext
                  ? 'border-dashed animate-pulse scale-110'
                  : 'bg-transparent'
            )}
            style={{
              backgroundColor: isFilled ? color : 'transparent',
              borderColor: isFilled ? color : isNext ? color : 'var(--border)',
            }}
          >
            <span className="sr-only">
              {isFilled ? `Pagina ${(i + 1) * pagesPerBubble} lida` : `Marcar pagina ${(i + 1) * pagesPerBubble}`}
            </span>
          </button>
        )
      })}
      {totalBubbles > maxDisplay && (
        <span className="flex items-center text-xs text-muted-foreground pl-1">
          +{totalBubbles - maxDisplay} mais
        </span>
      )}
    </div>
  )
}
