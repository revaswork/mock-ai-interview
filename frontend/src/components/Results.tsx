import { useEffect, useState } from 'react';
import { Download, Home, CheckCircle, TrendingUp } from 'lucide-react';
import { useInterviewStore } from '../store/interviewStore';
import { apiService } from '../services/api';
import jsPDF from 'jspdf';

export const Results = ({ onReset }: { onReset: () => void }) => {
  const [loading, setLoading] = useState(true);
  const {
    sessionId,
    userName,
    difficulty,
    evaluation,
    setEvaluation,
    roadmap,
    setRoadmap,
    conversationHistory,
  } = useInterviewStore();

  useEffect(() => {
    if (!evaluation || !roadmap) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchResults = async () => {
    if (!sessionId) return;

    try {
      const results = await apiService.stopInterview({
        session_id: sessionId,
        user_name: userName,
        difficulty,
      });

      setEvaluation(results.evaluation);
      setRoadmap(results.roadmap);
    } catch (err) {
      console.error('Error fetching results:', err);
      alert('Could not load results. Some data may be missing.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('AI Mock Interview Report', 20, 20);
    
    // User info
    doc.setFontSize(12);
    doc.text(`Candidate: ${userName}`, 20, 35);
    doc.text(`Difficulty: ${difficulty.toUpperCase()}`, 20, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 49);
    
    // Scores
    if (evaluation) {
      doc.setFontSize(16);
      doc.text('Evaluation Scores', 20, 65);
      doc.setFontSize(12);
      doc.text(`Technical: ${evaluation.technical}/10`, 30, 75);
      doc.text(`Communication: ${evaluation.communication}/10`, 30, 82);
      doc.text(`Confidence: ${evaluation.confidence}/10`, 30, 89);
      doc.text(`Professionalism: ${evaluation.professionalism}/10`, 30, 96);
    }
    
    // Roadmap
    if (roadmap) {
      doc.setFontSize(16);
      doc.text('Learning Roadmap', 20, 115);
      doc.setFontSize(12);
      let y = 125;
      roadmap.focus_areas.slice(0, 5).forEach((area, i) => {
        doc.text(`${i + 1}. ${area}`, 30, y);
        y += 7;
      });
    }
    
    doc.save(`interview-report-${userName.replace(/\s+/g, '-')}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Processing your results...</p>
        </div>
      </div>
    );
  }

  const avgScore = evaluation
    ? (evaluation.technical + evaluation.communication + evaluation.confidence + evaluation.professionalism) / 4
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-gray-600">Here's your performance summary</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {avgScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-secondary mb-1">
              {conversationHistory.length}
            </div>
            <div className="text-sm text-gray-600">Questions Asked</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-success mb-1">
              {roadmap?.focus_areas.length || 0}
            </div>
            <div className="text-sm text-gray-600">Focus Areas</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-warning mb-1">
              {difficulty.toUpperCase()}
            </div>
            <div className="text-sm text-gray-600">Difficulty</div>
          </div>
        </div>

        {/* Evaluation Scores */}
        {evaluation && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Detailed Evaluation
            </h2>
            
            <div className="space-y-4">
              {[
                { label: 'Technical Skills', value: evaluation.technical, color: 'bg-blue-500' },
                { label: 'Communication', value: evaluation.communication, color: 'bg-green-500' },
                { label: 'Confidence', value: evaluation.confidence, color: 'bg-purple-500' },
                { label: 'Professionalism', value: evaluation.professionalism, color: 'bg-orange-500' },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{metric.label}</span>
                    <span className="font-bold">{metric.value}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${metric.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${(metric.value / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap */}
        {roadmap && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">📚 Personalized Learning Roadmap</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-lg">Focus Areas:</h3>
              <ul className="space-y-2">
                {roadmap.focus_areas.map((area, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-lg">Recommended Actions:</h3>
              <ol className="space-y-2 list-decimal list-inside">
                {roadmap.actions.map((action, i) => (
                  <li key={i} className="text-gray-700">{action}</li>
                ))}
              </ol>
            </div>

            {roadmap.resources && roadmap.resources.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-lg">Learning Resources:</h3>
                <div className="space-y-2">
                  {roadmap.resources.map((resource, i) => (
                    <a
                      key={i}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-primary">{resource.title}</div>
                      <div className="text-sm text-gray-600">{resource.type}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={downloadReport}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
          <button
            onClick={onReset}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
};
