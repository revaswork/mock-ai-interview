"use client"

import { useEffect, useState } from "react"

interface FloatingObject {
  id: number
  type: "laptop" | "notepad" | "microphone" | "chair" | "clock"
  x: number
  y: number
  delay: number
}

export function FloatingInterviewObjects() {
  const [objects, setObjects] = useState<FloatingObject[]>([])

  useEffect(() => {
    const objectTypes: FloatingObject["type"][] = ["laptop", "notepad", "microphone", "chair", "clock"]
    const newObjects = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      type: objectTypes[i % objectTypes.length],
      x: Math.random() * 80 + 10, // 10% to 90% of screen width
      y: Math.random() * 60 + 20, // 20% to 80% of screen height
      delay: Math.random() * 3,
    }))
    setObjects(newObjects)
  }, [])

  const renderObject = (obj: FloatingObject) => {
    const baseClasses = "absolute pixel-float pixel-border bg-transparent"

    switch (obj.type) {
      case "laptop":
        return (
          <div className={`${baseClasses} w-16 h-12`}>
            <div className="w-full h-8 bg-gray-800 border-b-2 border-black"></div>
            <div className="w-full h-4 bg-gray-300 flex items-center justify-center">
              <div className="w-8 h-1 bg-black"></div>
            </div>
          </div>
        )
      case "notepad":
        return (
          <div className={`${baseClasses} w-12 h-16 bg-yellow-200`}>
            <div className="w-full h-2 bg-red-500 border-b border-black"></div>
            <div className="p-1 space-y-1">
              <div className="w-8 h-0.5 bg-black"></div>
              <div className="w-6 h-0.5 bg-black"></div>
              <div className="w-7 h-0.5 bg-black"></div>
            </div>
          </div>
        )
      case "microphone":
        return (
          <div className={`${baseClasses} w-8 h-16`}>
            <div className="w-6 h-8 bg-gray-600 rounded-t-full mx-auto border-2 border-black"></div>
            <div className="w-1 h-6 bg-black mx-auto"></div>
            <div className="w-8 h-2 bg-gray-400"></div>
          </div>
        )
      case "chair":
        return (
          <div className={`${baseClasses} w-12 h-16`}>
            <div className="w-10 h-8 bg-blue-600 mx-auto"></div>
            <div className="w-2 h-6 bg-gray-700 mx-auto"></div>
            <div className="w-8 h-2 bg-gray-700 mx-auto"></div>
          </div>
        )
      case "clock":
        return (
          <div className={`${baseClasses} w-12 h-12 bg-white rounded-none`}>
            <div className="w-full h-full relative flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center">
                <div className="text-xs font-bold">12</div>
              </div>
              <div className="absolute w-0.5 h-3 bg-black top-2 left-1/2 transform -translate-x-1/2"></div>
              <div className="absolute w-0.5 h-2 bg-black top-3 left-1/2 transform -translate-x-1/2 rotate-90"></div>
            </div>
          </div>
        )
      default:
        return <div className={`${baseClasses} w-8 h-8`}></div>
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {objects.map((obj) => (
        <div
          key={obj.id}
          className="absolute"
          style={{
            left: `${obj.x}%`,
            top: `${obj.y}%`,
            animationDelay: `${obj.delay}s`,
          }}
        >
          {renderObject(obj)}
        </div>
      ))}
    </div>
  )
}
