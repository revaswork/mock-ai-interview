from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid

# ✅ Import resume upload router
from .resume_parser import router as resume_router

# ✅ Core backend modules
from .main import start_interview
from .supabase_config import (
    save_interview_session,
    save_evaluation,
    save_report,
    save_roadmap,
)
from .Evaluation import get_evaluation
from .report_generator import compile_scores
from .roadmap import generate_roadmap_dynamic
from .text_to_speech import set_voice, speak_text
from .question_generator import generate_question

# ✅ Initialize FastAPI
app = FastAPI(
    title="AI Mock Interview Backend API",
    version="2.1.0",
    description="Handles resume upload, adaptive interviews, evaluation, reports, and audio playback.",
)

# -----------------------------
# 🧩 DATA MODELS
# -----------------------------
class Answer(BaseModel):
    question: str
    answer: str


class InterviewRequest(BaseModel):
    user_name: str
    difficulty: str
    voice_name: str
    resume_data: Dict[str, Any]
    answers: List[Answer]


class StepAnswerRequest(BaseModel):
    session_id: Optional[str] = None
    user_name: str
    difficulty: str
    voice_name: str
    resume_data: Dict[str, Any]
    current_question: str
    user_answer: str


# -----------------------------
# 🎧 AVAILABLE VOICES / AVATARS
# -----------------------------
@app.get("/api/interview/voices")
async def get_available_voices():
    """List available interviewer avatars."""
    return {
        "status": "success",
        "voices": [
            {"id": "1", "name": "Monika", "style": "Calm & Professional", "gender": "Female", "avatar": "/avatars/monika.png"},
            {"id": "2", "name": "Devajit", "style": "Friendly & Supportive", "gender": "Female", "avatar": "/avatars/devajit.png"},
            {"id": "3", "name": "Shaurya", "style": "Confident & Direct", "gender": "Male", "avatar": "/avatars/shaurya.png"},
            {"id": "4", "name": "Sia", "style": "Warm & Empathetic", "gender": "Female", "avatar": "/avatars/sia.png"},
        ],
    }


# -----------------------------
# 🚀 1️⃣ COMPLETE INTERVIEW PIPELINE (Batch Mode)
# -----------------------------
@app.post("/api/interview/start")
async def start_interview_api(payload: InterviewRequest):
    """Run the full AI interview pipeline and return evaluation, report, and roadmap."""
    try:
        print(f"🎯 Starting interview for: {payload.user_name} ({payload.difficulty})")

        result = start_interview(
            user_name=payload.user_name.strip(),
            difficulty_level=payload.difficulty.lower(),
            interviewer_voice=payload.voice_name.strip(),
        )

        return {
            "status": "success",
            "message": "Interview processed successfully!",
            "data": result,
        }

    except Exception as e:
        print(f"⚠️ Error during full interview pipeline: {e}")
        return {"status": "error", "message": str(e)}


# -----------------------------
# 💬 2️⃣ STEPWISE INTERVIEW MODE (Real-Time)
# -----------------------------
active_sessions: Dict[str, List[Dict[str, str]]] = {}  # session_id → conversation log

