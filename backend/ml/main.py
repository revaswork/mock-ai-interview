
# import json
# import uuid
# from datetime import datetime
# from .question_generator import generate_question
# from .speech_to_text import listen_to_user
# from .text_to_speech import speak_text, set_voice
# from .supabase_config import save_interview_session, save_evaluation, save_report, save_roadmap
# from .Evaluation import get_evaluation
# from .report_generator import compile_scores
# from .roadmap import generate_roadmap_dynamic   


# def load_resume_data():
#     """Loads parsed resume data from JSON file."""
#     with open("backend/parsed_resume.json", "r", encoding="utf-8") as f:
#         resume_data = json.load(f)
#     return resume_data


# def select_difficulty():
#     """Lets the user select the interview difficulty."""
#     print("\n🎯 Select Interview Difficulty Level:")
#     print("1️⃣  Easy")
#     print("2️⃣  Medium")
#     print("3️⃣  Difficult")

#     choice = input("Enter your choice (1/2/3): ").strip()

#     if choice == "1":
#         return "easy"
#     elif choice == "2":
#         return "medium"
#     elif choice == "3":
#         return "difficult"
#     else:
#         print("⚠️ Invalid input, defaulting to Medium.")
#         return "medium"


# def select_voice():
#     """Lets the user choose the avatar voice (CLI)."""
#     print("\n🎙️ Select Interviewer Voice (avatar):")
#     print("1️⃣  Monika - Calm & Professional")
#     print("2️⃣  Devajit - Friendly Female")
#     print("3️⃣  Shaurya - Confident Male")
#     print("4️⃣  Sia - Warm & Empathetic")

#     choice = input("Enter your choice (1/2/3/4) or press Enter for default: ").strip()
#     mapping = {"1": "Monika", "2": "Devajit", "3": "Shaurya", "4": "Sia"}
#     voice_name = mapping.get(choice, "Monika")

#     set_voice(voice_name)
#     print(f"✅ Selected voice: {voice_name}\n")
#     return voice_name


# def start_interview():
#     """Runs the adaptive AI Mock Interview with voice + Supabase integration."""
#     resume_data = load_resume_data()
#     difficulty_level = select_difficulty()
#     interviewer_voice = select_voice()

#     print(f"\n✅ Interview Difficulty Set To: {difficulty_level.capitalize()}")
#     print("------------------------------------------")

#     # 🧾 Initialize log for storing Q&A
#     conversation_log = []

#     # 🎤 Start with a warm-up question
#     question = generate_question(resume_data, difficulty=difficulty_level, first_question=True)
#     speak_text(question)
#     print(f"👩‍💼 Interviewer: {question}")

#     while True:
#         input("\n🔘 Press Enter to answer...")

#         user_answer = listen_to_user()
#         if not user_answer:
#             speak_text("I didn’t catch that. Could you please repeat?")
#             continue

#         print(f"🗣️ You said: {user_answer}")

#         # 💾 Log question and answer
#         conversation_log.append({
#             "question": question,
#             "answer": user_answer
#         })

#         # Exit condition
#         if user_answer.lower() in ["exit", "quit", "stop", "stop the interview"]:
#             speak_text("That concludes our interview. It was great talking to you!")
#             print("👩‍💼 Interviewer: Great! That concludes our session. Goodbye!")
#             break

#         # 🎯 Generate next adaptive question
#         next_question = generate_question(
#             resume_data,
#             previous_answer=user_answer,
#             difficulty=difficulty_level,
#             first_question=False
#         )

#         if not next_question:
#             speak_text("That concludes our interview. Thank you!")
#             print("👩‍💼 Interviewer: Thank you for your time. Goodbye!")
#             break

#         speak_text(next_question)
#         print(f"👩‍💼 Interviewer: {next_question}")
#         question = next_question  # update current question

#     # 🧠 After interview — save session, evaluation, report, and roadmap to Supabase
#     try:
#         session_id = str(uuid.uuid4())
#         user_name = input("\nPlease enter your name (for record keeping): ")

#         # ✅ Save interview session
#         save_interview_session(
#             session_id=session_id,
#             user_name=user_name,
#             difficulty=difficulty_level,
#             qa_pairs=conversation_log,
#         )
#         print("\n✅ Interview data successfully saved to Supabase!")

#         # ✅ Run evaluation
#         print("\n🧠 Generating evaluation for your interview... please wait...")
#         evaluation = get_evaluation(session_id)

#         # ✅ Save evaluation results
#         save_evaluation(session_id, evaluation)
#         print("✅ Evaluation saved to Supabase successfully!")

#         # ✅ Generate full report (feedback + recommendations)
#         report_data = compile_scores(
#             evaluation_results=evaluation,
#             metadata={
#                 "session_id": session_id,
#                 "user_id": user_name,
#                 "difficulty": difficulty_level,
#             },
#         )

#         # ✅ Save report to Supabase
#         save_report(session_id, report_data)
#         print("✅ Report saved to Supabase successfully!")

#         # ✅ Generate personalized roadmap
#         print("\n🧭 Generating personalized learning roadmap...")
#         roadmap = generate_roadmap_dynamic(evaluation, role=resume_data.get("role", "Software Engineer"))

#         # ✅ Save roadmap to Supabase
#         save_roadmap(session_id,user_name, roadmap)
#         print("✅ Roadmap saved to Supabase successfully!")

#         # ✅ Show summaries
#         print("\n📊 Evaluation Summary:")
#         print(f"Technical: {evaluation.get('technical')}%")
#         print(f"Communication: {evaluation.get('communication')}%")
#         print(f"Confidence: {evaluation.get('confidence')}%")
#         print(f"Professionalism: {evaluation.get('professionalism')}%")

