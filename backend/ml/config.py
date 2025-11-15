import os
from pathlib import Path
from dotenv import load_dotenv

# ------------------------------------------------------
# 🌍 Locate the .env file (search from project root up)
# ------------------------------------------------------
possible_paths = [
    Path(__file__).resolve().parent.parent.parent / ".env",  # root level
    Path(__file__).resolve().parent.parent / ".env",         # backend/
    Path(__file__).resolve().parent / ".env",                # backend/ml/
]

env_loaded = False
for path in possible_paths:
    if path.exists():
        load_dotenv(dotenv_path=path)
        print(f"✅ .env file found and loaded from: {path}")
        env_loaded = True
        break

if not env_loaded:
    print("⚠️ No .env file found in expected locations!")

# ------------------------------------------------------
# 🔑 Load environment variables
# ------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.0-flash"

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# ------------------------------------------------------
# ✅ Sanity checks with warnings
# ------------------------------------------------------
if GEMINI_API_KEY:
    print("🔹 Gemini API key loaded successfully.")
else:
    print("❌ GEMINI_API_KEY missing in .env file!")

if ELEVENLABS_API_KEY:
    print("🔹 ElevenLabs API key loaded successfully.")
else:
    print("⚠️ ELEVENLABS_API_KEY missing — voice synthesis may not work.")

if SUPABASE_URL and SUPABASE_KEY:
    print("🔹 Supabase credentials loaded successfully.")
else:
    print("⚠️ Missing Supabase credentials in .env file.")
