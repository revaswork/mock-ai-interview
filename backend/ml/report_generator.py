import google.generativeai as genai
import os
from typing import Dict, Optional
import json
import re

# ✅ Load Gemini API key from environment
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_technical_feedback(score: int, per_question: list, role: Optional[str] = None) -> str:
    """
    Generate role-specific technical feedback using Gemini for better contextual insights.
    """
    try:
        prompt = f"""
        You are an expert technical interviewer helping evaluate a candidate for the role: {role or "Software Engineer"}.
        Based on the following information:
        - Technical score: {score}
        - Per-question feedback: {json.dumps(per_question, indent=2)}

        Provide a short paragraph of constructive, role-relevant technical feedback
        that identifies what the candidate did well and what they should focus on improving.
        Keep it specific and actionable, avoid generic lines.
        """

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        feedback = response.text.strip()

        if not feedback:
            raise ValueError("Empty Gemini response.")
        return feedback

    except Exception as e:
        print(f"⚠️ Gemini feedback generation failed: {e}")
        # Fallback to your original rule-based system
        if score >= 85:
            return "Excellent technical understanding. Focus more on communicating trade-offs."
        if score >= 60:
            return "Good technical foundation. Add depth on edge-cases & complexity analysis."
        return "Needs improvement in fundamentals and practical examples. Revise DSA and core system concepts."


def generate_recommendations_dynamic(evaluation: dict, role: str):
    """
    Uses Gemini to generate personalized short-term and long-term recommendations dynamically.
    """
    try:
        prompt = f"""
        You are an AI career mentor. Based on this interview evaluation:
        {json.dumps(evaluation, indent=2)}

        Candidate Role: {role}

        Please generate actionable, specific feedback as a JSON object:
        {{
            "short_term": ["..."],
            "long_term": ["..."]
        }}
        """
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()

        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())

        # fallback
        return {
            "short_term": [
                "Revise weak areas identified in the interview.",
                "Practice more problem-solving on real interview questions."
            ],
            "long_term": [
                f"Work on deeper skills relevant to {role}.",
                "Participate in peer interviews and mentorship."
            ]
        }

    except Exception as e:
        print("⚠️ Gemini recommendation generation failed:", e)
        return {
            "short_term": ["Review key concepts regularly."],
            "long_term": ["Build a project relevant to your target job role."]
        }



# ✅ Your existing fallback method (no changes)
def _basic_recommendations(tech: int, comm: int, conf: int, prof: int, role: Optional[str]) -> Dict[str, list]:
    short_term = []
    long_term = []

    if tech < 70:
        short_term.append("Revise core DSA & Algorithms; solve 5 problems per week.")
    else:
        short_term.append("Keep practicing medium+ level problems and system design drills.")

    if comm < 70:
        short_term.append("Practice structured answers using the STAR method.")
    if conf < 60:
        short_term.append("Do 3 voice-recorded mock sessions weekly to build confidence.")

    long_term.append("Build an end-to-end project relevant to your target role.")
    if role:
        long_term.append(f"Follow a personalized roadmap for: {role}")

    return {"short_term": short_term, "long_term": long_term}

def compile_scores(evaluation_results: dict, metadata: Optional[dict] = None) -> Dict[str, dict]:
    """
    Combines evaluation results and Gemini-based feedback to create a structured report.
    Handles partial/incomplete interviews gracefully.
    """

    from .report_generator import generate_technical_feedback, generate_recommendations_dynamic

    # Handle empty or partial evaluations
    tech_score = evaluation_results.get("technical", 0)
    per_question = evaluation_results.get("per_question", [])
    
    # Generate feedback even for low/zero scores
    technical_feedback = generate_technical_feedback(
        tech_score,
        per_question,
        role=(metadata or {}).get("role")
    )

    # ✅ Get Gemini-based recommendations dynamically
    try:
        recommendations = generate_recommendations_dynamic(
            evaluation_results,
            role=(metadata or {}).get("role", "Software Engineer")
        )
    except Exception as e:
        print(f"⚠️ Failed to generate dynamic recommendations: {e}")
        # Fallback recommendations for partial interviews
        recommendations = {
            "short_term": ["Complete more practice interviews to build a full evaluation."],
            "long_term": ["Focus on consistency and completing interview sessions."]
        }

    # Add note if interview was incomplete
    note = evaluation_results.get("note", "")
    if note or len(per_question) == 0:
        technical_feedback = f"⚠️ Interview incomplete. {technical_feedback}"

    report = {
        "session_id": (metadata or {}).get("session_id"),
        "user_id": (metadata or {}).get("user_id"),
        "difficulty": (metadata or {}).get("difficulty"),
        "feedback": {
            "technical": technical_feedback,
            "communication": "Continue improving structure and clarity in responses." if len(per_question) > 0 else "Unable to evaluate - no responses recorded.",
            "confidence": "Maintain eye contact and steady tone during answers." if len(per_question) > 0 else "Unable to evaluate - no responses recorded.",
            "professionalism": "Good etiquette. Stay consistent across all interviews." if len(per_question) > 0 else "Unable to evaluate - no responses recorded."
        },
        "recommendations": recommendations
    }

    return report