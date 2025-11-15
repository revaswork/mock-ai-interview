

# backend/ml/question_generator.py
from .config import GEMINI_API_KEY, GEMINI_MODEL
import google.generativeai as genai
import json

# Initialize Gemini client
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(GEMINI_MODEL)

def generate_question(resume_data, previous_answer=None, difficulty="easy", first_question=False):
    """
    Generates the next interview question using Gemini API.
    """
    resume_summary = json.dumps(resume_data, indent=2)

    # --- Case 1: Start of interview ---
    if first_question:
        prompt = f"""
        You are an intelligent and friendly job interviewer conducting a {difficulty}-level interview.
        Start the interview with a warm, general question to make the candidate comfortable.
        Ask something like "Tell me about yourself" or "Can you walk me through your projects?"
        Don't directly jump into resume details yet.
        """
    
    # --- Case 2: After candidate's first response ---
    else:
        prompt = f"""
        You are a professional interviewer conducting a {difficulty}-level interview.

        Candidate's resume (for reference):
        {resume_summary}

        Candidate's previous answer:
        "{previous_answer or 'N/A'}"

        Based on the above:
        - If the answer mentions a specific project or skill, ask a deeper question *only* about that topic.
        - If not, continue with a general follow-up (like motivation, teamwork, or learning challenges).
        - Keep your question relevant, natural, and conversational.
        - Avoid repeating topics already discussed.

        Now ask the next best interview question.
        """

    response = model.generate_content(prompt)
    return response.text.strip()

