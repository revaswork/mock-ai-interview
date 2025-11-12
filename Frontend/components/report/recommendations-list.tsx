import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface Recommendation {
  id: string
  type: "strength" | "improvement" | "critical"
  title: string
  description: string
}

interface RecommendationsListProps {
  recommendations: Recommendation[]
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const getIcon = (type: Recommendation["type"]) => {
    switch (type) {
      case "strength":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "improvement":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getBadgeVariant = (type: Recommendation["type"]) => {
    switch (type) {
      case "strength":
        return "default"
      case "improvement":
        return "secondary"
      case "critical":
        return "destructive"
    }
  }

  const getBadgeText = (type: Recommendation["type"]) => {
    switch (type) {
      case "strength":
        return "Strength"
      case "improvement":
        return "Improvement"
      case "critical":
        return "Critical"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="flex space-x-3 p-3 rounded-lg border">
              <div className="flex-shrink-0 mt-0.5">{getIcon(recommendation.type)}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{recommendation.title}</h4>
                  <Badge variant={getBadgeVariant(recommendation.type)}>{getBadgeText(recommendation.type)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{recommendation.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
