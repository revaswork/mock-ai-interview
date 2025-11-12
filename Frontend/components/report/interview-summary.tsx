import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, User } from "lucide-react"

interface InterviewSummaryProps {
  sessionId: string
  candidateName?: string
  duration: string
  completedAt: Date
  questionsAnswered: number
  totalQuestions: number
  overallScore: number
}

export function InterviewSummary({
  sessionId,
  candidateName = "Anonymous Candidate",
  duration,
  completedAt,
  questionsAnswered,
  totalQuestions,
  overallScore,
}: InterviewSummaryProps) {
  const getOverallGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", color: "bg-green-600" }
    if (score >= 80) return { grade: "A", color: "bg-green-500" }
    if (score >= 70) return { grade: "B", color: "bg-yellow-500" }
    if (score >= 60) return { grade: "C", color: "bg-yellow-600" }
    return { grade: "D", color: "bg-red-500" }
  }

  const { grade, color } = getOverallGrade(overallScore)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Candidate:</span>
              <span className="font-medium">{candidateName}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Completed:</span>
              <span className="font-medium">{completedAt.toLocaleDateString()}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Duration:</span>
              <span className="font-medium">{duration}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Questions:</span>
              <Badge variant="outline">
                {questionsAnswered}/{totalQuestions} answered
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center mb-2`}>
              <span className="text-2xl font-bold text-white">{grade}</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{overallScore}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
