import asyncio
import json

# Import the API module where we updated the wiring
import backend.ml.api as api

# Dummy speak_text that simulates ElevenLabs upload
def dummy_speak_text(text):
    print("[dummy_speak_text] called with text:", text[:60])
    return {
        "audio_base64": "ZmFrZV9iYXNlNjRfZGF0YQ==",
        "audio_url": "https://kvfxusqastoeapcymafj.supabase.co/storage/v1/object/public/audio/fake_audio.mp3",
    }

# Dummy generate_avatar_video to assert audio_url is passed
def dummy_generate_avatar_video(text, image_url, voice_id, audio_url=None):
    print("[dummy_generate_avatar_video] called")
    print(" text:", text[:60])
    print(" image_url:", image_url)
    print(" voice_id:", voice_id)
    print(" audio_url:", audio_url)
    # Return a fake video URL
    return "https://d-id.fake/videos/fake_video.mp4"

# Replace functions in the api module
api.speak_text = dummy_speak_text
api.generate_avatar_video = dummy_generate_avatar_video

async def run_test():
    # Build a minimal resume JSON string expected by handle_answer
    resume = {"name": "Test User", "skills": ["python", "sql"]}
    resume_json = json.dumps(resume)

    # Call the endpoint handler (async function)
    response = await api.handle_answer(
        session_id=None,
        user_name="Test User",
        difficulty="medium",
        voice_name="Sia",
        resume_data=resume_json,
        current_question="start",
        user_answer=None,
        audio_file=None,
    )

    print('\n== Response from handle_answer ==')
    print(response)

if __name__ == "__main__":
    asyncio.run(run_test())
