"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AiAvatar } from "@/components/interview/ai-avatar"
import { VideoControls } from "@/components/interview/video-controls"
import { ChatTranscript } from "@/components/interview/chat-transcript"
import { CandidateVideo } from "@/components/interview/candidate-video"
import { Play, Square } from "lucide-react"
import { sendAnswer, stopInterview, getVoices } from "@/lib/api"
import type { SpeechRecognition } from "web-speech-api"

interface Message {
  id: string
  type: "ai" | "user"
  content: string
  timestamp: Date
}

interface Question {
  id: string
  text: string
  category: string
}

export default function InterviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const resumeId = searchParams.get("resumeId")

  // Interview state
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [difficulty, setDifficulty] = useState<string>("medium")
  const [selectedVoice, setSelectedVoice] = useState<string>("Monika")
  const [resumeData, setResumeData] = useState<any>(null)

  // Media state
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Transcript state
  const [messages, setMessages] = useState<Message[]>([])
  const [currentTranscript, setCurrentTranscript] = useState("")

  // Audio playback
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Web Speech API support
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Mock questions for demo
  const mockQuestions: Question[] = [
    {
      id: "1",
      text: "Tell me about yourself and your background in software development.",
      category: "general",
    },
    {
      id: "2",
      text: "What experience do you have with React and modern JavaScript frameworks?",
      category: "technical",
    },
    {
      id: "3",
      text: "Describe a challenging project you worked on and how you overcame obstacles.",
      category: "behavioral",
    },
    {
      id: "4",
      text: "How do you stay updated with the latest technology trends?",
      category: "general",
    },
  ]

  useEffect(() => {
    // Load resume data from localStorage
    if (resumeId) {
      const storedResume = localStorage.getItem("resumeData")
      if (storedResume) {
        const parsed = JSON.parse(storedResume)
        setResumeData(parsed)
        setUserName(parsed.id || "User")
      }
    }

    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis

      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true

        recognitionRef.current.onresult = (event: any) => {
          let transcript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          setCurrentTranscript(transcript)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [resumeId])

  const startInterview = async () => {
    if (!resumeId || !resumeData) {
      alert("No resume data found. Please upload a resume first.")
      router.push("/resume")
      return
    }

    try {
      setIsInterviewActive(true)
      setIsProcessing(true)

      // ✅ Call backend to start interview
      const response = await sendAnswer({
        user_name: userName || "User",
        difficulty: difficulty,
        voice_name: selectedVoice,
        resume_data: JSON.stringify(resumeData),
        current_question: "start",
        user_answer: "start",
      })

      if (response.status === "success") {
        setSessionId(response.session_id)
        setCurrentQuestion({
          id: "1",
          text: response.next_question || "Tell me about yourself",
          category: "general",
        })

        // Add AI's first message
        const aiMessage: Message = {
          id: Date.now().toString(),
          type: "ai",
          content: response.next_question || "Tell me about yourself",
          timestamp: new Date(),
        }

        setMessages([aiMessage])

        // ✅ Play audio from backend
        if (response.audio_url) {
          const audio = new Audio(response.audio_url)
          audioRef.current = audio
          setIsSpeaking(true)
          audio.play()
          audio.onended = () => setIsSpeaking(false)
        } else if (response.audio_base64) {
          const audio = new Audio(`data:audio/mp3;base64,${response.audio_base64}`)
          audioRef.current = audio
          setIsSpeaking(true)
          audio.play()
          audio.onended = () => setIsSpeaking(false)
        }
      } else {
        throw new Error(response.message || "Failed to start interview")
      }
    } catch (error) {
      console.error("Failed to start interview:", error)
      alert("Failed to start interview. Please try again.")
      setIsInterviewActive(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const endInterview = async () => {
    if (!sessionId) return

    try {
      setIsInterviewActive(false)
      setIsListening(false)
      setIsSpeaking(false)
      setIsProcessing(true)

      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }

      // ✅ Call backend to stop interview and get final report
      const response = await stopInterview({
        session_id: sessionId,
        user_name: userName,
        difficulty: difficulty,
        role: resumeData?.sections?.experience || "Software Engineer",
      })

      if (response.status === "success") {
        // Add final AI message
        const finalMessage: Message = {
          id: Date.now().toString(),
          type: "ai",
          content:
            "Thank you for completing the interview! Your responses have been recorded and a detailed report has been generated.",
          timestamp: new Date(),
        }

        setMessages((prev: Message[]) => [...prev, finalMessage])

        // Redirect to report page
        setTimeout(() => {
          router.push(`/report/${sessionId}`)
        }, 2000)
      } else {
        throw new Error(response.message || "Failed to finalize interview")
      }
    } catch (error) {
      console.error("Failed to end interview:", error)
      alert("Failed to finalize interview. Redirecting to reports...")
      setTimeout(() => {
        router.push("/reports")
      }, 1000)
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleMic = () => {
    setIsMicOn(!isMicOn)
    if (isMicOn && isListening) {
      stopListening()
    }
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
  }

  const startListening = () => {
    if (!isMicOn || !isInterviewActive) return

    setIsListening(true)
    setCurrentTranscript("")

    if (recognitionRef.current) {
      recognitionRef.current.start()
    } else {
      // Fallback simulation for browsers without speech recognition
      setTimeout(() => {
        setCurrentTranscript("I have been working as a software developer for over 5 years...")
      }, 1000)

      setTimeout(() => {
        setCurrentTranscript(
          "I have been working as a software developer for over 5 years, primarily focusing on web development with React and Node.js. I enjoy solving complex problems and building scalable applications.",
        )
      }, 3000)
    }
  }

  const stopListening = async () => {
    if (!isListening || !sessionId || !currentQuestion) return

    setIsListening(false)
    setIsProcessing(true)

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    // Add user's response to messages
    if (currentTranscript.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: currentTranscript,
        timestamp: new Date(),
      }

      setMessages((prev: Message[]) => [...prev, userMessage])
      setCurrentTranscript("")

      try {
        // ✅ Send answer to backend and get next question
        const response = await sendAnswer({
          session_id: sessionId,
          user_name: userName,
          difficulty: difficulty,
          voice_name: selectedVoice,
          resume_data: JSON.stringify(resumeData),
          current_question: currentQuestion.text,
          user_answer: currentTranscript,
        })

        if (response.status === "success" && response.next_question) {
          // Update current question
          setCurrentQuestion({
            id: (Date.now() + 1).toString(),
            text: response.next_question,
            category: "general",
          })

          const aiMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: "ai",
            content: response.next_question,
            timestamp: new Date(),
          }

          setMessages((prev: Message[]) => [...prev, aiMessage])

          // Play audio response
          if (response.audio_url) {
            const audio = new Audio(response.audio_url)
            audioRef.current = audio
            setIsSpeaking(true)
            audio.play()
            audio.onended = () => setIsSpeaking(false)
          } else if (response.audio_base64) {
            const audio = new Audio(`data:audio/mp3;base64,${response.audio_base64}`)
            audioRef.current = audio
            setIsSpeaking(true)
            audio.play()
            audio.onended = () => setIsSpeaking(false)
          }
        } else if (response.status === "finished") {
          // Interview complete
          endInterview()
        } else {
          throw new Error("Failed to get next question")
        }
      } catch (error) {
        console.error("Error processing answer:", error)
        alert("Failed to process your answer. Please try again.")
      } finally {
        setIsProcessing(false)
      }
    } else {
      setIsProcessing(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">AI Interview</h1>
          <p className="text-muted-foreground">
            {isInterviewActive
              ? currentQuestion ? "Interview in progress" : "Loading next question..."
              : "Ready to start your interview session"}
          </p>
        </div>

        {!isInterviewActive ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Interview Setup</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Make sure your camera and microphone are working properly before starting the interview.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <CandidateVideo isVideoOn={isVideoOn} />
                  <div className="flex flex-col justify-center space-y-4">
                    <VideoControls
                      isMicOn={isMicOn}
                      isVideoOn={isVideoOn}
                      onToggleMic={toggleMic}
                      onToggleVideo={toggleVideo}
                      onEndInterview={() => {}}
                      isInterviewActive={false}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={startInterview} size="lg" className="w-full">
                <Play className="mr-2 h-5 w-5" />
                Start Interview
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Interview Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Avatar */}
              <Card>
                <CardContent className="flex justify-center py-8">
                  <AiAvatar isListening={isListening} isSpeaking={isSpeaking} />
                </CardContent>
              </Card>

              {/* Current Question */}
              {currentQuestion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Question</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{currentQuestion.text}</p>
                  </CardContent>
                </Card>
              )}

              {/* Video Controls */}
              <Card>
                <CardContent className="py-6">
                  <VideoControls
                    isMicOn={isMicOn}
                    isVideoOn={isVideoOn}
                    onToggleMic={toggleMic}
                    onToggleVideo={toggleVideo}
                    onEndInterview={endInterview}
                    isInterviewActive={isInterviewActive}
                  />

                  <div className="mt-6 flex justify-center space-x-4">
                    <Button
                      variant={isListening ? "destructive" : "default"}
                      onClick={isListening ? stopListening : startListening}
                      disabled={!isMicOn}
                    >
                      {isListening ? (
                        <>
                          <Square className="mr-2 h-4 w-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Candidate Video */}
              <CandidateVideo isVideoOn={isVideoOn} />

              {/* Chat Transcript */}
              <ChatTranscript messages={messages} currentTranscript={currentTranscript} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
