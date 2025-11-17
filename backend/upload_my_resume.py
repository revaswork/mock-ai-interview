"""
Upload your own resume file to test the backend

Usage:
    python upload_my_resume.py path/to/your/resume.pdf
    or
    python upload_my_resume.py path/to/your/resume.docx
"""

import requests
import sys
from pathlib import Path

BASE_URL = "http://localhost:8000"

def upload_resume(file_path):
    """Upload resume file to backend"""
    
    file_path = Path(file_path)
    
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return False
    
    print("=" * 60)
    print("UPLOADING YOUR RESUME")
    print("=" * 60)
    print(f"\n📄 File: {file_path.name}")
    print(f"📍 Path: {file_path.absolute()}")
    
    # Upload resume
    print("\n📤 Uploading to backend...")
    
    # Determine content type
    content_type = "application/pdf" if file_path.suffix == ".pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    with open(file_path, "rb") as f:
        files = {"file": (file_path.name, f, content_type)}
        response = requests.post(
            f"{BASE_URL}/api/resume/upload",
            files=files
        )
    
    if response.status_code != 200:
        print(f"❌ Upload failed: {response.text}")
        return False
    
    result = response.json()
    
    if result.get("status") == "success":
        print(f"✅ Resume uploaded successfully!")
        print(f"\n📊 Parsed Resume Data:")
        print(f"   User Name: {result['data'].get('filename', 'N/A').split('.')[0]}")
        print(f"   Skills Found: {', '.join(result['data']['skills']) if result['data']['skills'] else 'None detected'}")
        print(f"   Sections Detected:")
        for section, content in result['data']['sections'].items():
            preview = content[:100] + "..." if len(content) > 100 else content
            print(f"      - {section.title()}: {preview if preview else '(empty)'}")
        
        print(f"\n✅ Resume saved to Supabase 'resumes' table")
        print(f"\n🎯 You can now test the interview workflow:")
        print(f"   python test_incremental_storage.py")
        
        return True
    else:
        print(f"❌ Upload failed: {result.get('message')}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python upload_my_resume.py <path_to_resume>")
        print("\nExample:")
        print("  python upload_my_resume.py resume.pdf")
        print("  python upload_my_resume.py C:/Documents/my_resume.docx")
        sys.exit(1)
    
    resume_path = sys.argv[1]
    
    try:
        success = upload_resume(resume_path)
        if success:
            print("\n" + "=" * 60)
            print("✅ UPLOAD COMPLETE")
            print("=" * 60)
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server")
        print("   Please ensure the backend is running:")
        print("   cd backend/ml && uvicorn api:app --reload")
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
