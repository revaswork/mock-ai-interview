This project is a voice-enabled AI mock interview assistant that:
Accepts a user’s resume
Conducts an adaptive interview using voice-based interaction
Evaluates answers
Generates a performance report and a personalized learning roadmap
Stores all data in Supabase
The backend is powered by FastAPI, with speech-to-text, text-to-speech, and adaptive question generation.


aimockinterview/
│
├── backend/
│   ├── __pycache__/                # Python cache files (auto-generated)
│   ├── credentials/                # (Optional) stores API/service credentials if needed
│   │
│   ├── ml/                         # 🧠 Core backend + AI logic lives here
│   │   ├── __pycache__/            # Cache for compiled Python files
│   │   ├──
│   │
│   │   ├── api.py                  # 🚀 Main FastAPI app (core routes & API endpoints)
│   │   ├── main.py                 # CLI-based version of the interview for local testing
│   │   ├── config.py               # Handles environment variables and app configuration
│   │   ├── resume_parser.py        # Extracts structured info (role, skills, exp) from uploaded resume
│   │   ├── supabase_config.py      # Supabase setup, storage, and DB helper functions
│   │   ├── requirements.txt        # Python dependencies list
│   │   ├── .env                    # Environment variables (API keys, Supabase URL, etc.)
│   │
│   │   ├── Evaluation.py           # Evaluates user's answers & generates scores
│   │   ├── question_generator.py   # Dynamically generates next question based on answer context
│   │   ├── report_generator.py     # Compiles interview performance report
│   │   ├── roadmap.py              # Builds personalized learning roadmap
│   │   ├── speech_to_text.py       # Converts user's speech (audio) to text using Google STT
│   │   ├── text_to_speech.py       # Converts interviewer’s text to audio (ElevenLabs + pyttsx3 fallback)
│   │
│   └── parsed_resume.json          # Stores temporarily parsed resume data
│
├── venv/                           # Virtual environment (ignored in Git)
└── README.md                       # Project documentation (this file)


# Installation Process

# Clone the Repo
git clone https://github.com/your-repo-name.git
cd aimockinterview

#Create A virtual environment
python -m venv venv
venv\Scripts\activate     # On Windows
source venv/bin/activate  # On Mac/Linux

# Install the Dependencies
pip install -r requirements.txt

# Run the FastApi server using
uvicorn backend.api:app --reload




# API endpoints Overview
1)POST /api/resume/upload
Uploads and parses a resume into structured JSON data.

2️⃣ Get Available Voices
GET /api/interview/voices
Lists available interviewer avatars (for frontend voice selection).

3️⃣ Stepwise Interview (Real-Time Q&A
POST /api/interview/answer
Also generated questions from text to speech with the help of Gemini and TTS models and elevnlabs voices
Handles user answers — either text or audio.

Handles user answers — either text or audio.
| Key                | Type | Description                                        |
| ------------------ | ---- | -------------------------------------------------- |
| `session_id`       | text | Optional session ID (auto-created if not provided) |
| `user_name`        | text | User’s name                                        |
| `difficulty`       | text | Difficulty level (“easy”, “medium”, “hard”)        |
| `voice_name`       | text | Interviewer voice name (“Monika”, etc.)            |
| `resume_data`      | text | Parsed resume JSON                                 |
| `current_question` | text | Current question being answered                    |
| `user_answer`      | text | Text answer (optional if uploading audio)          |
| `audio_file`       | file | Voice answer in `.wav` or `.mp3` format            |


4️⃣ Stop Interview & Generate Report

POST /api/interview/stop
Generates:
Evaluation Summary
Feedback Report
Personalized Learning Roadmap
And stores everything in Supabase.


Backend Logic Flow

| Step | File                        | Description                                                      |
| ---- | --------------------------- | ---------------------------------------------------------------- |
| 1    | **`resume_parser.py`**      | Extracts structured data from the uploaded resume                |
| 2    | **`question_generator.py`** | AI generates first interview question                            |
| 3    | **`text_to_speech.py`**     | Converts each question to audio (ElevenLabs / pyttsx3 fallback)  |
| 4    | **`speech_to_text.py`**     | Converts user’s audio answers to text (Google STT)               |
| 5    | **`Evaluation.py`**         | Analyzes answer quality                                          |
| 6    | **`report_generator.py`**   | Generates final performance summary                              |
| 7    | **`roadmap.py`**            | Builds AI-driven learning plan                                   |
| 8    | **`supabase_config.py`**    | Saves everything to Supabase (sessions, reports, audio, roadmap) |
| 9    | **`api.py`**                | Coordinates all steps & defines REST endpoints                   |




#How api.py Works (Summary)

User uploads a resume → parsed JSON saved to Supabase.
System begins interview (/api/interview/answer):
Sends first question.
Converts question text → audio via ElevenLabs.
User responds:
Either via text input (user_answer)
Or via voice recording (audio_file)
The backend converts the user’s speech → text → evaluates → generates the next question dynamically.
After a few rounds, user says stop → system:
Saves conversation logs
Generates evaluation, report, and roadmap
Stores everything to Supabase.



🧑‍💻 Frontend (Cleon’s Responsibilities)

Here’s what Cleon needs to implement on the frontend 👇
🎤 1. Enable Voice Recording

Use the Web MediaRecorder API to capture the user’s voice.




🔊 2. Play the Interviewer’s Voice

The backend returns both:
audio_base64 (base64 encoded string)
audio_url (Supabase public URL)
Cleon should prefer using the audio_url for smoother playback:

const audio = new Audio(data.audio_url);
audio.play();

If the URL is null, fallback to base64:
const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
audio.play();


📊 4. Show Final Evaluation and Roadmap

After calling /api/interview/stop, Cleon should:
Display the evaluation summary
Render the roadmap as an interactive checklist
Provide download options for the report




Outputs Stored in Supabase 
| Table                | Content                              |
| -------------------- | ------------------------------------ |
| `interview_sessions` | All Q&A logs                         |
| `evaluations`        | AI evaluation scores                 |
| `reports`            | Summary report JSON                  |
| `roadmaps`           | Personalized roadmap JSON            |
| `audio` (bucket)     | Interviewer’s and user’s audio files |
