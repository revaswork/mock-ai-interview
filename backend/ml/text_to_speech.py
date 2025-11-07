
# # backend/ml/text_to_speech.py
# import os
# import pyttsx3
# from elevenlabs import ElevenLabs, stream
# from .config import ELEVENLABS_API_KEY

# # Check if ElevenLabs API is available
# USE_ELEVEN = bool(ELEVENLABS_API_KEY)

# if USE_ELEVEN:
#     client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# # Voice IDs for your avatars
# VOICE_OPTIONS = {
#     "Monika": "EaBs7G1VibMrNAuz2Na7",   # Calm & professional
#     "Devajit": "gkYRuS6pUw0UJKhibzSx",  # Friendly 
#     "Shaurya": "lyPbHf3pO5t4kYZYenaY",  # Confident male
#     "Sia": "Lw21wLjWqPPaL3TcYWek",      # Warm & empathetic
# }

# CURRENT_VOICE = "Monika"  # default


# def set_voice(voice_name: str):
#     """Switch interviewer voice (called when user selects voice)."""
#     global CURRENT_VOICE
#     if voice_name in VOICE_OPTIONS:
#         CURRENT_VOICE = voice_name
#         print(f"🎤 Voice set to: {voice_name}")
#     else:
#         print(f"⚠️ Voice '{voice_name}' not found. Using default voice: {CURRENT_VOICE}")


# def get_current_voice():
#     """Return the currently selected interviewer voice."""
#     return CURRENT_VOICE


# def speak_text(text: str):
#     """Convert interviewer text to speech using ElevenLabs if available, else pyttsx3."""
#     if USE_ELEVEN:
#         try:
#             # ✅ Correct usage for ElevenLabs streaming
#             audio_stream = client.text_to_speech.convert(
#                 voice_id=VOICE_OPTIONS[CURRENT_VOICE],
#                 model_id="eleven_multilingual_v2",
#                 text=text,
#                 output_format="mp3_44100_128",
#             )
#             # Stream the audio (real-time playback)
#             stream(audio_stream)
#             return
#         except Exception as e:
#             print(f"⚠️ ElevenLabs failed, falling back to local TTS: {e}")

#     # 🗣️ Local TTS fallback
#     try:
#         engine = pyttsx3.init()
#         engine.setProperty("rate", 175)
#         engine.say(text)
#         engine.runAndWait()
#     except Exception as e:
#         print(f"⚠️ Local TTS failed: {e}")
#         print(f"👩‍💼 Interviewer: {text}")

# backend/ml/text_to_speech.py
import os
import base64
import tempfile
import uuid
import pyttsx3
from elevenlabs import ElevenLabs
from .config import ELEVENLABS_API_KEY
from .supabase_config import supabase

# ✅ ElevenLabs setup
USE_ELEVEN = bool(ELEVENLABS_API_KEY)
if USE_ELEVEN:
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# ✅ Voice IDs (ElevenLabs voice models)
VOICE_OPTIONS = {
    "Monika": "EaBs7G1VibMrNAuz2Na7",   # Calm & professional
    "Devajit": "gkYRuS6pUw0UJKhibzSx",  # Friendly
    "Shaurya": "lyPbHf3pO5t4kYZYenaY",  # Confident male
    "Sia": "Lw21wLjWqPPaL3TcYWek",      # Warm & empathetic
}

CURRENT_VOICE = "Monika"  # default


def set_voice(voice_name: str):
    """Switch interviewer voice."""
    global CURRENT_VOICE
    if voice_name in VOICE_OPTIONS:
        CURRENT_VOICE = voice_name
        print(f"🎤 Voice set to: {voice_name}")
    else:
        print(f"⚠️ Voice '{voice_name}' not found. Using default voice: {CURRENT_VOICE}")


def get_current_voice():
    """Return the currently selected interviewer voice."""
    return CURRENT_VOICE


def speak_text(text: str, play_local: bool = False):
    """
    Convert interviewer text to speech.
    ✅ ElevenLabs primary
    ✅ Fallback to pyttsx3
    ✅ Upload to Supabase + return both Base64 + public URL
    """
    audio_base64, audio_url = None, None

    try:
        if USE_ELEVEN:
            print(f"🎧 Generating ElevenLabs voice for: {CURRENT_VOICE}")
            audio_stream = client.text_to_speech.convert(
                voice_id=VOICE_OPTIONS[CURRENT_VOICE],
                model_id="eleven_multilingual_v2",
                text=text,
                output_format="mp3_44100_128",
            )

            audio_bytes = b"".join(audio_stream)

            # ▶ CLI playback (for testing)
            if play_local:
                with open("temp_output.mp3", "wb") as f:
                    f.write(audio_bytes)
                os.system("start temp_output.mp3")

            # 🔹 Convert to Base64
            audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

            # ☁ Upload to Supabase Storage
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
            temp_file.write(audio_bytes)
            temp_file.flush()

            file_name = f"interview_audio/{uuid.uuid4()}.mp3"
            supabase.storage.from_("audio").upload(file_name, temp_file.name)

            # ✅ Corrected: remove space in URL
            audio_url = f"https://kvfxusqastoeapcymafj.supabase.co/storage/v1/object/public/audio/{file_name}"

            return {
                "audio_base64": audio_base64,
                "audio_url": audio_url,
            }

    except Exception as e:
        print(f"⚠️ ElevenLabs failed: {e}. Falling back to local TTS...")

    # 🧠 Local fallback TTS
        # 🧠 Local Fallback Audio (pyttsx3)
    try:
        print("🔁 Using local TTS fallback (pyttsx3)...")
        engine = pyttsx3.init()
        engine.setProperty("rate", 175)

        fallback_path = f"fallback_{uuid.uuid4()}.mp3"
        engine.save_to_file(text, fallback_path)
        engine.runAndWait()

        # Convert to Base64
        with open(fallback_path, "rb") as f:
            fallback_bytes = f.read()
        audio_base64 = base64.b64encode(fallback_bytes).decode("utf-8")

        # ☁ Upload to Supabase Storage (if available)
        try:
            file_name = f"interview_audio/fallback_{uuid.uuid4()}.mp3"
            supabase.storage.from_("audio").upload(file_name, fallback_path)
            audio_url = f"https://kvfxusqastoeapcymafj.supabase.co/storage/v1/object/public/audio/{file_name}"
        except Exception as upload_error:
            print(f"⚠️ Supabase upload failed: {upload_error}")
            audio_url = None

        return {
            "audio_base64": audio_base64,
            "audio_url": audio_url,
        }

    except Exception as fallback_error:
        print(f"❌ Local fallback TTS failed: {fallback_error}")
        print(f"👩‍💼 Interviewer: {text}")
        return {"audio_base64": None, "audio_url": None}
