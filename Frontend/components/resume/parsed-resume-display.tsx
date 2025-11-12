"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Award } from "lucide-react"

interface ParsedResumeData {
  skills: string[]
  experience: {
    company: string
    position: string
    duration: string
    description: string
  }[]
}

interface ParsedResumeDisplayProps {
  data: ParsedResumeData
}

export function ParsedResumeDisplay({ data }: ParsedResumeDisplayProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <span>{"Extracted Skills"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{"No skills extracted"}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span>{"Work Experience"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.experience.length > 0 ? (
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h4 className="font-semibold">{exp.position}</h4>
                    <span className="text-sm text-muted-foreground">{exp.duration}</span>
                  </div>
                  <p className="text-primary font-medium mb-2">{exp.company}</p>
                  <p className="text-sm text-muted-foreground">{exp.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{"No work experience extracted"}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
