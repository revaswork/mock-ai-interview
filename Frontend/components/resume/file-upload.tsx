"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  selectedFile: File | null
  isUploading: boolean
  uploadError: string | null
}

export function FileUpload({ onFileSelect, onFileRemove, selectedFile, isUploading, uploadError }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
    },
    maxFiles: 1,
    disabled: isUploading,
  })

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <Card
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            isUploading && "opacity-50 cursor-not-allowed",
          )}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <input {...getInputProps()} />
            <Upload className={cn("h-12 w-12 mb-4", isDragActive ? "text-primary" : "text-muted-foreground")} />
            <h3 className="text-lg font-semibold mb-2">{isDragActive ? "Drop your resume here" : "Upload Resume"}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {"Drag and drop your resume here, or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground">{"Supports PDF, DOC, and DOCX files (max 10MB)"}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!isUploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onFileRemove}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {uploadError && (
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{uploadError}</span>
        </div>
      )}
    </div>
  )
}
