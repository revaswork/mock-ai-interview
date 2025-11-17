# from fastapi import FastAPI, UploadFile, File
# from pydantic import BaseModel
# from typing import List, Dict, Any, Optional
# import uuid

# # ✅ Import resume upload router
# from .resume_parser import router as resume_router

# # ✅ Core backend modules
# from .main import start_interview
# from .supabase_config import (
#     save_interview_session,
#     save_evaluation,
#     save_report,
#     save_roadmap,
# )
# from .Evaluation import get_evaluation
# from .report_generator import compile_scores
# from .roadmap import generate_roadmap_dynamic
# from .text_to_speech import set_voice, speak_text
# from .question_generator import generate_question

# # ✅ Initialize FastAPI
# app = FastAPI(
#     title="AI Mock Interview Backend API",
#     version="2.1.0",
#     description="Handles resume upload, adaptive interviews, evaluation, reports, and audio playback.",
# )

# # -----------------------------
# # 🧩 DATA MODELS
# # -----------------------------
# class Answer(BaseModel):
#     question: str
#     answer: str


# class InterviewRequest(BaseModel):
#     user_name: str
#     difficulty: str
#     voice_name: str
#     resume_data: Dict[str, Any]
#     answers: List[Answer]


# class StepAnswerRequest(BaseModel):
#     session_id: Optional[str] = None
#     user_name: str
#     difficulty: str
#     voice_name: str
#     resume_data: Dict[str, Any]
#     current_question: str
#     user_answer: str


# # -----------------------------
# # 🎧 AVAILABLE VOICES / AVATARS
# # -----------------------------
# @app.get("/api/interview/voices")
# async def get_available_voices():
#     """List available interviewer avatars."""
#     return {
#         "status": "success",
#         "voices": [
#             {"id": "1", "name": "Monika", "style": "Calm & Professional", "gender": "Female", "avatar": "/avatars/monika.png"},
#             {"id": "2", "name": "Devajit", "style": "Friendly & Supportive", "gender": "Female", "avatar": "/avatars/devajit.png"},
#             {"id": "3", "name": "Shaurya", "style": "Confident & Direct", "gender": "Male", "avatar": "/avatars/shaurya.png"},
#             {"id": "4", "name": "Sia", "style": "Warm & Empathetic", "gender": "Female", "avatar": "/avatars/sia.png"},
#         ],
#     }


# # -----------------------------
# # 🚀 1️⃣ COMPLETE INTERVIEW PIPELINE (Batch Mode)
# # -----------------------------
# @app.post("/api/interview/start")
# async def start_interview_api(payload: InterviewRequest):
#     """Run the full AI interview pipeline and return evaluation, report, and roadmap."""
#     try:
#         print(f"🎯 Starting interview for: {payload.user_name} ({payload.difficulty})")

#         result = start_interview(
#             user_name=payload.user_name.strip(),
#             difficulty_level=payload.difficulty.lower(),
#             interviewer_voice=payload.voice_name.strip(),
#         )

#         return {
#             "status": "success",
#             "message": "Interview processed successfully!",
#             "data": result,
#         }

#     except Exception as e:
#         print(f"⚠️ Error during full interview pipeline: {e}")
#         return {"status": "error", "message": str(e)}


# # -----------------------------
# # 💬 2️⃣ STEPWISE INTERVIEW MODE (Real-Time)
# # -----------------------------
# active_sessions: Dict[str, List[Dict[str, str]]] = {}  # session_id → conversation log

# from fastapi import Form
# @app.post("/api/interview/answer")
# async def handle_answer(
#     session_id: Optional[str] = Form(None),
#     user_name: str = Form(...),
#     difficulty: str = Form(...),
#     voice_name: str = Form(...),
#     resume_data: str = Form(...),
#     current_question: str = Form(...),
#     user_answer: Optional[str] = Form(None),
#     audio_file: Optional[UploadFile] = File(None),
# ):
#     """
#     Handles real-time Q&A:
#     - Starts interview if 'start' received
#     - Receives text or audio answer
#     - Converts audio → text if uploaded
#     - Returns next adaptive question + interviewer audio
#     """
#     try:
#         from .speech_to_text import convert_audio_to_text
#         session_id = session_id or str(uuid.uuid4())