#         print("\n📝 Feedback Summary:")
#         for category, fb in report_data["feedback"].items():
#             print(f"- {category.capitalize()}: {fb}")

#         print("\n📈 Recommended Next Steps:")
#         for step in report_data["recommendations"]["short_term"]:
#             print(f"• {step}")
#         for step in report_data["recommendations"]["long_term"]:
#             print(f"• {step}")

#         print("\n📍 Personalized Learning Roadmap:")
#         print("Focus Areas:")
#         for area in roadmap.get("focus_areas", []):
#             print(f"• {area}")

#         print("\nAction Plan:")
#         for action in roadmap.get("actions", []):
#             print(f"• {action}")

#         print("\nRecommended Resources:")
#         for resource in roadmap.get("resources", []):
#             print(f"• {resource}")

#     except Exception as e:
#         print(f"\n⚠️ Failed to save data, evaluation, report, or roadmap to Supabase: {e}")


# if __name__ == "__main__":
#     start_interview()

import json
import uuid
from datetime import datetime
from .question_generator import generate_question
from .speech_to_text import listen_to_user
from .text_to_speech import speak_text, set_voice
from .supabase_config import (
    save_interview_session,
    save_evaluation,
    save_report,
    save_roadmap,
    fetch_resume,  # ✅ Now pulling resume data from Supabase
)
from .Evaluation import get_evaluation
from .report_generator import compile_scores
from .roadmap import generate_roadmap_dynamic


def start_interview(user_name: str, difficulty_level: str, interviewer_voice: str):
    """
    Runs the adaptive AI Mock Interview with voice + Supabase integration.
    Designed for web use — frontend will send inputs (no CLI prompts).
    """
    print(f"\n🎯 Starting interview for: {user_name}")
    print(f"🧩 Difficulty Level: {difficulty_level.capitalize()}")
    print(f"🎙️ Selected Voice: {interviewer_voice}")
    print("------------------------------------------")

    # ✅ Set interviewer voice (frontend avatar selection)
    set_voice(interviewer_voice)

    # ✅ Load resume data from Supabase
    try:
        resume_data = fetch_resume(user_name)
        print("✅ Resume data successfully loaded from Supabase.")
    except Exception as e:
        print(f"⚠️ Failed to fetch resume for {user_name}: {e}")
        resume_data = {}

    # 🧾 Initialize conversation log
    conversation_log = []

    # 🎤 Start with a warm-up question
    question = generate_question(resume_data, difficulty=difficulty_level, first_question=True)
    speak_text(f"Hello {user_name}, let's begin your interview. {question}")
    print(f"👩‍💼 Interviewer: {question}")

    while True:
        # In frontend, this will be replaced by user audio input
        user_answer = listen_to_user()
        if not user_answer:
            speak_text("I didn’t catch that. Could you please repeat?")
            continue

        print(f"🗣️ Candidate ({user_name}): {user_answer}")

        conversation_log.append({
            "question": question,
            "answer": user_answer
        })

        # Exit condition
        if user_answer.lower() in ["exit", "quit", "stop", "stop the interview"]:
            speak_text("That concludes our interview. It was great talking to you!")
            print("👩‍💼 Interviewer: Great! That concludes our session. Goodbye!")
            break

        # 🎯 Generate next adaptive question
        next_question = generate_question(
            resume_data,
            previous_answer=user_answer,
            difficulty=difficulty_level,
            first_question=False
        )

        if not next_question:
            speak_text("That concludes our interview. Thank you!")
            print("👩‍💼 Interviewer: Thank you for your time. Goodbye!")
            break

        speak_text(next_question)
        print(f"👩‍💼 Interviewer: {next_question}")
        question = next_question

    # 🧠 After interview — save session, evaluation, report, and roadmap
    try:
        session_id = str(uuid.uuid4())

        # ✅ Save interview session
        save_interview_session(
            session_id=session_id,
            user_name=user_name,
            difficulty=difficulty_level,
            qa_pairs=conversation_log,
        )
        print("\n✅ Interview data successfully saved to Supabase!")

        # ✅ Generate evaluation
        print("\n🧠 Generating evaluation for your interview... please wait...")
        evaluation = get_evaluation(session_id)
        save_evaluation(session_id, evaluation)
        print("✅ Evaluation saved to Supabase successfully!")

        # ✅ Generate detailed report
        report_data = compile_scores(
            evaluation_results=evaluation,
            metadata={
                "session_id": session_id,
                "user_id": user_name,
                "difficulty": difficulty_level,
            },
        )
        save_report(session_id, report_data)
        print("✅ Report saved to Supabase successfully!")

        # ✅ Generate personalized roadmap
        print("\n🧭 Generating personalized learning roadmap...")
        roadmap = generate_roadmap_dynamic(
            evaluation,
            role=resume_data.get("role", "Software Engineer")
        )
        save_roadmap(session_id, user_name, roadmap)
        print("✅ Roadmap saved to Supabase successfully!")

        # ✅ Return structured response (for API integration)
        return {
            "status": "success",
            "session_id": session_id,
            "user_name": user_name,
            "evaluation": evaluation,
            "report": report_data,
            "roadmap": roadmap,
        }

    except Exception as e:
        print(f"\n⚠️ Failed to save data, evaluation, report, or roadmap to Supabase: {e}")
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    # 🧪 For standalone local testing only
    start_interview(
        user_name="Reva Shukla",
        difficulty_level="medium",
        interviewer_voice="Monika"
    )
