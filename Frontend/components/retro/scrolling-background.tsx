"use client"

import { useEffect, useState } from "react"

export function ScrollingBackground({ showDecorations = true }: { showDecorations?: boolean }) {
  const [clouds, setClouds] = useState<Array<{ id: number; delay: number; size: "small" | "medium" | "large" }>>([])

  useEffect(() => {
    const cloudArray = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      delay: i * 4,
      size: ["small", "medium", "large"][Math.floor(Math.random() * 3)] as "small" | "medium" | "large",
    }))
    setClouds(cloudArray)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Sky gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-300 via-blue-400 to-blue-500" />

      {/* Pixelated clouds (render only when decorations are enabled) */}
      {showDecorations &&
        clouds.map((cloud) => (
          <div
            key={cloud.id}
            className="absolute cloud-scroll"
            style={{
              top: `${20 + cloud.id * 15}%`,
              animationDelay: `${cloud.delay}s`,
            }}
          >
            <div
              className={`
            bg-transparent pixel-border
            ${cloud.size === "small" ? "w-16 h-8" : ""}
            ${cloud.size === "medium" ? "w-24 h-12" : ""}
            ${cloud.size === "large" ? "w-32 h-16" : ""}
          `}
            />
          </div>
        ))}
    </div>
  )
}
