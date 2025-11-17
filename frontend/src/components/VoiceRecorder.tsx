import { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onTranscriptReceived?: (transcript: string) => void;
  isDisabled?: boolean;
}

export const VoiceRecorder = ({ 
  onRecordingComplete, 
  onTranscriptReceived,
  isDisabled 
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [status, setStatus] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (websocketRef.current) {
      websocketRef.current.close();
    }
  };

  const startRecording = async () => {
    try {
      setStatus('Connecting to server...');
      
      // Establish WebSocket connection
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//127.0.0.1:8000/ws/audio`;
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      
      websocketRef.current = ws;

      // Wait for WebSocket to open
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          console.log('[WS] Connected to audio streaming server');
          setStatus('Connected');
          resolve();
        };
        ws.onerror = (error) => {
          console.error('[WS] Connection error:', error);
          setStatus('Connection failed');
          reject(new Error('WebSocket connection failed'));
        };
        ws.onclose = () => {
          console.log('[WS] Connection closed');
        };
      });

      // Handle server responses
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WS] Server response:', data);
          
          if (data.status === 'success' && data.transcript) {
            console.log('[WS] Transcript received:', data.transcript);
            setStatus(`Transcribed: "${data.transcript}"`);
            
            // Notify parent component with transcript
            if (onTranscriptReceived) {
              onTranscriptReceived(data.transcript);
            }
            
            // Create a dummy blob for compatibility with existing code
            const dummyBlob = new Blob([''], { type: 'audio/webm' });
            onRecordingComplete(dummyBlob);
            
          } else if (data.status === 'error') {
            console.error('[WS] Server error:', data.message);
            setStatus(`Error: ${data.message}`);
            alert(`Recording error: ${data.message}`);
          }
        } catch (err) {
          console.error('[WS] Failed to parse server message:', err);
        }
      };

      // Get microphone access
      setStatus('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      streamRef.current = stream;

      // Create MediaRecorder with small timeslice for streaming
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;

      // Send audio chunks as they become available
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`[MediaRecorder] Chunk available: ${event.data.size} bytes`);
          
          if (ws.readyState === WebSocket.OPEN) {
            try {
              const arrayBuffer = await event.data.arrayBuffer();
              ws.send(arrayBuffer);
              console.log(`[WS] Sent ${arrayBuffer.byteLength} bytes to server`);
            } catch (err) {
              console.error('[WS] Failed to send audio chunk:', err);
            }
          } else {
            console.warn('[WS] WebSocket not open, cannot send chunk');
          }
        }
      };

      mediaRecorder.onstop = () => {
        console.log('[MediaRecorder] Recording stopped');
        
        // Send end signal to server
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ event: 'end' }));
          console.log('[WS] Sent end signal to server');
        }
        
        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Reset state
        setRecordingTime(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setStatus('Processing...');
      };

      // Start recording with 250ms chunks for low latency
      mediaRecorder.start(250);
      setIsRecording(true);
      setStatus('Recording...');

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('[VoiceRecorder] Error starting recording:', err);
      setStatus('Failed to start recording');
      alert('Could not access microphone or connect to server. Please check permissions and server status.');
      cleanup();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('Stopping...');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isDisabled}
            className="btn btn-primary flex items-center gap-2"
          >
            <Mic className="w-5 h-5" />
            Record Answer
          </button>
        ) : (
          <>
            <button
              onClick={stopRecording}
              className="btn btn-danger flex items-center gap-2 recording-pulse"
            >
              <StopCircle className="w-5 h-5" />
              Stop Recording
            </button>
            <div className="flex items-center gap-2 text-red-600 font-medium">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              {formatTime(recordingTime)}
            </div>
          </>
        )}
      </div>
      
      {status && (
        <div className="text-sm text-gray-600">
          {status}
        </div>
      )}
    </div>
  );
};
