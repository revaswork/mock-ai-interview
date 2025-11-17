import { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Send } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { useInterviewStore } from '../store/interviewStore';
import { apiService } from '../services/api';

export const InterviewRoom = ({ onInterviewEnd }: { onInterviewEnd: () => void }) => {
  const [textAnswer, setTextAnswer] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  // No separate audio state - D-ID video has embedded audio
  
  const userVideoRef = useRef<HTMLVideoElement>(null);
  // No audio ref needed - D-ID video plays audio automatically
  
  const {
    sessionId,
    userName,
    difficulty,
    voiceName,
    resume,
    currentQuestion,
    setCurrentQuestion,
    setSessionId,
    addToHistory,
    isLoading,
    setIsLoading,
  } = useInterviewStore();

  // Initialize user webcam
  useEffect(() => {
    if (isVideoOn && userVideoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Error accessing webcam:', err);
          setIsVideoOn(false);
        });
    }

    return () => {
      if (userVideoRef.current && userVideoRef.current.srcObject) {
        const stream = userVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn]);

  // Start interview on mount - use ref to prevent double-call in React Strict Mode
  const hasStartedRef = useRef(false);
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startInterview();
    }
  }, []);

  // ❌ NO separate audio playback - D-ID video already has embedded audio
  // useEffect(() => {
  //   if (audioRef.current) {
  //     if (currentAudioUrl) {
  //       console.log('Playing audio from URL:', currentAudioUrl);
  //       audioRef.current.src = currentAudioUrl;
  //       audioRef.current.play().catch((err) => {
  //         console.error('Error playing audio URL:', err);
  //       });
  //     } else if (currentAudioBase64) {
  //       console.log('Playing audio from base64');
  //       audioRef.current.src = `data:audio/mp3;base64,${currentAudioBase64}`;
  //       audioRef.current.play().catch((err) => {
  //         console.error('Error playing base64 audio:', err);
  //       });
  //     }
  //   }
  // }, [currentAudioUrl, currentAudioBase64]);

  const startInterview = async () => {
    if (!resume) {
      alert('Resume data not found. Please go back and upload your resume.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Initialize interview session and get first question
      const response = await apiService.sendAnswer({
        user_name: userName,
        difficulty,
        resume_data: JSON.stringify(resume),
        current_question: 'start',  // Signal to backend to start interview
        user_answer: 'Ready to begin',  // Initial state
      });

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to start interview');
      }

      setSessionId(response.session_id);
      setCurrentQuestion(response.next_question || 'Please introduce yourself');
      setCurrentVideoUrl(response.video_url || null);
      // No separate audio - D-ID video includes it
    } catch (err: any) {
      console.error('Error starting interview:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to start interview. Please try again.';
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTextAnswer = async () => {
    if (!textAnswer.trim() || !sessionId || !resume) {
      if (!textAnswer.trim()) {
        alert('Please enter your answer before sending.');
      }
      return;
    }

    setIsLoading(true);
    const answer = textAnswer.trim();
    
    try {
      // Add current Q&A to history
      addToHistory({
        question: currentQuestion,
        answer,
        video_url: currentVideoUrl || undefined,
      });

      const response = await apiService.sendAnswer({
        session_id: sessionId,
        user_name: userName,
        difficulty,
        resume_data: JSON.stringify(resume),
        current_question: currentQuestion,
        user_answer: answer,
      });

      if (response.status === 'finished') {
        alert('Interview completed! Preparing your results...');
        onInterviewEnd();
        return;
      }

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to process answer');
      }

      setCurrentQuestion(response.next_question || '');
      setCurrentVideoUrl(response.video_url || null);
      // No separate audio - D-ID video includes it
      setTextAnswer('');
    } catch (err: any) {
      console.error('Error sending answer:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send answer. Please try again.';
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceAnswer = async (audioBlob: Blob) => {
    if (!sessionId || !resume) {
      alert('Session not initialized. Please refresh and try again.');
      return;
    }

    // Validate audio blob has data
    if (!audioBlob || audioBlob.size === 0) {
      alert('No audio recorded. Please try recording again.');
      console.error('Empty audio blob received');
      return;
    }

    console.log('Audio blob size:', audioBlob.size, 'bytes');
    console.log('Audio blob type:', audioBlob.type);

    setIsLoading(true);
    
    try {
      // Convert blob to File
      const audioFile = new File([audioBlob], 'answer.webm', { type: 'audio/webm' });

      // Add current Q&A to history (we don't have transcription yet)
      addToHistory({
        question: currentQuestion,
        answer: '[Voice Answer - Processing...]',
        video_url: currentVideoUrl || undefined,
      });

      const response = await apiService.sendAnswer({
        session_id: sessionId,
        user_name: userName,
        difficulty,
        resume_data: JSON.stringify(resume),
        current_question: currentQuestion,
        audio_file: audioFile,
      });

      if (response.status === 'finished') {
        alert('Interview completed! Preparing your results...');
        onInterviewEnd();
        return;
      }

      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to process voice answer');
      }

      setCurrentQuestion(response.next_question || '');
      setCurrentVideoUrl(response.video_url || null);
      // No separate audio - D-ID video includes it
    } catch (err: any) {
      console.error('Error sending voice answer:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send voice answer. Please try again.';
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (!sessionId) return;

    if (!confirm('Are you sure you want to end the interview?')) return;

    setIsLoading(true);
    try {
      await apiService.stopInterview({
        session_id: sessionId,
        user_name: userName,
        difficulty,
      });

      onInterviewEnd();
    } catch (err) {
      console.error('Error ending interview:', err);
      alert('Failed to end interview properly. Redirecting to results...');
      onInterviewEnd();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* No hidden audio element needed - D-ID video has embedded audio */}

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-900 font-medium">Processing...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">AI Mock Interview</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Session: {sessionId?.slice(0, 8)}...</span>
            <button
              onClick={handleEndInterview}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              End Interview
            </button>
          </div>
        </div>

        {/* Video Grid - Zoom-like layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* AI Interviewer Video */}
          <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
            <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded-full text-sm">
              AI Interviewer - {voiceName}
            </div>
            {currentVideoUrl ? (
              <video
                key={currentVideoUrl}
                src={currentVideoUrl}
                autoPlay
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Video error:', e);
                  // Fallback to placeholder
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-2 text-gray-600" />
                  <p className="text-gray-400">Generating avatar video...</p>
                </div>
              </div>
            )}
          </div>

          {/* User Webcam */}
          <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
            <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded-full text-sm">
              You - {userName}
            </div>
            {isVideoOn ? (
              <video
                ref={userVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <VideoOff className="w-16 h-16 text-gray-600" />
              </div>
            )}
            
            {/* Video controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full transition-colors ${
                  isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Question Display */}
        <div className="card bg-white text-gray-900 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Current Question:</h3>
              {isLoading && !currentQuestion ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Generating question...</span>
                </div>
              ) : (
                <p className="text-lg">{currentQuestion}</p>
              )}
            </div>
          </div>
        </div>

        {/* Answer Input */}
        <div className="card bg-white text-gray-900">
          <h3 className="font-semibold mb-4">Your Answer:</h3>
          
          {/* Text input */}
          <div className="mb-4">
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              disabled={isLoading}
              className="input min-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSendTextAnswer();
                }
              }}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">Press Ctrl+Enter to send</span>
              <button
                onClick={handleSendTextAnswer}
                disabled={!textAnswer.trim() || isLoading}
                className="btn btn-primary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Answer
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-gray-300" />
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Voice recording */}
          <div className="flex justify-center">
            <VoiceRecorder
              onRecordingComplete={handleVoiceAnswer}
              isDisabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