#         # ✅ Handle audio input (Speech-to-Text)
#         if audio_file:
#             print("🎙️ Received audio answer — converting to text...")
#             user_answer = convert_audio_to_text(audio_file)
#             print(f"🗣️ Transcribed Answer: {user_answer}")

#         # 🟢 START INTERVIEW — FIRST QUESTION
#         if current_question.lower() == "start" or user_answer.lower() == "start":
#             print("🚀 Starting interview...")
#             # Warm-up question using your question generator
#             first_question = generate_question(
#                 resume_data,
#                 previous_answer="",
#                 difficulty=difficulty,
#                 first_question=True
#             )

#             # Generate interviewer audio
#             audio_data = speak_text(first_question)

#             return {
#                 "status": "success",
#                 "session_id": session_id,
#                 "next_question": first_question,
#                 "audio_base64": audio_data.get("audio_base64"),
#                 "audio_url": audio_data.get("audio_url"),
#             }

#         # ❌ If no user answer received
#         if not user_answer:
#             return {"status": "error", "message": "No answer received (text or audio)."}

#         # ✅ Initialize session if not exists
#         if session_id not in active_sessions:
#             active_sessions[session_id] = []

#         # ✅ Log question & answer
#         active_sessions[session_id].append({
#             "question": current_question,
#             "answer": user_answer
#         })

#         # 🛑 Stop command
#         if user_answer.lower() in ["stop", "quit", "exit"]:
#             return {
#                 "status": "finished",
#                 "message": "Interview ended by user.",
#                 "session_id": session_id
#             }

#         # 🧠 Generate next adaptive question
#         next_question = generate_question(
#             resume_data,
#             previous_answer=user_answer,
#             difficulty=difficulty,
#             first_question=False
#         )

#         # ✅ No more questions
#         if not next_question:
#             return {
#                 "status": "finished",
#                 "message": "Interview completed successfully.",
#                 "session_id": session_id
#             }

#         # 🎧 Generate interviewer audio
#         audio_data = speak_text(next_question)

#         return {
#             "status": "success",
#             "session_id": session_id,
#             "next_question": next_question,
#             "audio_base64": audio_data.get("audio_base64"),
#             "audio_url": audio_data.get("audio_url"),
#         }

#     except Exception as e:
#         print(f"⚠️ Error handling answer: {e}")
#         return {"status": "error", "message": str(e)}


# # -----------------------------
# # 🧠 3️⃣ END INTERVIEW + GENERATE REPORT
# # -----------------------------
# @app.post("/api/interview/stop")
# async def stop_interview(payload: Dict[str, str]):
#     """Finalize interview session — save Q&A, evaluation, report, and roadmap."""
#     try:
#         session_id = payload.get("session_id")
#         user_name = payload.get("user_name")

#         if not session_id or session_id not in active_sessions:
#             return {"status": "error", "message": "Invalid session ID."}

#         qa_pairs = active_sessions.pop(session_id)

#         print(f"🛑 Finalizing interview for {user_name} ({session_id})")

#         # ✅ Save interview to Supabase
#         save_interview_session(
#             session_id=session_id,
#             user_name=user_name,
#             difficulty=payload.get("difficulty", "medium"),
#             qa_pairs=qa_pairs,
#         )

#         # ✅ Evaluation
#         evaluation = get_evaluation(session_id)
#         save_evaluation(session_id, evaluation)

#         # ✅ Report
#         report_data = compile_scores(
#             evaluation_results=evaluation,
#             metadata={"session_id": session_id, "user_id": user_name},
#         )
#         save_report(session_id, report_data)

#         # ✅ Roadmap
#         roadmap = generate_roadmap_dynamic(
#             evaluation,
#             role=payload.get("role", "Software Engineer")
#         )
#         save_roadmap(session_id, user_name, roadmap)

