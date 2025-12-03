'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface EncryptedTextProps {
  text: string
  className?: string
  duration?: number
  characters?: string
  revealDelay?: number
}

export function EncryptedText({
  text,
  className = '',
  duration = 2000,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
  revealDelay = 0
}: EncryptedTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let intervalId: NodeJS.Timeout

    const startAnimation = () => {
      setIsRevealed(false)
      setDisplayText('')

      const textLength = text.length
      const animationDuration = duration
      const frameRate = 60
      const totalFrames = (animationDuration / 1000) * frameRate
      const framesPerChar = totalFrames / textLength

      let currentFrame = 0

      intervalId = setInterval(() => {
        currentFrame++
        
        let newDisplayText = ''
        
        for (let i = 0; i < textLength; i++) {
          const charFrame = i * framesPerChar
          
          if (currentFrame >= charFrame + framesPerChar) {
            // Character is fully revealed
            newDisplayText += text[i]
          } else if (currentFrame >= charFrame) {
            // Character is being animated
            if (text[i] === ' ') {
              newDisplayText += ' '
            } else {
              // Show random character
              const randomChar = characters[Math.floor(Math.random() * characters.length)]
              newDisplayText += randomChar
            }
          } else {
            // Character hasn't started animating yet
            newDisplayText += ' '
          }
        }
        
        setDisplayText(newDisplayText)
        
        if (currentFrame >= totalFrames) {
          clearInterval(intervalId)
          setDisplayText(text)
          setIsRevealed(true)
        }
      }, 1000 / frameRate)
    }

    if (revealDelay > 0) {
      timeoutId = setTimeout(startAnimation, revealDelay)
    } else {
      startAnimation()
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [text, duration, characters, revealDelay])

  return (
    <span 
      className={cn(
        'font-mono transition-all duration-300',
        isRevealed ? 'text-[#F5E4D0]' : 'text-[#F4F4F4]/70',
        className
      )}
    >
      {displayText}
    </span>
  )
}
