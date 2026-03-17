'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const loveMessages = [
  'Oiii amorrr, eu te amo!!!!! :D',
  'Você é meu livro favorito de todos os tempos!',
  'Te amar é meu gênero preferido',
  'Você é o melhor plot twist da minha história',
  'Meu coração bateu rate de 100% lendo seu amor',
  'Você é a metáfora mais linda que já vi',
  'Cada dia contigo é um bestseller',
  'Você é meu personagem principal favorito',
  'Te amar é sempre a melhor página para virar',
  'Você fez meu coração ter um final feliz',
  'Se o amor fosse um livro, você seria todas as páginas',
  'Você é meu capítulo favorito da vida',
]

const coupleImages = [
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-L7m0kqHbs5Acbq01p0CoffadEEGHn1.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-icVDWaiQDNjP0PZZ7Ej9z4UlkKRw0K.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KLwZ8VDvoK05rF0dnyWmy76nwAUU4T.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ggiGB0JAgY6gJUjgFWEAwdhy4HanpK.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9EQ9RqYE5KdAxpjzjTfIY0F0hP9ymH.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-CEABaYvvrkMjUJLN2uKkOzy6Gakq3d.png',
]

interface LoveModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoveModal({ isOpen, onClose }: LoveModalProps) {
  const [message, setMessage] = useState('')
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentImage, setCurrentImage] = useState('')

  useEffect(() => {
    if (isOpen && message === '') {
      const randomMessage = loveMessages[Math.floor(Math.random() * loveMessages.length)]
      const randomImage = coupleImages[Math.floor(Math.random() * coupleImages.length)]
      setMessage(randomMessage)
      setCurrentImage(randomImage)
      setIsTyping(true)
      setDisplayedText('')
    }
  }, [isOpen, message])

  useEffect(() => {
    if (!isTyping || displayedText.length === message.length) {
      setIsTyping(false)
      return
    }

    const timer = setTimeout(() => {
      setDisplayedText(prev => prev + message[prev.length])
    }, 50)

    return () => clearTimeout(timer)
  }, [isTyping, displayedText, message])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - não fecha o modal */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative z-10 max-w-md w-full">
        {/* Card with romantic styling */}
        <div className="bg-card rounded-2xl border-2 border-accent p-8 shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Decorative hearts */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-accent/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${20 + Math.random() * 20}px`,
                  animationName: 'float',
                  animationDuration: `${3 + Math.random() * 3}s`,
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                💕
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 text-center space-y-4">
            {/* Couple image */}
            {currentImage && (
              <div className="w-full aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden border-2 border-accent/50 shadow-lg">
                <img 
                  src={currentImage} 
                  alt="Nós dois" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Message with typewriter effect */}
            <div className="space-y-2">
              <p className="text-xl font-bold text-foreground min-h-14 flex items-center justify-center">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={onClose}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 rounded-lg transition-colors duration-200 text-lg"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}