#         # 🎧 Audio farewell
#         final_audio = speak_text(f"That concludes our interview, {user_name}. Great job today!")
#         return {
#             "status": "success",
#             "message": "Interview finalized successfully!",
#             "session_id": session_id,
#             "evaluation": evaluation,
#             "report": report_data,
#             "roadmap": roadmap,
#             "farewell_audio_base64": final_audio.get("audio_base64"),
#             "farewell_audio_url": final_audio.get("audio_url"),
#         }

#     except Exception as e:
#         print(f"⚠️ Error finalizing interview: {e}")
#         return {"status": "error", "message": str(e)}


# # ✅ Include resume upload router
# app.include_router(resume_router)


# # -----------------------------
# # 🏠 ROOT ENDPOINT
# # -----------------------------
# @app.get("/")
# async def root():
#     return {
#         "message": "🎯 AI Mock Interview API is running successfully!",
#         "endpoints": {
#             "GET /api/interview/voices": "List available voices/avatars",
#             "POST /api/interview/start": "Run full pipeline",
#             "POST /api/interview/answer": "Real-time Q&A with audio",
#             "POST /api/interview/stop": "Finalize interview and get report",
#             "POST /api/resume/upload": "Upload and parse resume",
#         },
#     }








# from fastapi import FastAPI, UploadFile, File, Form
# from pydantic import BaseModel
# from typing import List, Dict, Any, Optional
# import uuid
# import json

# # Resume upload router
# from .resume_parser import router as resume_router

# # Core backend modules
# from .main import start_interview
# from .supabase_config import (
#     save_interview_session,
#     save_evaluation,
#     save_report,
#     save_roadmap,
# )
# from .Evaluation import get_evaluation
# from .report_generator import compile_scores
# from .roadmap import generate_roadmap_dynamic
# from .text_to_speech import speak_text
# from .question_generator import generate_question
# from .speech_to_text import convert_audio_to_text

# # DID avatar generator

# from .avatar_generator_did import generate_avatar_video


# # ------------------------------------------------
# # FASTAPI INIT
# # ------------------------------------------------
# app = FastAPI(
#     title="AI Mock Interview Backend API",
#     version="2.4.0",
#     description="Handles resume upload, adaptive interviews, evaluation, reports, HeyGen avatar videos, and audio playback.",
# )


# # ------------------------------------------------
# # DATA MODELS
# # ------------------------------------------------
# class Answer(BaseModel):
#     question: str
#     answer: str


# class InterviewRequest(BaseModel):
#     user_name: str
#     difficulty: str
#     voice_name: str
#     resume_data: Dict[str, Any]
#     answers: List[Answer]


# class StepAnswerRequest(BaseModel):
#     session_id: Optional[str] = None
#     user_name: str
#     difficulty: str
#     voice_name: str
#     resume_data: Dict[str, Any]
#     current_question: str
#     user_answer: str


# # ------------------------------------------------
# # AVAILABLE VOICES
# # ------------------------------------------------
# @app.get("/api/interview/voices")
# async def get_available_voices():
#     return {
#         "status": "success",
#         "voices": [
#             {"id": "1", "name": "Monika", "style": "Calm & Professional", "gender": "Female"},
#             {"id": "2", "name": "Devajit", "style": "Friendly & Supportive", "gender": "Female"},
#             {"id": "3", "name": "Shaurya", "style": "Confident & Direct", "gender": "Male"},
#             {"id": "4", "name": "Sia", "style": "Warm & Empathetic", "gender": "Female"},
#         ],
#     }


# # ------------------------------------------------
# # AVATAR MAP (USED FOR FIRST + NEXT QUESTIONS)
# # ------------------------------------------------
# AVATAR_MAP = {
#     "Monika": "Adriana_BizTalk_Front_public",
#     "Devajit": "Aditya_public_4",
#     "Shaurya": "Adrian_public_2_20240312",
#     "Sia": "Abigail_expressive_2024112501"   # Your avatar
# }


