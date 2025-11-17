import { useState, useEffect } from 'react';
import { User, Settings, ArrowRight } from 'lucide-react';
import { useInterviewStore } from '../store/interviewStore';
import { apiService } from '../services/api';

interface PresenterInfo {
  status: string;
  message: string;
  presenter: string;
  voice: string;
}

export const InterviewSetup = ({ onStart }: { onStart: () => void }) => {
  const [presenterInfo, setPresenterInfo] = useState<PresenterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  const {
    userName,
    setUserName,
    difficulty,
    setDifficulty,
    voiceName,
    setVoiceName,
    resume,
  } = useInterviewStore();

  useEffect(() => {
    loadPresenterInfo();
    // Auto-fill user name from resume filename if not set
    if (!userName && resume?.filename) {
      const nameFromFile = resume.filename.split('.')[0].replace(/[_-]/g, ' ');
      setUserName(nameFromFile);
    }
  }, []);

  const loadPresenterInfo = async () => {
    try {
      const info = await apiService.getVoices();
      setPresenterInfo(info);
      // Set the default voice name for the store
      if (info && !voiceName) {
        setVoiceName(info.presenter);
      }
    } catch (err) {
      console.error('Error loading presenter info:', err);
    } finally {
      setLoading(false);
    }
  };

  const canStart = userName.trim() && voiceName && resume;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Setup</h1>
          <p className="text-gray-600">Configure your interview preferences</p>
        </div>

        {/* Resume info */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-1">Resume Uploaded</h3>
          <p className="text-sm text-green-700">{resume?.filename}</p>
          <p className="text-xs text-green-600 mt-1">
            {resume?.skills.length} skills detected
          </p>
        </div>

        {/* Name input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            <User className="inline w-4 h-4 mr-1" />
            Your Name
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your full name"
            className="input"
          />
          <p className="text-xs text-gray-500 mt-1">
            Note: Use the same name as your resume filename for best results, or update it to your preferred name
          </p>
        </div>

        {/* Difficulty selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            <Settings className="inline w-4 h-4 mr-1" />
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level as any)}
                className={`py-3 px-4 rounded-lg border-2 font-medium capitalize transition-all ${
                  difficulty === level
                    ? 'border-primary bg-blue-50 text-primary'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Presenter info */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">
            AI Interviewer
          </label>
          {loading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : presenterInfo ? (
            <div className="p-4 rounded-lg border-2 border-primary bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{presenterInfo.presenter}</div>
                  <div className="text-sm text-gray-600">{presenterInfo.message}</div>
                  <div className="text-xs text-gray-500 mt-1">Voice: {presenterInfo.voice}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border-2 border-gray-300 bg-gray-50 text-center text-gray-500">
              Unable to load presenter information
            </div>
          )}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          disabled={!canStart}
          className="btn btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
        >
          Start Interview
          <ArrowRight className="w-5 h-5" />
        </button>

        {!canStart && (
          <p className="text-sm text-gray-500 text-center mt-3">
            Please fill in all fields to continue
          </p>
        )}
      </div>
    </div>
  );
};
