

# backend/ml/evaluation.py
import os
import json
import re
import numpy as np
from typing import Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai
from supabase_config import supabase, save_evaluation  


# ✅ Load environment variables
load_dotenv()

# ✅ Configure Gemini API securely
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


# ---------- Heuristic Scoring ----------
def analyze_communication(answer: str) -> float:
    words = len(answer.split())
    sentences = answer.count('.')
    if words < 10:
        return 0.5
    elif words < 40:
        return 0.8
    elif sentences > 5:
        return 0.75
    else:
        return 0.7


def analyze_confidence(answer: str) -> float:
    confident = ["definitely", "certainly", "of course", "I did", "I worked"]
    hesitant = ["maybe", "probably", "not sure", "I think"]
    score = 0.7
    for w in confident:
        if w in answer.lower():
            score += 0.1
    for w in hesitant:
        if w in answer.lower():
            score -= 0.1
    return min(max(score, 0.4), 1.0)


def analyze_professionalism(answer: str) -> float:
    pro = ["team", "collaborated", "developed", "thank", "appreciate", "worked"]
    neg = ["lazy", "blame", "hate", "stuck"]
    score = 0.75
    for w in pro:
        if w in answer.lower():
            score += 0.05
    for w in neg:
        if w in answer.lower():
            score -= 0.1
    return min(max(score, 0.4), 1.0)


# ---------- Gemini Technical Scoring ----------
def get_technical_score_gemini(question: str, answer: str) -> Dict[str, Any]:
    prompt = f"""
You are a senior technical interviewer.
Judge *technical accuracy, completeness, and conceptual depth*.

Question: "{question}"
Candidate Answer: "{answer}"

Return ONLY valid JSON like:
{{"score": 0-100, "feedback": "one-sentence technical evaluation"}}
"""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        print("🔹 Raw Gemini output:", text)

        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group())
                score = float(parsed.get("score", 65))
                feedback = parsed.get("feedback", "Good understanding; could add more detail.")
                return {"score": score, "feedback": feedback}
            except Exception as parse_err:
                print("⚠️ JSON parse failed:", parse_err)

        num_match = re.search(r'(\d{1,3})', text)
        score = float(num_match.group(1)) if num_match else 65
        return {"score": score, "feedback": text[:120] or "Partial response from Gemini."}

    except Exception as e:
        print("⚠️ Gemini scoring failed:", e)
        return {"score": 60, "feedback": "Unable to analyze technically; default score applied."}


# ---------- Main Evaluation ----------
def get_evaluation(session_id: str) -> Dict[str, Any]:
    """Fetch interview data from Supabase and evaluate answers."""
    try:
        # ✅ Fetch interview record
        response = supabase.table("interviews").select("*").eq("session_id", session_id).execute()

        if not response.data:
            raise ValueError(f"No data found for session_id: {session_id}")

        record = response.data[0]
        interview_data_raw = record.get("interview_data")

        # ✅ Convert JSON string back to Python list
        interview_data = json.loads(interview_data_raw) if isinstance(interview_data_raw, str) else interview_data_raw

        # ✅ Handle empty or partial interviews
        if not interview_data or len(interview_data) == 0:
            print("⚠️ No Q&A pairs found - returning default low scores")
            return {
                "session_id": session_id,
                "technical": 0,
                "communication": 0,
                "confidence": 0,
                "professionalism": 0,
                "per_question": [],
                "note": "Interview ended with no answered questions"
            }

        per_question_feedback = []
        tech_scores, comm_scores, conf_scores, prof_scores = [], [], [], []

        for qa in interview_data:
            q = qa.get("question", "")
            a = qa.get("answer", "")

            # Gemini evaluation
            gemini_result = get_technical_score_gemini(q, a)
            tech_score = gemini_result["score"]
            feedback = gemini_result["feedback"]

            # Heuristic scoring
            comm = analyze_communication(a)
            conf = analyze_confidence(a)
            prof = analyze_professionalism(a)

            per_question_feedback.append({
                "question": q,
                "technical_score": tech_score,
                "feedback": feedback
            })

            tech_scores.append(tech_score / 100)
            comm_scores.append(comm)
            conf_scores.append(conf)
            prof_scores.append(prof)

        # ✅ Calculate averages with fallback for empty arrays
        evaluation = {
            "session_id": session_id,
            "technical": round(np.mean(tech_scores) * 100, 2) if tech_scores else 0,
            "communication": round(np.mean(comm_scores) * 100, 2) if comm_scores else 0,
            "confidence": round(np.mean(conf_scores) * 100, 2) if conf_scores else 0,
            "professionalism": round(np.mean(prof_scores) * 100, 2) if prof_scores else 0,
            "per_question": per_question_feedback
        }

        print("✅ Evaluation complete for session:", session_id)

        # ✅ Save to Supabase
        try:
            save_evaluation(session_id, evaluation)
            print("✅ Evaluation saved to Supabase successfully!")
        except Exception as e:
            print(f"⚠️ Failed to save evaluation to Supabase: {e}")

        return evaluation

    except Exception as e:
        print("⚠️ Evaluation failed:", e)
        return {"error": str(e)}