# # ------------------------------------------------
# # ACTIVE INTERVIEW SESSIONS
# # ------------------------------------------------
# active_sessions: Dict[str, List[Dict[str, str]]] = {}


# # ------------------------------------------------
# # MAIN STEPWISE INTERVIEW HANDLER
# # ------------------------------------------------
# @app.post("/api/interview/answer")
# async def handle_answer(
#     session_id: Optional[str] = Form(None),
#     user_name: str = Form(...),
#     difficulty: str = Form(...),
#     voice_name: str = Form(...),
#     resume_data: str = Form(...),
#     current_question: str = Form(...),
#     user_answer: Optional[str] = Form(None),
#     audio_file: Optional[UploadFile] = File(None),
# ):
#     print("\nRAW resume_data:", resume_data)

#     # Parse resume JSON safely
#     try:
#         resume_dict = json.loads(resume_data)
#     except:
#         return {"status": "error", "message": "Invalid resume_data JSON string."}

#     session_id = session_id or str(uuid.uuid4())

#     # Handle voice input (speech-to-text)
#     if audio_file:
#         user_answer = convert_audio_to_text(audio_file)

#     # ------------------------------------------------
#     # FIRST QUESTION
#     # ------------------------------------------------
#     if current_question.lower() == "start" or (user_answer and user_answer.lower() == "start"):

#         first_question = generate_question(
#             resume_dict,
#             previous_answer="",
#             difficulty=difficulty,
#             first_question=True
#         )

#         audio_data = speak_text(first_question)

#         selected_avatar = AVATAR_MAP.get(voice_name, AVATAR_MAP["Sia"])
#         print("🎭 Selected Avatar:", selected_avatar)

#         # Generate avatar video safely (never crash API)
#         try:
#             video_url = generate_avatar_video(first_question, selected_avatar)
#         except Exception as e:
#             print("❌ HeyGen Avatar Error:", e)
#             video_url = None

#         return {
#             "status": "success",
#             "session_id": session_id,
#             "next_question": first_question,
#             "audio_base64": audio_data.get("audio_base64"),
#             "audio_url": audio_data.get("audio_url"),
#             "video_url": video_url,
#         }

#     # No answer?
#     if not user_answer:
#         return {"status": "error", "message": "No answer received."}

#     # Log session answer
#     if session_id not in active_sessions:
#         active_sessions[session_id] = []

#     active_sessions[session_id].append({
#         "question": current_question,
#         "answer": user_answer
#     })

#     # Stop keywords
#     if user_answer.lower() in ["stop", "quit", "exit"]:
#         return {
#             "status": "finished",
#             "message": "Interview ended.",
#             "session_id": session_id
#         }

#     # ------------------------------------------------
#     # NEXT QUESTION
#     # ------------------------------------------------
#     next_question = generate_question(
#         resume_dict,
#         previous_answer=user_answer,
#         difficulty=difficulty,
#         first_question=False
#     )

#     if not next_question:
#         return {
#             "status": "finished",
#             "message": "Interview completed.",
#             "session_id": session_id
#         }

#     audio_data = speak_text(next_question)
#     selected_avatar = AVATAR_MAP.get(voice_name, AVATAR_MAP["Sia"])

#     try:
#         video_url = generate_avatar_video(next_question, selected_avatar)
#     except Exception as e:
#         print("❌ HeyGen Avatar Error:", e)
#         video_url = None

#     return {
#         "status": "success",
#         "session_id": session_id,
#         "next_question": next_question,
#         "audio_base64": audio_data.get("audio_base64"),
#         "audio_url": audio_data.get("audio_url"),
#         "video_url": video_url,
#     }


# # ------------------------------------------------
# # END INTERVIEW
# # ------------------------------------------------
# @app.post("/api/interview/stop")
# async def stop_interview(payload: Dict[str, str]):
#     try:
#         session_id = payload.get("session_id")
#         user_name = payload.get("user_name")

