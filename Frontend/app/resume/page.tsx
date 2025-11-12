"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/resume/file-upload"
import { ParsedResumeDisplay } from "@/components/resume/parsed-resume-display"
import { Loader2, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { uploadResume, type ResumeData } from "@/lib/api"

interface ParsedResumeData {
  skills: string[]
  experience: {
    company: string
    position: string
    duration: string
    description: string
  }[]
}

export default function ResumePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null)
  const [resumeId, setResumeId] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setUploadError(null)
    setParsedData(null)
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setUploadError(null)
    setParsedData(null)
    setResumeId(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadError(null)

    try {
      // ✅ Upload resume to backend
      const resumeData = await uploadResume(selectedFile)

      // Transform backend response to match display format
      const transformedData: ParsedResumeData = {
        skills: resumeData.skills || [],
        experience: [], // Backend doesn't provide structured experience yet
      }

      setParsedData(transformedData)
      setResumeId(resumeData.filename.split(".")[0]) // Use filename as ID

      // Store full resume data in localStorage for interview
      localStorage.setItem(
        "resumeData",
        JSON.stringify({
          id: resumeData.filename.split(".")[0],
          filename: resumeData.filename,
          skills: resumeData.skills,
          sections: resumeData.sections,
          uploadedAt: resumeData.uploaded_at,
        }),
      )
    } catch (error) {
      console.error("Resume upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to process resume")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Resume</h1>
          <p className="text-muted-foreground">
            Upload a candidate's resume to extract skills and experience for the interview.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Upload</CardTitle>
                <CardDescription>Select a PDF or Word document to analyze</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  selectedFile={selectedFile}
                  isUploading={isUploading}
                  uploadError={uploadError}
                />

                {selectedFile && !parsedData && (
                  <div className="mt-6">
                    <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing Resume...
                        </>
                      ) : (
                        "Upload & Analyze Resume"
                      )}
                    </Button>
                  </div>
                )}

                {parsedData && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Resume processed successfully!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Skills and experience have been extracted and are ready for interview.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {parsedData && resumeId && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Ready for Interview</h3>
                    <p className="text-muted-foreground mb-4">
                      The resume has been analyzed. You can now start the interview process.
                    </p>
                    <Button asChild size="lg">
                      <Link href={`/interview?resumeId=${resumeId}`}>
                        Start Interview
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div>
            {parsedData ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Extracted Information</h2>
                <ParsedResumeDisplay data={parsedData} />
              </div>
            ) : (
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">AI Analysis</p>
                      <p className="text-sm text-muted-foreground">
                        Our AI will extract skills, experience, and key information from the resume.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Question Generation</p>
                      <p className="text-sm text-muted-foreground">
                        Interview questions will be tailored based on the candidate's background.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Interview Ready</p>
                      <p className="text-sm text-muted-foreground">
                        Start the interview process with AI-powered assistance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
