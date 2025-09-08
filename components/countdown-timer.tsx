"use client"

import { useState, useEffect } from "react"
import { Play, Zap } from "lucide-react"

interface CountdownTimerProps {
  initialCount: number
  onComplete: () => void
  onTick?: (count: number) => void
  size?: "sm" | "md" | "lg"
  showAnimation?: boolean
}

export function CountdownTimer({
  initialCount,
  onComplete,
  onTick,
  size = "lg",
  showAnimation = true,
}: CountdownTimerProps) {
  const [count, setCount] = useState(initialCount)
  const [isActive, setIsActive] = useState(false)
  const [showPulse, setShowPulse] = useState(false)

  useEffect(() => {
    if (count > 0) {
      setIsActive(true)
      const timer = setTimeout(() => {
        const newCount = count - 1
        setCount(newCount)
        onTick?.(newCount)

        // Trigger pulse animation
        if (showAnimation) {
          setShowPulse(true)
          setTimeout(() => setShowPulse(false), 200)
        }

        // Play sound effect (mock)
        if (newCount > 0 && newCount <= 3) {
          // In a real app, you'd play an actual sound here
          console.log(`[v0] Countdown tick: ${newCount}`)
        }

        if (newCount === 0) {
          setTimeout(() => {
            onComplete()
            setIsActive(false)
          }, 500)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [count, onComplete, onTick, showAnimation])

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-4xl"
      case "md":
        return "text-6xl"
      case "lg":
      default:
        return "text-8xl"
    }
  }

  const getContainerClasses = () => {
    const baseClasses = "font-bold transition-all duration-300"
    const sizeClasses = getSizeClasses()

    if (count === 0) {
      return `${baseClasses} ${sizeClasses} text-accent animate-bounce`
    }

    if (count <= 3) {
      return `${baseClasses} ${sizeClasses} text-destructive ${showPulse ? "scale-110" : "scale-100"}`
    }

    return `${baseClasses} ${sizeClasses} text-primary ${showPulse ? "scale-105" : "scale-100"}`
  }

  if (!isActive && count === 0) {
    return (
      <div className="text-center">
        <div className="text-6xl font-bold text-accent mb-4 animate-pulse">
          <Play className="w-16 h-16 mx-auto mb-2" />
          GO!
        </div>
        <p className="text-muted-foreground text-lg">Race started!</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className={getContainerClasses()}>{count}</div>
      <div className="mt-4">
        {count > 3 && <p className="text-muted-foreground text-lg">Get ready to race...</p>}
        {count <= 3 && count > 0 && (
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-destructive animate-pulse" />
            <p className="text-destructive font-semibold text-lg">Starting soon!</p>
            <Zap className="w-5 h-5 text-destructive animate-pulse" />
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mt-6 w-full max-w-xs mx-auto">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${((initialCount - count) / initialCount) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
