import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ScoreCardProps {
  title: string
  score: number
  maxScore?: number
  description?: string
  icon?: React.ReactNode
}

export function ScoreCard({ title, score, maxScore = 100, description, icon }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
            {score}
            <span className="text-sm text-muted-foreground">/{maxScore}</span>
          </div>
          <div className={`text-sm font-medium ${getScoreColor(percentage)}`}>{Math.round(percentage)}%</div>
        </div>
        <Progress
          value={percentage}
          className="h-2"
          style={
            {
              "--progress-background": getProgressColor(percentage),
            } as React.CSSProperties
          }
        />
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
      </CardContent>
    </Card>
  )
}
