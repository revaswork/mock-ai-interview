"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AiAvatarProps {
  isListening: boolean
  isSpeaking: boolean
}

export function AiAvatar({ isListening, isSpeaking }: AiAvatarProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false)

  useEffect(() => {
    if (isSpeaking) {
      setPulseAnimation(true)
      const interval = setInterval(() => {
        setPulseAnimation((prev) => !prev)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setPulseAnimation(false)
    }
  }, [isSpeaking])

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar
          className={cn(
            "w-32 h-32 border-4 transition-all duration-300",
            isListening ? "border-secondary shadow-lg shadow-secondary/20" : "border-primary",
            isSpeaking && pulseAnimation ? "scale-105" : "scale-100",
          )}
        >
          <AvatarFallback
            className={cn(
              "text-2xl font-bold transition-colors duration-300",
              isListening ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground",
            )}
          >
            AI
          </AvatarFallback>
        </Avatar>

        {/* Listening indicator */}
        {isListening && <div className="absolute -inset-2 rounded-full border-2 border-secondary animate-ping" />}

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold">AI Interviewer</p>
        <p className="text-sm text-muted-foreground">
          {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Ready"}
        </p>
      </div>
    </div>
  )
}
