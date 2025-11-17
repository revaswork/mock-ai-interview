import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { useInterviewStore } from '../store/interviewStore';

export const ResumeUpload = ({ onSuccess }: { onSuccess: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const setResume = useInterviewStore((state) => state.setResume);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    setError(null);
    setUploadedFileName(file.name);

    try {
      const resumeData = await apiService.uploadResume(file);
      console.log('✅ Resume data received:', resumeData);
      setResume(resumeData);
      setUploadSuccess(true);
      setTimeout(onSuccess, 800); // Small delay to show success state
    } catch (err: any) {
      console.error('❌ Upload error:', err);
      console.error('Error response:', err.response);
      setUploadSuccess(false);
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to upload resume. Please try again.';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [setResume, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Mock Interview
          </h1>
          <p className="text-gray-600">Upload your resume to get started</p>
        </div>

        <div
          {...getRootProps()}
          className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center">
            {uploadSuccess && !uploading ? (
              <>
                <CheckCircle className="w-16 h-16 text-success mb-4" />
                <p className="text-lg font-medium text-success mb-2">Resume uploaded!</p>
                <p className="text-sm text-gray-600">{uploadedFileName}</p>
                <p className="text-xs text-gray-500 mt-2">Processing and analyzing...</p>
              </>
            ) : uploading ? (
              <>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-lg font-medium mb-2">Processing your resume...</p>
                <p className="text-sm text-gray-500">Parsing content and analyzing with AI</p>
              </>
            ) : (
              <>
                <Upload className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                </p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <div className="flex gap-2 text-xs text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span>Supports PDF and DOCX</span>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Your resume will be analyzed using AI to generate personalized interview questions</p>
        </div>
      </div>
    </div>
  );
};