#         if not session_id or session_id not in active_sessions:
#             return {"status": "error", "message": "Invalid session ID."}

#         qa_pairs = active_sessions.pop(session_id)

#         save_interview_session(
#             session_id=session_id,
#             user_name=user_name,
#             difficulty=payload.get("difficulty", "medium"),
#             qa_pairs=qa_pairs,
#         )

#         evaluation = get_evaluation(session_id)
#         save_evaluation(session_id, evaluation)

#         report_data = compile_scores(
#             evaluation_results=evaluation,
#             metadata={"session_id": session_id, "user_id": user_name},
#         )
#         save_report(session_id, report_data)

#         roadmap = generate_roadmap_dynamic(
#             evaluation,
#             role=payload.get("role", "Software Engineer")
#         )
#         save_roadmap(session_id, user_name, roadmap)

#         final_audio = speak_text(
#             f"That concludes our interview, {user_name}. Great job today!"
#         )

#         return {
#             "status": "success",
#             "session_id": session_id,
#             "evaluation": evaluation,
#             "report": report_data,
#             "roadmap": roadmap,
#             "farewell_audio_base64": final_audio.get("audio_base64"),
#             "farewell_audio_url": final_audio.get("audio_url"),
#         }

#     except Exception as e:
#         return {"status": "error", "message": str(e)}


# # ------------------------------------------------
# # ROUTERS
# # ------------------------------------------------
# app.include_router(resume_router)


# @app.get("/")
# async def root():
#     return {"message": "🎯 AI Mock Interview API is running!"}













# backend/ml/api.py

# api.py (replace backend/ml/api.py with this)



# from fastapi import FastAPI, UploadFile, File, Form
# from pydantic import BaseModel
# from typing import List, Dict, Any, Optional
# import uuid
# import json

# # Resume upload router
# from .resume_parser import router as resume_router

# # Core backend modules
# from .main import start_interview
# from .supabase_config import (
#     save_interview_session,
#     save_evaluation,
#     save_report,
#     save_roadmap,
# )
# from .Evaluation import get_evaluation
# from .report_generator import compile_scores
# from .roadmap import generate_roadmap_dynamic
# from .text_to_speech import speak_text
# from .question_generator import generate_question
# from .speech_to_text import convert_audio_to_text

# # D-ID avatar generator
# from backend.ml.avatar_generator_did import generate_avatar_video

# app = FastAPI(
#     title="AI Mock Interview Backend API",
#     version="2.4.0",
#     description="Handles resume upload, adaptive interviews, evaluation, reports, D-ID avatar videos, and audio playback.",
# )

# class Answer(BaseModel):
#     question: str
#     answer: str

# class InterviewRequest(BaseModel):
#     user_name: str
#     difficulty: str
#     voice_name: str
#     resume_data: Dict[str, Any]
#     answers: List[Answer]

# class StepAnswerRequest(BaseModel):
#     session_id: Optional[str] = None
#     user_name: str
#     difficulty: str
#     voice_name: str
#     resume_data: Dict[str, Any]
#     current_question: str
#     user_answer: str

# # ------------- Presenter + voice mapping (FINAL as you provided) -------------
# # Each frontend voice_name maps to a D-ID presenter_id (public) and a Microsoft voice_id.
# PRESENTER_VOICE_MAP = {
#     "Sia": {
#         "presenter_id": "v2_public_anita@Os4oKCBIgZ",
#         "voice_id": "en-IN-AartiNeural",   # Anita's voice (you can swap to standard if needed)
#     },
#     "Devajit": {
#         "presenter_id": "v2_public_owen@b59Q9LDPkk",
#         "voice_id": "en-GB-OllieMultilingualNeural",
#     },
#     "Shaurya": {
#         "presenter_id": "v2_public_arran@Kp1RPNa28e",
#         "voice_id": "en-GB-ThomasNeural",
#     },
#     "Monika": {
#         "presenter_id": "v2_public_ella@p9l_fpg2_k",
#         "voice_id": "en-US-AriaNeural",
#     }
# }

