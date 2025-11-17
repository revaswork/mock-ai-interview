from supabase import create_client, Client
from datetime import datetime
import json
import os
import uuid
import tempfile
from dotenv import load_dotenv
from typing import Optional

# ✅ Dynamically locate and load the .env file
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)  # backend folder
project_root = os.path.dirname(backend_dir)  # project root

possible_paths = [
    os.path.join(current_dir, ".env"),      # ✅ backend/ml/.env (FIRST PRIORITY)
    os.path.join(backend_dir, ".env"),      # backend/.env
    os.path.join(project_root, ".env"),     # project root
]

for path in possible_paths:
    if os.path.exists(path):
        load_dotenv(path)
        print(f"✅ Loaded environment variables from: {path}")
        break
else:
    print("⚠️ No .env file found in expected locations!")

# ✅ Fetch credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing Supabase credentials in environment variables!")

# ✅ Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ Supabase client connected successfully!")

def save_resume(user_name: str, resume_data: dict):
    """Save parsed resume data to Supabase."""
    try:
        data = {
            "user_name": user_name,
            "resume_data": json.dumps(resume_data),
            "created_at": datetime.utcnow().isoformat()
        }

        response = supabase.table("resumes").insert(data).execute()
        print("✅ Resume saved to Supabase:", response)
    except Exception as e:
        print(f"⚠️ Failed to save resume: {e}")



def fetch_resume(user_name: str):
    """Fetch latest parsed resume for a given user from Supabase."""
    try:
        response = supabase.table("resumes") \
            .select("resume_data") \
            .eq("user_name", user_name) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        if response.data:
            return json.loads(response.data[0]["resume_data"])
        else:
            raise ValueError(f"No resume found for user: {user_name}")
    except Exception as e:
        print(f"⚠️ Error fetching resume: {e}")
        return {}



def save_interview_session(session_id, user_name, difficulty, qa_pairs, feedback=None):
    """
    Save or update interview session with Q&A pairs.
    This is called at the END of the interview to finalize the session.
    """
    data = {
        "session_id": session_id,
        "user_name": user_name,
        "difficulty": difficulty,
        "created_at": datetime.now().isoformat(),
        "interview_data": json.dumps(qa_pairs),  # ✅ Convert to JSON string before saving
      
    }

    response = supabase.table("interviews").insert(data).execute()
    print("✅ Saved to Supabase:", response)


def create_interview_session(session_id: str, user_name: str, difficulty: str):
    """
    Create initial interview session record when interview starts.
    Called when user clicks 'Start Interview'.
    """
    try:
        data = {
            "session_id": session_id,
            "user_name": user_name,
            "difficulty": difficulty,
            "created_at": datetime.now().isoformat(),
            "interview_data": json.dumps([])  # Empty array, will be populated as interview progresses
        }
        
        response = supabase.table("interviews").insert(data).execute()
        print(f"✅ Interview session created: {session_id}")
        return response
    except Exception as e:
        print(f"❌ Error creating interview session: {e}")
        return None


def append_qa_to_session(session_id: str, question: str, answer: str):
    """
    Incrementally add a Q&A pair to the interview_data JSONB column.
    Called after each user answer is transcribed.
    
    This allows real-time storage of conversation without waiting for interview end.
    """
    try:
        # 1. Fetch current interview_data
        response = supabase.table("interviews")\
            .select("interview_data")\
            .eq("session_id", session_id)\
            .execute()
        
        if not response.data:
            print(f"⚠️ No interview found for session {session_id}")
            return None
        
        # 2. Parse existing Q&A pairs
        current_data = response.data[0].get("interview_data", [])
        if isinstance(current_data, str):
            current_data = json.loads(current_data)
        
        # 3. Append new Q&A pair
        current_data.append({
            "question": question,
            "answer": answer
        })
        
        # 4. Update interview_data in database
        update_response = supabase.table("interviews")\
            .update({"interview_data": json.dumps(current_data)})\
            .eq("session_id", session_id)\
            .execute()
        
        print(f"✅ Q&A pair saved to session {session_id}")
        return update_response
    
    except Exception as e:
        print(f"❌ Error appending Q&A to session: {e}")
        return None

def save_video_url(session_id: str, question: str, video_url: str):
    try:
        supabase.table("interview_videos").insert({
            "session_id": session_id,
            "question": question,
            "video_url": video_url
        }).execute()
        print("📹 Saved video URL to Supabase!")
    except Exception as e:
        print("❌ Error saving video URL:", e)




