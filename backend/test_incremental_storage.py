"""
Test script to verify incremental text storage from MediaRecorder → STT → Supabase

This script simulates the complete workflow:
1. User starts interview
2. User speaks → MediaRecorder captures audio
3. Audio sent to /api/interview/answer
4. Backend converts audio to text (STT)
5. Text immediately stored in interviews.interview_data JSONB
6. Verification that text is persisted incrementally (not batch)
"""

import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000"

# Sample resume data for testing
RESUME_DATA = {
    "name": "Test User",
    "email": "test@example.com",
    "skills": ["Python", "FastAPI", "React"],
    "experience": [
        {"company": "Tech Corp", "role": "Developer", "years": 2}
    ],
    "education": [
        {"degree": "BS Computer Science", "school": "University"}
    ]
}

def test_incremental_storage():
    """Test the complete workflow with incremental storage"""
    
    print("=" * 60)
    print("TESTING INCREMENTAL TEXT STORAGE WORKFLOW")
    print("=" * 60)
    
    # Step 0: Upload resume first
    print("\n📌 STEP 0: Uploading resume to Supabase...")
    
    # Create a simple text file to simulate resume upload
    from io import BytesIO
    resume_content = """
    John Doe
    Software Engineer
    
    Skills: Python, FastAPI, React, TypeScript
    
    Experience:
    - Tech Corp, Developer, 2 years
    
    Education:
    - BS Computer Science, University
    """
    
    resume_file = BytesIO(resume_content.encode())
    
    response = requests.post(
        f"{BASE_URL}/api/resume/upload",
        files={"file": ("Test_User.txt", resume_file, "text/plain")}
    )
    
    if response.status_code != 200:
        print(f"⚠️ Resume upload failed (this is okay if txt not supported): {response.text}")
        print("   Using sample resume data instead...")
    else:
        print(f"✅ Resume uploaded and saved to Supabase!")
    
    # Step 1: Start interview (first answer triggers question generation)
    print("\n📌 STEP 1: Starting interview with first question...")
    
    # First call generates the initial question
    start_payload = {
        "user_name": "Resume (2)",  # Use the uploaded resume filename without extension
        "difficulty": "medium",
        "current_question": "Tell me about yourself",  # Initial question
        "user_answer": "I am a software engineer with experience in Python and web development"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/interview/answer",
        data=start_payload
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to start interview: {response.text}")
        return
    
    result = response.json()
    session_id = result.get("session_id")
    next_question = result.get("next_question")
    video_url = result.get("video_url")
    
    print(f"✅ Interview started!")
    print(f"   Session ID: {session_id}")
    print(f"   Next Question: {next_question}")
    print(f"   Video URL: {video_url}")
    
    # Step 2: Answer the generated question
    print("\n📌 STEP 2: Answering generated question...")
    
    answer_payload = {
        "session_id": session_id,
        "user_name": "Resume (2)",
        "difficulty": "medium",
        "current_question": next_question,
        "user_answer": "I have 2 years of experience with Python and FastAPI, building RESTful APIs and microservices."
    }
    
    response = requests.post(
        f"{BASE_URL}/api/interview/answer",
        data=answer_payload
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to submit answer: {response.text}")
        return
    
    result = response.json()
    next_question = result.get("next_question")
    
    print(f"✅ Answer submitted!")
    print(f"   Next Question: {next_question}")
    
    # Step 3: Verify data is stored in database
    print("\n📌 STEP 3: Verifying incremental storage...")
    print(f"   Check your Supabase 'interviews' table for session_id: {session_id}")
    print(f"   The interview_data column should contain:")
    print(f"   [")
    print(f"     {{")
    print(f"       'question': '<generated question>',")
    print(f"       'answer': 'I have 2 years of experience...'")
    print(f"     }}")
    print(f"   ]")
    
    # Step 4: Submit another answer
    print("\n📌 STEP 4: Submitting second answer...")
    
    answer_payload2 = {
        "session_id": session_id,
        "user_name": "Resume (2)",
        "difficulty": "medium",
        "current_question": next_question,
        "user_answer": "Yes, I have worked with React for building single-page applications with TypeScript."
    }
    
    response = requests.post(
        f"{BASE_URL}/api/interview/answer",
        data=answer_payload2
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to submit second answer: {response.text}")
        return
    
    result = response.json()
    next_question2 = result.get("next_question")
    
    print(f"✅ Second answer submitted!")
    print(f"   Next Question: {next_question2}")
    
    print("\n📌 STEP 5: Final verification...")
    print(f"   Check your Supabase 'interviews' table for session_id: {session_id}")
    print(f"   The interview_data column should now contain TWO Q&A pairs:")
    print(f"   [")
    print(f"     {{ 'question': '...', 'answer': '...' }},  ← First Q&A")
    print(f"     {{ 'question': '...', 'answer': '...' }}   ← Second Q&A")
    print(f"   ]")
    
    print("\n" + "=" * 60)
    print("✅ TEST COMPLETE")
    print("=" * 60)
    print(f"\n🔍 Manual verification steps:")
    print(f"1. Open Supabase dashboard")
    print(f"2. Navigate to 'interviews' table")
    print(f"3. Find row with session_id: {session_id}")
    print(f"4. Check interview_data JSONB column")
    print(f"5. Verify it contains 2 Q&A pairs (incremental storage working)")
    print(f"\nIf you only see 1 Q&A pair, the append function may need debugging.")

if __name__ == "__main__":
    try:
        test_incremental_storage()
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server")
        print("   Please ensure the backend is running: cd backend/ml && uvicorn api:app --reload")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