# active_sessions: Dict[str, List[Dict[str, str]]] = {}

# @app.get("/api/interview/voices")
# async def get_available_voices():
#     return {
#         "status": "success",
#         "voices": [
#             {"id": "1", "name": "Monika", "style": "Calm & Professional", "gender": "Female"},
#             {"id": "2", "name": "Devajit", "style": "Friendly & Supportive", "gender": "Female"},
#             {"id": "3", "name": "Shaurya", "style": "Confident & Direct", "gender": "Male"},
#             {"id": "4", "name": "Sia", "style": "Warm & Empathetic", "gender": "Female"},
#         ],
#     }

# @app.post("/api/interview/answer")
# async def handle_answer(
#     session_id: Optional[str] = Form(None),
#     user_name: str = Form(...),
#     difficulty: str = Form(...),
#     voice_name: str = Form(...),
#     resume_data: str = Form(...),
#     current_question: str = Form(...),
#     user_answer: Optional[str] = Form(None),
#     audio_file: Optional[UploadFile] = File(None),
# ):
#     print("\nRAW resume_data:", resume_data)

#     try:
#         resume_dict = json.loads(resume_data)
#     except:
#         return {"status": "error", "message": "Invalid resume_data JSON string."}

#     session_id = session_id or str(uuid.uuid4())

#     if audio_file:
#         user_answer = convert_audio_to_text(audio_file)

#     # FIRST question: start
#     if current_question.lower() == "start" or (user_answer and user_answer.lower() == "start"):
#         first_question = generate_question(
#             resume_dict,
#             previous_answer="",
#             difficulty=difficulty,
#             first_question=True
#         )

#         audio_data = speak_text(first_question)

#         # fetch presenter + voice for selected avatar (fallback to Sia)
#         pv = PRESENTER_VOICE_MAP.get(voice_name, PRESENTER_VOICE_MAP["Sia"])
#         presenter_id = pv["presenter_id"]
#         voice_id = pv["voice_id"]
#         print("🎭 Selected Presenter:", presenter_id, "voice:", voice_id)

#         try:
#             video_url = generate_avatar_video(text=first_question, presenter_id=presenter_id)

#         except Exception as e:
#             print("❌ Avatar generator error:", e)
#             video_url = None

#         return {
#             "status": "success",
#             "session_id": session_id,
#             "next_question": first_question,
#             "audio_base64": audio_data.get("audio_base64"),
#             "audio_url": audio_data.get("audio_url"),
#             "video_url": video_url,
#         }

#     if not user_answer:
#         return {"status": "error", "message": "No answer received."}

#     if session_id not in active_sessions:
#         active_sessions[session_id] = []

#     active_sessions[session_id].append({
#         "question": current_question,
#         "answer": user_answer
#     })

#     if user_answer.lower() in ["stop", "quit", "exit"]:
#         return {
#             "status": "finished",
#             "message": "Interview ended.",
#             "session_id": session_id
#         }

#     next_question = generate_question(
#         resume_dict,
#         previous_answer=user_answer,
#         difficulty=difficulty,
#         first_question=False
#     )

#     if not next_question:
#         return {
#             "status": "finished",
#             "message": "Interview completed.",
#             "session_id": session_id
#         }

#     audio_data = speak_text(next_question)

#     pv = PRESENTER_VOICE_MAP.get(voice_name, PRESENTER_VOICE_MAP["Sia"])
#     presenter_id = pv["presenter_id"]
#     voice_id = pv["voice_id"]
#     print("🎭 Selected Presenter:", presenter_id, "voice:", voice_id)

#     try:
#         video_url = generate_avatar_video(next_question, presenter_id, voice_id)
#     except Exception as e:
#         print("❌ Avatar generator error:", e)
#         video_url = None

#     return {
#         "status": "success",
#         "session_id": session_id,
#         "next_question": next_question,
#         "audio_base64": audio_data.get("audio_base64"),
#         "audio_url": audio_data.get("audio_url"),
#         "video_url": video_url,
#     }