def save_evaluation(session_id, evaluation):
    """
    Saves an interview evaluation into the Supabase 'evaluations' table.
    Automatically fetches user_name from 'interviews' table using session_id.
    """
    try:
        # Step 1: Fetch user_name from 'interviews' table
        user_resp = supabase.table("interviews").select("user_name").eq("session_id", session_id).execute()
        user_name = user_resp.data[0]["user_name"] if user_resp.data else "Unknown User"

        # Step 2: Prepare data for insertion
        evaluation_data = {
            "session_id": session_id,
            "user_name": user_name,
            "technical": float(evaluation.get("technical", 0)),
            "communication": float(evaluation.get("communication", 0)),
            "confidence": float(evaluation.get("confidence", 0)),
            "professionalism": float(evaluation.get("professionalism", 0)),
            "per_question": json.dumps(evaluation.get("per_question", []))  # store as JSON string
        }

        # Step 3: Insert into Supabase 'evaluations' table
        response = supabase.table("evaluations").insert(evaluation_data).execute()

        if response.data:
            print(f"✅ Evaluation saved for {user_name} (session: {session_id})")
        else:
            print("⚠️ Failed to save evaluation:", response)
    except Exception as e:
        print("❌ Error saving evaluation:", e)


def save_report(session_id: str, report: dict, user_id: str = None):
    """
    Save the final interview report (including feedback & recommendations) to Supabase.
    """
    try:
        payload = {
            "session_id": session_id,
            "user_id": user_id,
            "report": report,
            "created_at": datetime.utcnow().isoformat()
        }

        response = supabase.table("reports").insert(payload).execute()
        if hasattr(response, "data") and response.data:
            print("✅ Report successfully saved to Supabase!")
        else:
            print("⚠️ Report save attempt made, but response was empty or invalid.")

    except Exception as e:
        print(f"❌ Error saving report to Supabase: {e}")


def save_roadmap(session_id: str, user_name: str, roadmap_data: dict):
    """Save AI-generated roadmap to Supabase."""
    try:
        response = supabase.table("roadmaps").insert({
            "session_id": session_id,
            "user_name": user_name,
            "focus_areas": roadmap_data.get("focus_areas", []),
            "actions": roadmap_data.get("actions", []),
            "resources": roadmap_data.get("resources", []),
        }).execute()

        print("✅ Roadmap saved successfully to Supabase!")
        return response

    except Exception as e:
        print(f"⚠️ Failed to save roadmap: {e}")


def save_user_audio(session_id: str, question_id: str, audio_bytes: bytes) -> Optional[str]:
    """
    Upload user's voice answer to Supabase storage and return public URL.
    
    Args:
        session_id: Current interview session ID
        question_id: Identifier for the question being answered
        audio_bytes: Raw audio data from MediaRecorder
    
    Returns:
        Public URL of uploaded audio file, or None if upload fails
    """
    try:
        # Create unique filename
        file_name = f"user_answers/{session_id}/{question_id}_{uuid.uuid4()}.webm"
        
        # Save to temporary file for upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            temp_file.write(audio_bytes)
            temp_file.flush()
            temp_path = temp_file.name
        
        # Upload to Supabase storage
        supabase.storage.from_("audio").upload(file_name, temp_path)
        
        # Generate public URL
        audio_url = f"{SUPABASE_URL}/storage/v1/object/public/audio/{file_name}"
        
        # Clean up temp file
        os.unlink(temp_path)
        
        print(f"✅ User audio saved: {audio_url}")
        return audio_url
    
    except Exception as e:
        print(f"❌ Failed to save user audio: {e}")
        return None


def save_question_answer(session_id: str, question: str, answer: str, 
                        user_audio_url: Optional[str] = None,
                        interviewer_audio_url: Optional[str] = None,
                        video_url: Optional[str] = None):
    """
    Save a complete Q&A pair with associated media URLs.
    
    This stores the conversation flow in Supabase for later retrieval and analysis.
    """
    try:
        data = {
            "session_id": session_id,
            "question": question,
            "answer": answer,
            "user_audio_url": user_audio_url,
            "interviewer_audio_url": interviewer_audio_url,
            "video_url": video_url,
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("qa_pairs").insert(data).execute()
        print(f"✅ Q&A pair saved for session {session_id}")
        return response
    
    except Exception as e:
        print(f"❌ Failed to save Q&A pair: {e}")
        return None


def get_session_conversation(session_id: str) -> list:
    """
    Retrieve complete conversation history for a session.
    
    Returns list of Q&A pairs with all media URLs.
    """
    try:
        response = supabase.table("qa_pairs")\
            .select("*")\
            .eq("session_id", session_id)\
            .order("created_at")\
            .execute()
        
        return response.data if response.data else []
    
    except Exception as e:
        print(f"❌ Failed to retrieve conversation: {e}")
        return []


