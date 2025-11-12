"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InterviewSummary } from "@/components/report/interview-summary"
import { ScoreCard } from "@/components/report/score-card"
import { RecommendationsList } from "@/components/report/recommendations-list"
import { Download, Share, ArrowLeft } from "lucide-react"
import { Brain, MessageCircle, Award, Users } from "lucide-react"
import Link from "next/link"

interface ReportData {
  sessionId: string
  candidateName: string
  duration: string
  completedAt: Date
  questionsAnswered: number
  totalQuestions: number
  overallScore: number
  scores: {
    confidence: number
    communication: number
    technicalKnowledge: number
    professionalism: number
  }
  recommendations: Array<{
    id: string
    type: "strength" | "improvement" | "critical"
    title: string
    description: string
  }>
}

export default function ReportPage() {
  const params = useParams()
  const sessionId = params.id as string
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadReportData = () => {
      try {
        const storedInterview = localStorage.getItem(`interview-${sessionId}`)

        if (storedInterview) {
          const interviewData = JSON.parse(storedInterview)

          const reportData: ReportData = {
            sessionId,
            candidateName: "John Doe", // Could be extracted from resume data
            duration: "25 minutes", // Could be calculated from timestamps
            completedAt: new Date(interviewData.completedAt),
            questionsAnswered: interviewData.questionsAnswered,
            totalQuestions: interviewData.totalQuestions,
            overallScore: Math.floor(Math.random() * 20) + 75, // Generate score 75-95
            scores: {
              confidence: Math.floor(Math.random() * 20) + 75,
              communication: Math.floor(Math.random() * 20) + 70,
              technicalKnowledge: Math.floor(Math.random() * 20) + 80,
              professionalism: Math.floor(Math.random() * 20) + 75,
            },
            recommendations: [
              {
                id: "1",
                type: "strength",
                title: "Strong Technical Knowledge",
                description:
                  "Demonstrated excellent understanding of React, Node.js, and modern web development practices. Provided detailed examples from previous projects.",
              },
              {
                id: "2",
                type: "strength",
                title: "Clear Communication",
                description:
                  "Articulated thoughts clearly and provided structured responses to behavioral questions. Good use of the STAR method.",
              },
              {
                id: "3",
                type: "improvement",
                title: "Confidence in Presentation",
                description:
                  "Could benefit from speaking with more confidence, especially when discussing achievements. Practice presenting accomplishments more assertively.",
              },
              {
                id: "4",
                type: "improvement",
                title: "Industry Knowledge",
                description:
                  "Consider staying more updated with the latest industry trends and emerging technologies to demonstrate continuous learning.",
              },
            ],
          }

          setReportData(reportData)
        } else {
          const mockReportData: ReportData = {
            sessionId,
            candidateName: "John Doe",
            duration: "25 minutes",
            completedAt: new Date(),
            questionsAnswered: 4,
            totalQuestions: 4,
            overallScore: 82,
            scores: {
              confidence: 85,
              communication: 78,
              technicalKnowledge: 88,
              professionalism: 80,
            },
            recommendations: [
              {
                id: "1",
                type: "strength",
                title: "Strong Technical Knowledge",
                description:
                  "Demonstrated excellent understanding of React, Node.js, and modern web development practices. Provided detailed examples from previous projects.",
              },
              {
                id: "2",
                type: "strength",
                title: "Clear Communication",
                description:
                  "Articulated thoughts clearly and provided structured responses to behavioral questions. Good use of the STAR method.",
              },
              {
                id: "3",
                type: "improvement",
                title: "Confidence in Presentation",
                description:
                  "Could benefit from speaking with more confidence, especially when discussing achievements. Practice presenting accomplishments more assertively.",
              },
              {
                id: "4",
                type: "improvement",
                title: "Industry Knowledge",
                description:
                  "Consider staying more updated with the latest industry trends and emerging technologies to demonstrate continuous learning.",
              },
            ],
          }
          setReportData(mockReportData)
        }
      } catch (error) {
        console.error("Error loading report data:", error)
        setReportData(null)
      } finally {
        setIsLoading(false)
      }
    }

    setTimeout(loadReportData, 1000)
  }, [sessionId])

  const handleDownloadPDF = () => {
    const reportContent = `
Interview Report - ${reportData?.candidateName}
Session ID: ${sessionId}
Overall Score: ${reportData?.overallScore}%
Completed: ${reportData?.completedAt.toLocaleDateString()}

Performance Scores:
- Confidence: ${reportData?.scores.confidence}%
- Communication: ${reportData?.scores.communication}%
- Technical Knowledge: ${reportData?.scores.technicalKnowledge}%
- Professionalism: ${reportData?.scores.professionalism}%

Recommendations:
${reportData?.recommendations.map((rec) => `- ${rec.title}: ${rec.description}`).join("\n")}
    `

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `interview-report-${sessionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Interview Report",
        text: `Interview report for ${reportData?.candidateName}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Report link copied to clipboard!")
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Generating report...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!reportData) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
            <p className="text-muted-foreground mb-6">The requested interview report could not be found.</p>
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Interview Report</h1>
              <p className="text-muted-foreground">Session ID: {sessionId}</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Interview Summary */}
          <InterviewSummary
            sessionId={reportData.sessionId}
            candidateName={reportData.candidateName}
            duration={reportData.duration}
            completedAt={reportData.completedAt}
            questionsAnswered={reportData.questionsAnswered}
            totalQuestions={reportData.totalQuestions}
            overallScore={reportData.overallScore}
          />

          {/* Score Cards */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Performance Scores</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ScoreCard
                title="Confidence"
                score={reportData.scores.confidence}
                description="Self-assurance and composure during responses"
                icon={<Award className="h-4 w-4 text-muted-foreground" />}
              />
              <ScoreCard
                title="Communication"
                score={reportData.scores.communication}
                description="Clarity, structure, and articulation of responses"
                icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
              />
              <ScoreCard
                title="Technical Knowledge"
                score={reportData.scores.technicalKnowledge}
                description="Depth of technical understanding and expertise"
                icon={<Brain className="h-4 w-4 text-muted-foreground" />}
              />
              <ScoreCard
                title="Professionalism"
                score={reportData.scores.professionalism}
                description="Professional demeanor and interview etiquette"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Detailed Analysis</h2>
            <RecommendationsList recommendations={reportData.recommendations} />
          </div>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Based on this interview assessment, here are some recommended next steps:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Schedule a technical deep-dive interview to further assess coding abilities</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Consider a team fit interview with potential colleagues</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Provide feedback to candidate on areas for improvement</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>Review with hiring team for final decision</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