from fastapi import Form
@app.post("/api/interview/answer")
async def handle_answer(
    session_id: Optional[str] = Form(None),
    user_name: str = Form(...),
    difficulty: str = Form(...),
    voice_name: str = Form(...),
    resume_data: str = Form(...),
    current_question: str = Form(...),
    user_answer: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
):
    """
    Handles real-time Q&A:
    - Starts interview if 'start' received
    - Receives text or audio answer
    - Converts audio → text if uploaded
    - Returns next adaptive question + interviewer audio
    """
    try:
        from .speech_to_text import convert_audio_to_text
        session_id = session_id or str(uuid.uuid4())

        # ✅ Handle audio input (Speech-to-Text)
        if audio_file:
            print("🎙️ Received audio answer — converting to text...")
            user_answer = convert_audio_to_text(audio_file)
            print(f"🗣️ Transcribed Answer: {user_answer}")

        # 🟢 START INTERVIEW — FIRST QUESTION
        if current_question.lower() == "start" or user_answer.lower() == "start":
            print("🚀 Starting interview...")
            # Warm-up question using your question generator
            first_question = generate_question(
                resume_data,
                previous_answer="",
                difficulty=difficulty,
                first_question=True
            )

            # Generate interviewer audio
            audio_data = speak_text(first_question)

            return {
                "status": "success",
                "session_id": session_id,
                "next_question": first_question,
                "audio_base64": audio_data.get("audio_base64"),
                "audio_url": audio_data.get("audio_url"),
            }

        # ❌ If no user answer received
        if not user_answer:
            return {"status": "error", "message": "No answer received (text or audio)."}

        # ✅ Initialize session if not exists
        if session_id not in active_sessions:
            active_sessions[session_id] = []

        # ✅ Log question & answer
        active_sessions[session_id].append({
            "question": current_question,
            "answer": user_answer
        })

        # 🛑 Stop command
        if user_answer.lower() in ["stop", "quit", "exit"]:
            return {
                "status": "finished",
                "message": "Interview ended by user.",
                "session_id": session_id
            }

        # 🧠 Generate next adaptive question
        next_question = generate_question(
            resume_data,
            previous_answer=user_answer,
            difficulty=difficulty,
            first_question=False
        )

        # ✅ No more questions
        if not next_question:
            return {
                "status": "finished",
                "message": "Interview completed successfully.",
                "session_id": session_id
            }

        # 🎧 Generate interviewer audio
        audio_data = speak_text(next_question)

        return {
            "status": "success",
            "session_id": session_id,
            "next_question": next_question,
            "audio_base64": audio_data.get("audio_base64"),
            "audio_url": audio_data.get("audio_url"),
        }

    except Exception as e:
        print(f"⚠️ Error handling answer: {e}")
        return {"status": "error", "message": str(e)}


# -----------------------------
# 🧠 3️⃣ END INTERVIEW + GENERATE REPORT
# -----------------------------
@app.post("/api/interview/stop")
async def stop_interview(payload: Dict[str, str]):
    """Finalize interview session — save Q&A, evaluation, report, and roadmap."""
    try:
        session_id = payload.get("session_id")
        user_name = payload.get("user_name")

        if not session_id or session_id not in active_sessions:
            return {"status": "error", "message": "Invalid session ID."}

        qa_pairs = active_sessions.pop(session_id)

        print(f"🛑 Finalizing interview for {user_name} ({session_id})")

        # ✅ Save interview to Supabase
        save_interview_session(
            session_id=session_id,
            user_name=user_name,
            difficulty=payload.get("difficulty", "medium"),
            qa_pairs=qa_pairs,
        )

        # ✅ Evaluation
        evaluation = get_evaluation(session_id)
        save_evaluation(session_id, evaluation)

        # ✅ Report
        report_data = compile_scores(
            evaluation_results=evaluation,
            metadata={"session_id": session_id, "user_id": user_name},
        )
        save_report(session_id, report_data)

        # ✅ Roadmap
        roadmap = generate_roadmap_dynamic(
            evaluation,
            role=payload.get("role", "Software Engineer")
        )
        save_roadmap(session_id, user_name, roadmap)

        # 🎧 Audio farewell
        final_audio = speak_text(f"That concludes our interview, {user_name}. Great job today!")
        return {
            "status": "success",
            "message": "Interview finalized successfully!",
            "session_id": session_id,
            "evaluation": evaluation,
            "report": report_data,
            "roadmap": roadmap,
            "farewell_audio_base64": final_audio.get("audio_base64"),
            "farewell_audio_url": final_audio.get("audio_url"),
        }

    except Exception as e:
        print(f"⚠️ Error finalizing interview: {e}")
        return {"status": "error", "message": str(e)}


# ✅ Include resume upload router
app.include_router(resume_router)


# -----------------------------
# 🏠 ROOT ENDPOINT
# -----------------------------
@app.get("/")
async def root():
    return {
        "message": "🎯 AI Mock Interview API is running successfully!",
        "endpoints": {
            "GET /api/interview/voices": "List available voices/avatars",
            "POST /api/interview/start": "Run full pipeline",
            "POST /api/interview/answer": "Real-time Q&A with audio",
            "POST /api/interview/stop": "Finalize interview and get report",
            "POST /api/resume/upload": "Upload and parse resume",
        },
    }
