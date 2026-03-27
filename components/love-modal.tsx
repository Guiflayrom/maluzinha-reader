'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const loveMessages = [ 
  'Oiii, amorzinho! Eu adoro você :D',
  'Você deixa qualquer dia mais gostosinho :D',
  'Seu jeitinho é meu conforto favorito, gatinha.',
  'Minha raposinhaaaaaa <3',
  'Com você, tudo fica mais leve e mais bonito.',
  'Você é meu sorriso mais fácil.',
  'Meu coração fica bem calminho com você.',
  'Você é meu cantinho favorito no mundo.',
  'Te olhar sempre deixa meu dia mais fofo.',
  'Com você, até o silêncio vira carinho.',
  'Você faz meu coração se sentir em casa.',
  'Seu abraço combina direitinho comigo.',
  'Meu lugar preferido continua sendo pertinho de você.',
  'Eu te amoooooooooooooooooo, aaaaaaaa, lindaaaa!',
];

const coupleImages = [
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-L7m0kqHbs5Acbq01p0CoffadEEGHn1.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-icVDWaiQDNjP0PZZ7Ej9z4UlkKRw0K.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KLwZ8VDvoK05rF0dnyWmy76nwAUU4T.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ggiGB0JAgY6gJUjgFWEAwdhy4HanpK.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9EQ9RqYE5KdAxpjzjTfIY0F0hP9ymH.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-CEABaYvvrkMjUJLN2uKkOzy6Gakq3d.png',
  'https://i.ibb.co/TBP4qmDT/Whats-App-Image-2026-03-26-at-23-45-32-1.jpg',
  'https://i.ibb.co/tTJpB8F3/Whats-App-Image-2026-03-26-at-23-45-32-3.jpg',
  'https://i.ibb.co/27skWPKn/Whats-App-Image-2026-03-26-at-23-45-32-2.jpg',
  'https://i.ibb.co/1JT5PrCN/Whats-App-Image-2026-03-26-at-23-45-32.jpg',
  'https://i.ibb.co/TxbS5wFL/Whats-App-Image-2026-03-26-at-23-45-33-1.jpg',
  'https://i.ibb.co/r98xqmH/Whats-App-Image-2026-03-26-at-23-45-33-2.jpg',
  'https://i.ibb.co/ymV5qHp6/Whats-App-Image-2026-03-26-at-23-45-33.jpg',
  'https://i.ibb.co/M5J1knS3/Whats-App-Image-2026-03-26-at-23-45-34-1.jpg',
  'https://i.ibb.co/0RkZFzFv/Whats-App-Image-2026-03-26-at-23-45-34-2.jpg',
  'https://i.ibb.co/5ps0JCZ/Whats-App-Image-2026-03-26-at-23-45-34-3.jpg',
  'https://i.ibb.co/qMXJrtpF/Whats-App-Image-2026-03-26-at-23-45-34-4.jpg',
  'https://i.ibb.co/CZJttbt/Whats-App-Image-2026-03-26-at-23-45-34.jpg',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-L7m0kqHbs5Acbq01p0CoffadEEGHn1.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-icVDWaiQDNjP0PZZ7Ej9z4UlkKRw0K.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KLwZ8VDvoK05rF0dnyWmy76nwAUU4T.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ggiGB0JAgY6gJUjgFWEAwdhy4HanpK.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9EQ9RqYE5KdAxpjzjTfIY0F0hP9ymH.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-L7m0kqHbs5Acbq01p0CoffadEEGHn1.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-icVDWaiQDNjP0PZZ7Ej9z4UlkKRw0K.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KLwZ8VDvoK05rF0dnyWmy76nwAUU4T.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ggiGB0JAgY6gJUjgFWEAwdhy4HanpK.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9EQ9RqYE5KdAxpjzjTfIY0F0hP9ymH.png',
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
  const [isImageOpen, setIsImageOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setMessage('')
      setDisplayedText('')
      setIsTyping(false)
      setCurrentImage('')
      setIsImageOpen(false)
      return
    }

    const randomMessage = loveMessages[Math.floor(Math.random() * loveMessages.length)]
    const randomImage = coupleImages[Math.floor(Math.random() * coupleImages.length)]
    setMessage(randomMessage)
    setCurrentImage(randomImage)
    setIsTyping(true)
    setDisplayedText('')
  }, [isOpen])

  useEffect(() => {
    if (!isTyping || displayedText.length === message.length) {
      setIsTyping(false)
      return
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) => prev + message[prev.length])
    }, 50)

    return () => clearTimeout(timer)
  }, [displayedText, isTyping, message])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <div className="relative z-10 max-w-lg w-full">
          <div className="bg-card rounded-2xl border-2 border-accent p-6 shadow-2xl sm:p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

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

            <div className="relative z-10 text-center space-y-4">
              {currentImage && (
                <button
                  type="button"
                  onClick={() => setIsImageOpen(true)}
                  className="mx-auto flex w-full max-w-[280px] flex-col items-center gap-2 rounded-xl border-2 border-accent/50 bg-background/50 p-2 shadow-lg transition-transform hover:scale-[1.01]"
                >
                  <div className="flex max-h-[320px] w-full items-center justify-center overflow-hidden rounded-lg">
                    <img
                      src={currentImage}
                      alt="Nos dois"
                      className="max-h-[320px] h-auto w-auto max-w-full object-contain"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">Clique para ver a foto inteira</span>
                </button>
              )}

              <div className="space-y-2">
                <p className="min-h-16 text-lg font-bold leading-relaxed text-foreground sm:text-xl">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
              </div>

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
            0%,
            100% {
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

      {isImageOpen && currentImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setIsImageOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsImageOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-background/10 p-2 text-white transition-colors hover:bg-background/20"
          >
            <X className="h-6 w-6" />
          </button>

          <img
            src={currentImage}
            alt="Nos dois"
            className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
