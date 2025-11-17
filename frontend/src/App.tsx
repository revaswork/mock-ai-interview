import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ResumeUpload } from './components/ResumeUpload';
import { InterviewSetup } from './components/InterviewSetup';
import { InterviewRoom } from './components/InterviewRoom';
import { Results } from './components/Results';
import { useInterviewStore } from './store/interviewStore';

type AppStage = 'landing' | 'upload' | 'setup' | 'interview' | 'results';

function App() {
  const [stage, setStage] = useState<AppStage>('landing');
  const reset = useInterviewStore((state) => state.reset);

  const handleGetStarted = () => {
    setStage('upload');
  };

  const handleResumeUploaded = () => {
    setStage('setup');
  };

  const handleStartInterview = () => {
    setStage('interview');
  };

  const handleInterviewEnd = () => {
    setStage('results');
  };

  const handleReset = () => {
    reset();
    setStage('landing');
  };

  return (
    <>
      {stage === 'landing' && <LandingPage onGetStarted={handleGetStarted} />}
      {stage === 'upload' && <ResumeUpload onSuccess={handleResumeUploaded} />}
      {stage === 'setup' && <InterviewSetup onStart={handleStartInterview} />}
      {stage === 'interview' && <InterviewRoom onInterviewEnd={handleInterviewEnd} />}
      {stage === 'results' && <Results onReset={handleReset} />}
    </>
  );
}

export default App;
