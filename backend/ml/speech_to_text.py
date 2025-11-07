

# import speech_recognition as sr

# def listen_to_user():
#     """Records audio when user presses button and returns transcribed text."""
#     recognizer = sr.Recognizer()
#     mic = sr.Microphone()

#     with mic as source:
#         print("🎤 Listening... Speak now!")
#         recognizer.adjust_for_ambient_noise(source, duration=1)  # handle background noise
#         recognizer.pause_threshold = 4  # wait 2.5 seconds of silence before stopping
#         recognizer.energy_threshold = 300  # ignore very faint background sounds
#         recognizer.dynamic_energy_threshold = True

#         try:
#             # listen for up to 25 seconds, with silence tolerance
#             audio = recognizer.listen(source, timeout=None, phrase_time_limit=40)
#             print("⏳ Processing your answer...")
#         except sr.WaitTimeoutError:
#             print("⚠️ Listening timed out, please try again.")
#             return ""

#     try:
#         user_text = recognizer.recognize_google(audio)
#         print(f"🗣️ You said: {user_text}")
#         return user_text
#     except sr.UnknownValueError:
#         print("⚠️ Sorry, I couldn't understand your response.")
#         return ""
#     except sr.RequestError:
#         print("⚠️ Speech service is down.")
#         return ""


import speech_recognition as sr
import tempfile
from fastapi import UploadFile

def listen_to_user():
    """🎤 Listens via microphone (CLI mode)."""
    recognizer = sr.Recognizer()
    mic = sr.Microphone()

    with mic as source:
        print("🎤 Listening... Speak now!")
        recognizer.adjust_for_ambient_noise(source, duration=1)
        recognizer.pause_threshold = 4
        recognizer.energy_threshold = 300
        recognizer.dynamic_energy_threshold = True

        try:
            audio = recognizer.listen(source, timeout=None, phrase_time_limit=40)
            print("⏳ Processing your answer...")
        except sr.WaitTimeoutError:
            print("⚠️ Listening timed out, please try again.")
            return ""

    try:
        user_text = recognizer.recognize_google(audio)
        print(f"🗣️ You said: {user_text}")
        return user_text
    except sr.UnknownValueError:
        print("⚠️ Sorry, I couldn't understand your response.")
        return ""
    except sr.RequestError:
        print("⚠️ Speech service is down.")
        return ""


def convert_audio_to_text(file: UploadFile) -> str:
    """🎧 Converts uploaded audio (from frontend) to text."""
    recognizer = sr.Recognizer()
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            temp_audio.write(file.file.read())
            temp_audio.flush()
            temp_audio_path = temp_audio.name

        # Load and transcribe
        with sr.AudioFile(temp_audio_path) as source:
            audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)
        print(f"🗣️ Transcribed (file): {text}")
        return text

    except sr.UnknownValueError:
        print("⚠️ Could not understand the audio.")
        return "Sorry, I couldn’t understand that."
    except sr.RequestError as e:
        print(f"⚠️ Speech recognition API error: {e}")
        return "Speech recognition service failed."
    except Exception as e:
        print(f"⚠️ Error processing uploaded audio: {e}")
        return "Error processing audio."
