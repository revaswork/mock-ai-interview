"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, Phone } from "lucide-react"

interface VideoControlsProps {
  isMicOn: boolean
  isVideoOn: boolean
  onToggleMic: () => void
  onToggleVideo: () => void
  onEndInterview: () => void
  isInterviewActive: boolean
}

export function VideoControls({
  isMicOn,
  isVideoOn,
  onToggleMic,
  onToggleVideo,
  onEndInterview,
  isInterviewActive,
}: VideoControlsProps) {
  return (
    <div className="flex items-center justify-center space-x-4">
      <Button
        variant={isMicOn ? "default" : "destructive"}
        size="lg"
        onClick={onToggleMic}
        className="rounded-full w-14 h-14"
        disabled={!isInterviewActive}
      >
        {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
      </Button>

      <Button
        variant={isVideoOn ? "default" : "destructive"}
        size="lg"
        onClick={onToggleVideo}
        className="rounded-full w-14 h-14"
        disabled={!isInterviewActive}
      >
        {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
      </Button>

      <Button
        variant="destructive"
        size="lg"
        onClick={onEndInterview}
        className="rounded-full w-14 h-14"
        disabled={!isInterviewActive}
      >
        <Phone className="h-6 w-6 rotate-[135deg]" />
      </Button>
    </div>
  )
}
