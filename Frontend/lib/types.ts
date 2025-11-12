export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

export interface Resume {
  id: string
  userId: string
  filename: string
  skills: string[]
  experience: {
    company: string
    position: string
    duration: string
    description: string
  }[]
  uploadedAt: Date
}

export interface Question {
  id: string
  text: string
  category: "technical" | "behavioral" | "general"
  difficulty: "easy" | "medium" | "hard"
}

export interface Answer {
  id: string
  questionId: string
  sessionId: string
  transcript: string
  audioUrl?: string
  timestamp: Date
}

export interface Session {
  id: string
  userId: string
  resumeId: string
  status: "pending" | "in-progress" | "completed"
  startedAt: Date
  endedAt?: Date
  questions: Question[]
  answers: Answer[]
}

export interface Report {
  id: string
  sessionId: string
  scores: {
    confidence: number
    communication: number
    technicalKnowledge: number
    professionalism: number
  }
  recommendations: string[]
  overallScore: number
  generatedAt: Date
}
