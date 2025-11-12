"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Eye, Download, Calendar } from "lucide-react"
import Link from "next/link"

interface ReportSummary {
  id: string
  candidateName: string
  completedAt: Date
  overallScore: number
  status: "completed" | "in-progress" | "failed"
  duration: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadReports = () => {
      try {
        const storedReports: ReportSummary[] = []

        // Scan localStorage for interview data
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith("interview-")) {
            try {
              const interviewData = JSON.parse(localStorage.getItem(key) || "{}")
              const sessionId = key.replace("interview-", "")

              storedReports.push({
                id: sessionId,
                candidateName: "John Doe", // Could extract from resume data
                completedAt: new Date(interviewData.completedAt || Date.now()),
                overallScore: Math.floor(Math.random() * 20) + 75,
                status: "completed",
                duration: "25 minutes", // Could calculate from timestamps
              })
            } catch (error) {
              console.error("Error parsing interview data:", error)
            }
          }
        }

        // Add some mock data if no stored reports
        if (storedReports.length === 0) {
          const mockReports: ReportSummary[] = [
            {
              id: "mock-session-id",
              candidateName: "John Doe",
              completedAt: new Date(),
              overallScore: 82,
              status: "completed",
              duration: "25 minutes",
            },
            {
              id: "session-2",
              candidateName: "Jane Smith",
              completedAt: new Date(Date.now() - 86400000), // Yesterday
              overallScore: 91,
              status: "completed",
              duration: "28 minutes",
            },
            {
              id: "session-3",
              candidateName: "Mike Johnson",
              completedAt: new Date(Date.now() - 172800000), // 2 days ago
              overallScore: 76,
              status: "completed",
              duration: "22 minutes",
            },
          ]
          setReports(mockReports)
        } else {
          setReports(storedReports.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()))
        }
      } catch (error) {
        console.error("Error loading reports:", error)
        setReports([])
      } finally {
        setIsLoading(false)
      }
    }

    setTimeout(loadReports, 1000)
  }, [])

  const filteredReports = reports.filter((report) =>
    report.candidateName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: ReportSummary["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Reports</h1>
          <p className="text-muted-foreground">View and manage all interview reports and candidate assessments.</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by candidate name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Filter by Date
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No reports found matching your search." : "No interview reports available."}
              </p>
              <Button asChild>
                <Link href="/interview">Start New Interview</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold">{report.candidateName}</h3>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <span>Completed: {report.completedAt.toLocaleDateString()}</span>
                        <span>Duration: {report.duration}</span>
                        {report.status === "completed" && (
                          <span className={`font-medium ${getScoreColor(report.overallScore)}`}>
                            Score: {report.overallScore}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {report.status === "completed" && (
                        <>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                          <Button asChild size="sm">
                            <Link href={`/report/${report.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Report
                            </Link>
                          </Button>
                        </>
                      )}
                      {report.status === "in-progress" && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/interview?sessionId=${report.id}`}>Continue Interview</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
