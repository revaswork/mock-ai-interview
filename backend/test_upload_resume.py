"""
Test resume upload and save to Supabase

This script tests the first part of the workflow:
1. Upload resume file (PDF/DOCX)
2. Parse resume (extract skills, sections)
3. Save to Supabase resumes table
"""

import requests
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_resume_upload():
    """Test resume upload workflow"""
    
    print("=" * 60)
    print("TESTING RESUME UPLOAD WORKFLOW")
    print("=" * 60)
    
    # Create a sample resume file for testing
    print("\n📌 Creating sample resume file...")
    
    sample_resume = """
John Doe
Senior Software Engineer

Contact:
Email: john.doe@example.com
Phone: (555) 123-4567

Skills:
Python, Java, JavaScript, TypeScript, SQL, Machine Learning
FastAPI, Django, React, Node.js, AWS, TensorFlow, Pandas, NumPy

Experience:
Software Engineer at Tech Corp (2021-2023)
- Developed RESTful APIs using FastAPI and Python
- Built microservices architecture with Docker and Kubernetes
- Implemented machine learning models for data analysis

Junior Developer at StartupXYZ (2019-2021)
- Created web applications using React and Node.js
- Managed SQL databases and optimized queries
- Collaborated with cross-functional teams

Education:
Bachelor of Science in Computer Science
University of Technology (2015-2019)

Projects:
- AI Chatbot: Built NLP chatbot using TensorFlow and Python
- E-commerce Platform: Full-stack application with React and Django
- Data Analytics Dashboard: Real-time analytics using Pandas and NumPy
"""
    
    # Save sample resume as text file (you can also use PDF/DOCX)
    sample_file = Path("sample_resume_test_user.txt")
    sample_file.write_text(sample_resume)
    
    print(f"✅ Created sample resume: {sample_file}")
    
    # Upload resume
    print("\n📌 Uploading resume to backend...")
    
    with open(sample_file, "rb") as f:
        response = requests.post(
            f"{BASE_URL}/api/resume/upload",
            files={"file": ("Test_User.pdf", f, "application/pdf")}
        )
    
    # Clean up
    sample_file.unlink()
    
    if response.status_code != 200:
        print(f"❌ Failed to upload resume: {response.text}")
        return False
    
    result = response.json()
    
    if result.get("status") == "success":
        print(f"✅ Resume uploaded successfully!")
        print(f"\n📊 Parsed Resume Data:")
        print(f"   Filename: {result['data']['filename']}")
        print(f"   Skills Found: {', '.join(result['data']['skills'])}")
        print(f"   Sections: {', '.join(result['data']['sections'].keys())}")
        print(f"\n✅ Resume saved to Supabase 'resumes' table")
        
        print("\n" + "=" * 60)
        print("✅ RESUME UPLOAD TEST COMPLETE")
        print("=" * 60)
        
        print("\n🔍 Verification steps:")
        print("1. Open Supabase dashboard")
        print("2. Navigate to 'resumes' table")
        print("3. Find row with user_name: 'Test User'")
        print("4. Check resume_data JSON column contains parsed data")
        
        return True
    else:
        print(f"❌ Resume upload failed: {result.get('message')}")
        return False

if __name__ == "__main__":
    try:
        success = test_resume_upload()
        
        if success:
            print("\n✅ You can now test the interview workflow:")
            print("   python test_incremental_storage.py")
        
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server")
        print("   Please ensure the backend is running:")
        print("   cd backend/ml && uvicorn api:app --reload")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
