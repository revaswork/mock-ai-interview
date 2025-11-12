"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { VideoOff, User } from "lucide-react"

interface CandidateVideoProps {
  isVideoOn: boolean
}

export function CandidateVideo({ isVideoOn }: CandidateVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    if (isVideoOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((mediaStream) => {
          setStream(mediaStream)
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
          }
        })
        .catch((error) => {
          console.error("Error accessing camera:", error)
        })
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isVideoOn])

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted">
          {isVideoOn ? (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <VideoOff className="h-12 w-12 mb-2" />
              <p className="text-sm">Camera Off</p>
            </div>
          )}

          {/* Candidate label */}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            <User className="inline h-3 w-3 mr-1" />
            Candidate
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