# @app.post("/api/interview/stop")
# async def stop_interview(payload: Dict[str, str]):
#     try:
#         session_id = payload.get("session_id")
#         user_name = payload.get("user_name")

#         if not session_id or session_id not in active_sessions:
#             return {"status": "error", "message": "Invalid session ID."}

#         qa_pairs = active_sessions.pop(session_id)

#         save_interview_session(
#             session_id=session_id,
#             user_name=user_name,
#             difficulty=payload.get("difficulty", "medium"),
#             qa_pairs=qa_pairs,
#         )

#         evaluation = get_evaluation(session_id)
#         save_evaluation(session_id, evaluation)

#         report_data = compile_scores(
#             evaluation_results=evaluation,
#             metadata={"session_id": session_id, "user_id": user_name},
#         )
#         save_report(session_id, report_data)

#         roadmap = generate_roadmap_dynamic(
#             evaluation,
#             role=payload.get("role", "Software Engineer")
#         )
#         save_roadmap(session_id, user_name, roadmap)

#         final_audio = speak_text(
#             f"That concludes our interview, {user_name}. Great job today!"
#         )

#         return {
#             "status": "success",
#             "session_id": session_id,
#             "evaluation": evaluation,
#             "report": report_data,
#             "roadmap": roadmap,
#             "farewell_audio_base64": final_audio.get("audio_base64"),
#             "farewell_audio_url": final_audio.get("audio_url"),
#         }

#     except Exception as e:
#         return {"status": "error", "message": str(e)}

# # Routers + root
# app.include_router(resume_router)

# @app.get("/")
# async def root():
#     return {"message": "🎯 AI Mock Interview API is running!"}

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import json

from resume_parser import router as resume_router
from main import start_interview
from supabase_config import (
    save_interview_session, 
    save_evaluation, 
    save_report, 
    save_roadmap, 
    save_video_url,
    create_interview_session,
    append_qa_to_session,
    fetch_resume
)
from Evaluation import get_evaluation
from report_generator import compile_scores
from roadmap import generate_roadmap_dynamic
from text_to_speech import speak_text
from question_generator import generate_question
from speech_to_text import convert_audio_to_text
from avatar_generator_did import generate_avatar_video


app = FastAPI(
    title="AI Mock Interview Backend API",
    version="3.0.0",
)

# ✅ Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# D-ID PRESENTER CONFIGURATION (Single Default)
# ---------------------------------------------------------
DEFAULT_PRESENTER = {
    "image": "https://clips-presenters.d-id.com/v2/anita/Os4oKCBIgZ/yTLykkbYHr/image.png",
    "voice": "en-IN-AartiNeural"
}

active_sessions: Dict[str, List[Dict[str, str]]] = {}

# ---------------------------------------------------------
@app.get("/api/interview/voices")
async def get_available_voices():
    return {
        "status": "success",
        "message": "Using D-ID default presenter with built-in voice",
        "presenter": "Anita (D-ID)",
        "voice": "en-IN-AartiNeural"
    }

