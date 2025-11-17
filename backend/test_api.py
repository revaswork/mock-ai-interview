"""
API Testing Script for AI Mock Interview Backend
Tests all endpoints to verify integration before frontend connection

Requirements:
    pip install requests python-dotenv

Usage:
    python test_api.py
"""

import requests
import json
import time
import os
from pathlib import Path

# API Base URL
BASE_URL = "http://localhost:8000"

# Test data
TEST_RESUME_DATA = {
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["Python", "FastAPI", "React", "TypeScript"],
    "experience": [
        {
            "company": "Tech Corp",
            "role": "Senior Developer",
            "duration": "2020-2023",
            "responsibilities": "Led development of REST APIs"
        }
    ],
    "education": [
        {
            "degree": "B.S. Computer Science",
            "university": "State University",
            "year": "2019"
        }
    ]
}

class APITester:
    def __init__(self):
        self.session_id = None
        self.current_question = None
        
    def print_section(self, title):
        """Print formatted section header"""
        print("\n" + "="*70)
        print(f"  {title}")
        print("="*70)
    
    def print_response(self, response):
        """Print formatted API response"""
        print(f"Status Code: {response.status_code}")
        try:
            data = response.json()
            print("Response:")
            print(json.dumps(data, indent=2))
            return data
        except:
            print("Response:", response.text)
            return None
    
    def test_root(self):
        """Test: GET / - Health check"""
        self.print_section("TEST 1: Root Endpoint (Health Check)")
        
        try:
            response = requests.get(f"{BASE_URL}/")
            data = self.print_response(response)
            
            if response.status_code == 200:
                print("✅ PASSED: API is running")
                return True
            else:
                print("❌ FAILED: API not responding correctly")
                return False
        except requests.exceptions.ConnectionError:
            print("❌ FAILED: Cannot connect to API. Is the server running?")
            print("Start server with: uvicorn backend.ml.api:app --reload")
            return False
    
    def test_get_voices(self):
        """Test: GET /api/interview/voices"""
        self.print_section("TEST 2: Get Available Voices")
        
        try:
            response = requests.get(f"{BASE_URL}/api/interview/voices")
            data = self.print_response(response)
            
            if response.status_code == 200 and data.get("status") == "success":
                voices = data.get("voices", [])
                if len(voices) > 0:
                    print(f"✅ PASSED: Retrieved {len(voices)} voices")
                    for voice in voices:
                        print(f"   - {voice.get('name')} (ID: {voice.get('id')})")
                    return True
                else:
                    print("❌ FAILED: No voices returned")
                    return False
            else:
                print("❌ FAILED: Invalid response")
                return False
        except Exception as e:
            print(f"❌ FAILED: {str(e)}")
            return False
    
    def test_start_interview(self):
        """Test: POST /api/interview/answer with 'start' to get first question"""
        self.print_section("TEST 3: Start Interview (First Question)")
        
        try:
            payload = {
                "user_name": "Test User",
                "difficulty": "medium",
                "voice_name": "Sia",
                "resume_data": json.dumps(TEST_RESUME_DATA),
                "current_question": "start"
            }
            
            response = requests.post(
                f"{BASE_URL}/api/interview/answer",
                data=payload
            )
            data = self.print_response(response)
            
            if response.status_code == 200 and data.get("status") == "success":
                self.session_id = data.get("session_id")
                self.current_question = data.get("next_question")
                video_url = data.get("video_url")
                
                print(f"✅ PASSED: Interview started")
                print(f"   Session ID: {self.session_id}")
                print(f"   First Question: {self.current_question[:100]}...")
                print(f"   Video URL: {video_url if video_url else 'Generating...'}")
                
                # Check if video_url is present (might be None if still processing)
                if video_url:
                    print("   ✅ Video generated successfully")
                else:
                    print("   ⚠️  Video still processing or failed")
                
                return True
            else:
                print("❌ FAILED: Could not start interview")
                return False
        except Exception as e:
            print(f"❌ FAILED: {str(e)}")
            return False
    
    def test_answer_text(self):
        """Test: POST /api/interview/answer with text answer"""
        self.print_section("TEST 4: Submit Text Answer")
        
        if not self.session_id or not self.current_question:
            print("⚠️  SKIPPED: No active session (previous test failed)")
            return False
        
        try:
            # Sample answer
            sample_answer = "I have 3 years of experience working with Python and FastAPI. I've built several REST APIs for production applications."
            
            payload = {
                "session_id": self.session_id,
                "user_name": "Test User",
                "difficulty": "medium",
                "voice_name": "Sia",
                "resume_data": json.dumps(TEST_RESUME_DATA),
                "current_question": self.current_question,
                "user_answer": sample_answer
            }
            
            response = requests.post(
                f"{BASE_URL}/api/interview/answer",
                data=payload
            )
            data = self.print_response(response)
            
            if response.status_code == 200:
                status = data.get("status")
                
                if status == "success":
                    self.current_question = data.get("next_question")
                    video_url = data.get("video_url")
                    
                    print(f"✅ PASSED: Answer submitted successfully")
                    print(f"   Next Question: {self.current_question[:100]}...")
                    print(f"   Video URL: {video_url if video_url else 'Generating...'}")
                    return True
                    
                elif status == "finished":
                    print("✅ PASSED: Interview completed")
                    return True
                else:
                    print("❌ FAILED: Unexpected status")
                    return False
            else:
                print("❌ FAILED: Could not submit answer")
                return False
        except Exception as e:
            print(f"❌ FAILED: {str(e)}")
            return False
    
    def test_answer_audio(self):
        """Test: POST /api/interview/answer with audio file"""
        self.print_section("TEST 5: Submit Audio Answer")
        
        if not self.session_id or not self.current_question:
            print("⚠️  SKIPPED: No active session (previous test failed)")
            return False
        
        # Check if test audio file exists
        test_audio_path = Path(__file__).parent / "test_audio.wav"
        
        if not test_audio_path.exists():
            print("⚠️  SKIPPED: No test audio file found")
            print(f"   Create a test audio file at: {test_audio_path}")
            print("   Or record a quick voice memo and save as test_audio.wav")
            return False
        
        try:
            with open(test_audio_path, "rb") as audio_file:
                files = {"audio_file": ("test_audio.wav", audio_file, "audio/wav")}
                data = {
                    "session_id": self.session_id,
                    "user_name": "Test User",
                    "difficulty": "medium",
                    "voice_name": "Sia",
                    "resume_data": json.dumps(TEST_RESUME_DATA),
                    "current_question": self.current_question,
                }
                
                response = requests.post(
                    f"{BASE_URL}/api/interview/answer",
                    data=data,
                    files=files
                )
                
            data = self.print_response(response)
            
            if response.status_code == 200 and data.get("status") == "success":
                self.current_question = data.get("next_question")
                print("✅ PASSED: Audio answer processed successfully")
                return True
            else:
                print("❌ FAILED: Could not process audio answer")
                return False
        except Exception as e:
            print(f"❌ FAILED: {str(e)}")
            return False
    
    def test_stop_interview(self):
        """Test: POST /api/interview/stop"""
        self.print_section("TEST 6: Stop Interview & Get Evaluation")
        
        if not self.session_id:
            print("⚠️  SKIPPED: No active session (previous test failed)")
            return False
        
        try:
            payload = {
                "session_id": self.session_id,
                "user_name": "Test User",
                "difficulty": "medium"
            }
            
            response = requests.post(
                f"{BASE_URL}/api/interview/stop",
                json=payload
            )
            data = self.print_response(response)
            
            if response.status_code == 200 and data.get("status") == "success":
                evaluation = data.get("evaluation", {})
                report = data.get("report", {})
                roadmap = data.get("roadmap", {})
                
                print("✅ PASSED: Interview stopped successfully")
                print(f"   Evaluation: {len(evaluation)} items")
                print(f"   Report: {len(report)} items")
                print(f"   Roadmap: {len(roadmap)} items")
                
                # Print sample evaluation data
                if evaluation:
                    print("\n   Sample Evaluation Data:")
                    for key, value in list(evaluation.items())[:3]:
                        print(f"      {key}: {value}")
                
                return True
            else:
                print("❌ FAILED: Could not stop interview")
                return False
        except Exception as e:
            print(f"❌ FAILED: {str(e)}")
            return False
    
    def test_upload_resume(self):
        """Test: POST /api/resume/upload"""
        self.print_section("TEST 7: Upload Resume (PDF/DOCX)")
        
        # Check for test resume file
        test_pdf = Path(__file__).parent / "test_resume.pdf"
        test_docx = Path(__file__).parent / "test_resume.docx"
        
        test_file = None
        if test_pdf.exists():
            test_file = test_pdf
        elif test_docx.exists():
            test_file = test_docx
        
        if not test_file:
            print("⚠️  SKIPPED: No test resume file found")
            print(f"   Create a test PDF at: {test_pdf}")
            print(f"   Or test DOCX at: {test_docx}")
            return False
        
        try:
            with open(test_file, "rb") as resume_file:
                files = {"file": (test_file.name, resume_file, "application/pdf" if test_file.suffix == ".pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
                
                response = requests.post(
                    f"{BASE_URL}/api/resume/upload",
                    files=files
                )
            
            data = self.print_response(response)
            
            if response.status_code == 200:
                print(f"✅ PASSED: Resume uploaded and parsed")
                if data:
                    print(f"   Parsed Data Keys: {list(data.keys())}")
                return True
            else:
                print("❌ FAILED: Could not upload resume")
                return False
        except Exception as e:
            print(f"❌ FAILED: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("\n" + "🚀"*35)
        print("  AI MOCK INTERVIEW API TEST SUITE")
        print("🚀"*35)
        
        results = []
        
        # Run tests
        results.append(("Health Check", self.test_root()))
        
        if results[-1][1]:  # Only continue if API is running
            results.append(("Get Voices", self.test_get_voices()))
            results.append(("Start Interview", self.test_start_interview()))
            results.append(("Submit Text Answer", self.test_answer_text()))
            results.append(("Submit Audio Answer", self.test_answer_audio()))
            results.append(("Stop Interview", self.test_stop_interview()))
            results.append(("Upload Resume", self.test_upload_resume()))
        
        # Print summary
        self.print_section("TEST SUMMARY")
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        print(f"\nResults: {passed}/{total} tests passed\n")
        
        for test_name, result in results:
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"  {status}: {test_name}")
        
        print("\n" + "="*70)
        
        if passed == total:
            print("🎉 ALL TESTS PASSED! API is ready for frontend integration.")
        elif passed > 0:
            print(f"⚠️  {total - passed} test(s) failed. Review errors above.")
        else:
            print("❌ All tests failed. Check if the server is running.")
        
        print("="*70 + "\n")
        
        return passed == total


def main():
    """Main test execution"""
    print("\n📋 Prerequisites:")
    print("   1. Start the backend server:")
    print("      cd backend")
    print("      uvicorn ml.api:app --reload")
    print("   2. Ensure .env file has DID_API_KEY configured")
    print("   3. Optionally create test_resume.pdf and test_audio.wav")
    print("\nPress Enter to start tests...")
    input()
    
    tester = APITester()
    success = tester.run_all_tests()
    
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())
