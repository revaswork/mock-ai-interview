"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Bot } from "lucide-react"

interface Message {
  id: string
  type: "ai" | "user"
  content: string
  timestamp: Date
}

interface ChatTranscriptProps {
  messages: Message[]
  currentTranscript: string
}

export function ChatTranscript({ messages, currentTranscript }: ChatTranscriptProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Interview Transcript</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 px-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex space-x-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback
                    className={
                      message.type === "ai"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }
                  >
                    {message.type === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {message.type === "ai" ? "AI Interviewer" : "Candidate"}
                    </span>
                    <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Current transcript being typed */}
            {currentTranscript && (
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Candidate</span>
                    <span className="text-xs text-muted-foreground">Speaking...</span>
                  </div>
                  <p className="text-sm text-muted-foreground italic">{currentTranscript}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
