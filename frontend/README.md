# AI Mock Interview - Frontend

Modern React + TypeScript frontend for the AI Mock Interview application.

## Features

✅ **Resume Upload** - Drag & drop PDF/DOCX resume files  
✅ **Zoom-like Interview Interface** - Side-by-side video layout with webcam + D-ID avatar  
✅ **Voice Recording** - MediaRecorder API for audio answers  
✅ **Text Answers** - Type responses with keyboard shortcuts  
✅ **Audio Playback** - ElevenLabs TTS with fallback support  
✅ **Real-time Evaluation** - Live scoring and feedback  
✅ **Learning Roadmap** - Personalized improvement plan  
✅ **PDF Export** - Download interview reports  

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Axios** - HTTP client
- **jsPDF** - PDF generation
- **Lucide Icons** - Modern icon set

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
npm run preview
```

## Usage Flow

1. **Upload Resume** - Drop a PDF/DOCX file
2. **Configure Settings** - Choose name, difficulty, interviewer voice
3. **Take Interview** - Answer via text or voice in Zoom-like interface
4. **View Results** - See scores, evaluation, and roadmap
5. **Download Report** - Export PDF summary

## Key Components

### ResumeUpload
Drag-and-drop file upload with validation

### InterviewSetup
Configure user preferences and select avatar

### InterviewRoom
Main interview interface with:
- User webcam (MediaDevices API)
- D-ID avatar video player
- Voice recorder (MediaRecorder API)
- Text input with Ctrl+Enter shortcut
- Real-time audio playback

### Results
Display evaluation metrics, charts, and downloadable roadmap

## Environment Variables

```env
VITE_API_URL=http://localhost:8000
```

## API Integration

Connects to FastAPI backend at `/api`:
- `POST /api/resume/upload` - Upload resume
- `GET /api/interview/voices` - Get available avatars
- `POST /api/interview/answer` - Send answer (text or audio)
- `POST /api/interview/stop` - End interview and get results

## Browser Requirements

- Modern browser with:
  - WebRTC (getUserMedia for webcam)
  - MediaRecorder API (for voice recording)
  - Audio/Video playback support

## Development Notes

### Webcam Setup
The app requests camera permission on interview start. Grant permission in browser settings if blocked.

### Voice Recording
Recording uses `audio/webm` format. Backend handles conversion via Google STT.

### Video Playback
D-ID videos are played directly from Supabase URLs. Ensure CORS is configured on your Supabase bucket.

## Troubleshooting

**Webcam not working?**
- Check browser permissions
- Try HTTPS (some browsers restrict getUserMedia on HTTP)

**Voice recording fails?**
- Ensure microphone is connected
- Check browser console for MediaRecorder errors

**Videos not playing?**
- Verify Supabase bucket is public
- Check CORS settings
- Open video URL directly to test

## License

MIT
