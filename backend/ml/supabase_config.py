from supabase import create_client, Client
from datetime import datetime
import json
import os
from dotenv import load_dotenv

# ✅ Dynamically locate and load the .env file
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))  # go up to project root

possible_paths = [
    os.path.join(project_root, ".env"),  # ✅ project root
    os.path.join(current_dir, ".env")    # fallback (ml folder)
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
    data = {
        "session_id": session_id,
        "user_name": user_name,
        "difficulty": difficulty,
        "created_at": datetime.now().isoformat(),
        "interview_data": json.dumps(qa_pairs),  # ✅ Convert to JSON string before saving
      
    }

    response = supabase.table("interviews").insert(data).execute()
    print("✅ Saved to Supabase:", response)



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