# ---------------------------------------------------------
@app.post("/api/interview/answer")
async def handle_answer(
    session_id: Optional[str] = Form(None),
    user_name: str = Form(...),
    difficulty: str = Form(...),
    voice_name: Optional[str] = Form(None),  # Optional - not used anymore
    current_question: str = Form(...),
    user_answer: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
):
    # Fetch resume from Supabase by user_name
    resume_dict = fetch_resume(user_name)
    
    if not resume_dict:
        return {"status": "error", "message": f"No resume found for user: {user_name}. Please upload resume first."}

    session_id = session_id or str(uuid.uuid4())

    # Speech → text
    if audio_file:
        user_answer = convert_audio_to_text(audio_file)

    # Use default D-ID presenter
    image_url = DEFAULT_PRESENTER["image"]
    voice_id = DEFAULT_PRESENTER["voice"]

    # ---------------------------------------------------------
    # FIRST QUESTION
    # ---------------------------------------------------------
    if current_question.lower() == "start":
        # Create initial interview session in database
        create_interview_session(session_id, user_name, difficulty)
        
        first_question = generate_question(
            resume_dict, previous_answer="", difficulty=difficulty, first_question=True
        )

        # ❌ NO local audio generation - D-ID video has built-in TTS
        # audio_data = speak_text(first_question)

        # Generate D-ID video with built-in TTS (video already includes audio)
        video_url = None
        try:
            video_url = generate_avatar_video(
                text=first_question,
                image_url=image_url,
                voice_id=voice_id
            )
            if video_url:
                save_video_url(session_id, first_question, video_url)
            else:
                print("⚠️ D-ID video generation returned None - likely insufficient credits")
        except Exception as e:
            print("❌ Avatar video generation failed:", e)

        # If video generation fails, return error so user knows
        if not video_url:
            return {
                "status": "error",
                "message": "Failed to generate avatar video. Please check D-ID credits or try again later.",
            }

        return {
            "status": "success",
            "session_id": session_id,
            "next_question": first_question,
            "audio_base64": None,  # No separate audio - video includes it
            "audio_url": None,     # No separate audio - video includes it
            "video_url": video_url,
        }

    # ---------------------------------------------------------
    # USER ANSWERS A QUESTION
    # ---------------------------------------------------------
    if not user_answer:
        return {"status": "error", "message": "No answer received."}

    # ✅ Save user's transcribed answer to database immediately
    append_qa_to_session(session_id, current_question, user_answer)
    
    if session_id not in active_sessions:
        active_sessions[session_id] = []

    active_sessions[session_id].append({
        "question": current_question,
        "answer": user_answer
    })

    # stop command
    if user_answer.lower() in ["stop", "quit", "exit"]:
        return {"status": "finished", "message": "Interview ended."}

    # Next question
    next_question = generate_question(
        resume_dict, previous_answer=user_answer, difficulty=difficulty
    )

    if not next_question:
        return {"status": "finished", "message": "Interview completed."}

    # ❌ NO local audio generation - D-ID video has built-in TTS
    # audio_data = speak_text(next_question)

    # Generate D-ID video with built-in TTS (video already includes audio)
    video_url = None
    try:
        video_url = generate_avatar_video(
            text=next_question,
            image_url=image_url,
            voice_id=voice_id
        )
        if video_url:
            save_video_url(session_id, next_question, video_url)
        else:
            print("⚠️ D-ID video generation returned None - likely insufficient credits")
    except Exception as e:
        print("❌ Avatar video generation failed:", e)

    # If video generation fails, return error so user knows
    if not video_url:
        return {
            "status": "error",
            "message": "Failed to generate avatar video. Please check D-ID credits or try again later.",
        }

    return {
        "status": "success",
        "session_id": session_id,
        "next_question": next_question,
        "audio_base64": None,  # No separate audio - video includes it
        "audio_url": None,     # No separate audio - video includes it
        "video_url": video_url,
    }

# ---------------------------------------------------------
@app.post("/api/interview/stop")
async def stop_interview(payload: Dict[str, str]):
    try:
        session_id = payload["session_id"]
        user_name = payload["user_name"]

        qa_pairs = active_sessions.pop(session_id, [])

        save_interview_session(
            session_id=session_id,
            user_name=user_name,
            difficulty=payload.get("difficulty", "medium"),
            qa_pairs=qa_pairs,
        )

        evaluation = get_evaluation(session_id)
        save_evaluation(session_id, evaluation)

        report = compile_scores(evaluation, {"session_id": session_id})
        save_report(session_id, report)

        roadmap = generate_roadmap_dynamic(evaluation)
        save_roadmap(session_id, user_name, roadmap)

        return {
            "status": "success",
            "evaluation": evaluation,
            "report": report,
            "roadmap": roadmap,
            "message": f"That concludes our interview, {user_name}. Thank you!",
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

# ---------------------------------------------------------
app.include_router(resume_router)

@app.get("/")
async def root():
    return {"message": "🎯 AI Mock Interview API is running!"}
