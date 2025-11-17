

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
import os
from fastapi import UploadFile
from pydub import AudioSegment

# Configure pydub to use explicit ffmpeg path
AudioSegment.converter = r"C:\ffmpeg\bin\ffmpeg.exe"
AudioSegment.ffprobe = r"C:\ffmpeg\bin\ffprobe.exe"

def listen_to_user():
    """[MIC] Listens via microphone (CLI mode)."""
    recognizer = sr.Recognizer()
    mic = sr.Microphone()

    with mic as source:
        print("[MIC] Listening... Speak now!")
        recognizer.adjust_for_ambient_noise(source, duration=1)
        recognizer.pause_threshold = 4
        recognizer.energy_threshold = 300
        recognizer.dynamic_energy_threshold = True

        try:
            audio = recognizer.listen(source, timeout=None, phrase_time_limit=40)
            print("[PROCESSING] Processing your answer...")
        except sr.WaitTimeoutError:
            print("[WARNING] Listening timed out, please try again.")
            return ""

    try:
        user_text = recognizer.recognize_google(audio)
        print(f"[SPEECH] You said: {user_text}")
        return user_text
    except sr.UnknownValueError:
        print("[WARNING] Sorry, I couldn't understand your response.")
        return ""
    except sr.RequestError:
        print("[WARNING] Speech service is down.")
        return ""


def convert_audio_to_text(file: UploadFile) -> str:
    """[AUDIO] Converts uploaded audio (from frontend) to text - with WebM to WAV conversion."""
    recognizer = sr.Recognizer()
    temp_webm_path = None
    temp_wav_path = None
    
    try:
        # Save uploaded file temporarily (as WebM from frontend)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_webm:
            content = file.file.read()
            temp_webm.write(content)
            temp_webm.flush()
            temp_webm_path = temp_webm.name
            print(f"[FILE] Saved WebM file: {temp_webm_path} ({len(content)} bytes)")

        # Convert WebM to WAV using pydub
        print(f"[CONVERT] Converting WebM to WAV...")
        try:
            audio = AudioSegment.from_file(temp_webm_path, format="webm")
        except Exception as conv_err:
            print(f"[ERROR] Pydub conversion failed: {conv_err}")
            print("[INFO] Make sure ffmpeg is installed: https://ffmpeg.org/download.html")
            raise
        
        # Normalize / resample to improve STT accuracy: 16kHz, mono, 16-bit PCM
        try:
            duration_s = len(audio) / 1000.0
            dbfs = audio.dBFS if hasattr(audio, 'dBFS') else None
            print(f"[AUDIO] Original duration: {duration_s:.2f}s, loudness: {dbfs}")
        except Exception:
            pass

        audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)

        # Save as WAV (PCM 16-bit, 16kHz, mono)
        temp_wav_path = temp_webm_path.replace(".webm", ".wav")
        audio.export(temp_wav_path, format="wav")
        print(f"[OK] Conversion complete: {temp_wav_path} (16kHz, mono)")
        
        # Load and transcribe
        with sr.AudioFile(temp_wav_path) as source:
            audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)
        print(f"[SPEECH] Transcribed (file): {text}")
        
        return text

    except sr.UnknownValueError:
        print("[WARNING] Could not understand the audio.")
        return "Sorry, I couldn't understand that."
    except sr.RequestError as e:
        print(f"[WARNING] Speech recognition API error: {e}")
        return "Speech recognition service failed."
    except Exception as e:
        print(f"[WARNING] Error processing uploaded audio: {e}")
        import traceback
        traceback.print_exc()
        return "Error processing audio. Check server logs for details."
    finally:
        # Cleanup
        if temp_webm_path and os.path.exists(temp_webm_path):
            try:
                os.remove(temp_webm_path)
            except Exception:
                pass
        if temp_wav_path and os.path.exists(temp_wav_path):
            try:
                os.remove(temp_wav_path)
            except Exception:
                pass
