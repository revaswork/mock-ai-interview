import google.generativeai as genai
import json
import re
import os
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()

# ✅ Configure Gemini API Key from .env
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_roadmap_dynamic(evaluation: dict, role: str = None) -> dict:
    """
    Generates a personalized roadmap for the user based on their evaluation results.
    Uses Gemini 2.5 Flash model to identify strengths, weaknesses, and create an improvement plan.
    """

    role_line = f"Candidate role: {role}" if role else "The candidate's role was not specified."

    prompt = f"""
You are an AI career mentor helping a candidate improve after a mock technical interview.

{role_line}

Overall Scores:
Technical: {evaluation.get('technical')}
Communication: {evaluation.get('communication')}
Confidence: {evaluation.get('confidence')}
Professionalism: {evaluation.get('professionalism')}

Detailed Question Feedback:
{json.dumps(evaluation.get('per_question', []), indent=2)}

Using this information:

1. Identify the candidate's top strengths and how to enhance them.
2. Identify weaknesses and how to address them with focused learning.
3. Create a roadmap JSON with these three keys:

   * "focus_areas": Top 3 areas to improve.
   * "actions": 3–5 actionable steps to take.
   * "resources": Helpful learning materials (e.g., books, tutorials, online courses).

Return ONLY valid JSON in this format:
{{
  "focus_areas": ["...", "...", "..."],
  "actions": ["...", "...", "..."],
  "resources": ["...", "...", "..."]
}}
"""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        print("🔹 Raw Gemini Roadmap Output:", text)

        # ✅ Try to extract JSON safely
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            roadmap_json = json.loads(match.group())
            return roadmap_json
        else:
            # 🔁 Fallback if Gemini fails to return proper JSON
            return {
                "focus_areas": [
                    "Technical depth",
                    "Confidence building",
                    "Professional communication"
                ],
                "actions": [
                    "Review weak technical topics from the interview",
                    "Practice speaking answers confidently",
                    "Record mock interviews for self-assessment"
                ],
                "resources": [
                    "https://www.coursera.org/learn/communication-skills",
                    "https://www.udemy.com/course/technical-interview-preparation"
                ]
            }

    except Exception as e:
        print("⚠️ Roadmap generation failed:", e)
        # Final fallback in case of model or parsing error
        return {
            "focus_areas": ["Follow-up with mentor", "Project-based learning"],
            "actions": [
                "Redo mock interviews focusing on weak topics",
                "Join a peer review study group"
            ],
            "resources": [
                "https://www.youtube.com/results?search_query=system+design+interview",
                "https://www.coursera.org/learn/communication-skills"
            ]
        }
