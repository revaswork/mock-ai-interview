# # # avatar_generator_did.py

# import os
# import time
# import requests
# import json
# import base64
# from typing import Optional

# DID_API_KEY = os.getenv("DID_API_KEY")  # format: "email:password"
# DEFAULT_AVATAR_ID = os.getenv("DID_DEFAULT_AVATAR_ID", "PUT_YOUR_AVATAR_ID_HERE")

# POLL_INTERVAL_SECONDS = 2
# POLL_TIMEOUT_SECONDS = 180


# def _auth_headers():
#     """Generate required Basic Auth header for D-ID."""
#     if not DID_API_KEY:
#         return {}

#     # Base64("username:password")
#     encoded = base64.b64encode(DID_API_KEY.encode()).decode()

#     return {
#         "Accept": "application/json",
#         "Content-Type": "application/json",
#         "Authorization": f"Basic {encoded}",
#     }


# def generate_avatar_video(text: str, avatar_id: Optional[str] = None) -> Optional[str]:
#     avatar_id = avatar_id or DEFAULT_AVATAR_ID
#     print("FILE USED:", __file__)
#     print("DID_API_KEY loaded:", bool(DID_API_KEY))
#     print("Avatar ID:", avatar_id)
#     print("Text:", text[:150])

#     if not DID_API_KEY:
#         print("❌ DID_API_KEY missing!")
#         return None

#     headers = _auth_headers()

#     payload = {
#         "source": {"type": "avatar", "avatar_id": avatar_id},
#         "script": {"type": "text", "input": text},
#         "config": {
#             "format": "mp4",
#             "resolution": "720p",
#         },
#         "metadata": {"generated_by": "aimockinterview-backend"},
#     }

#     print("\n📦 PAYLOAD:")
#     print(json.dumps(payload, indent=2)[:2000])

#     # 1️⃣ Create talk
#     create_url = "https://api.d-id.com/talks"
#     try:
#         resp = requests.post(create_url, headers=headers, json=payload, timeout=30)
#         result = resp.json()
#     except:
#         print("❌ Bad response:", resp.text)
#         return None

#     print("\n📩 CREATE RESPONSE:")
#     print(json.dumps(result, indent=2))

#     talk_id = result.get("id")
#     if not talk_id:
#         print("❌ No talk ID returned!")
#         return None

#     print("🎬 TALK ID:", talk_id)

#     # 2️⃣ Poll
#     status_url = f"https://api.d-id.com/talks/{talk_id}"
#     start = time.time()

#     print("\n⏳ Polling for completion...")

#     while True:
#         r = requests.get(status_url, headers=headers)
#         try:
#             data = r.json()
#         except:
#             time.sleep(POLL_INTERVAL_SECONDS)
#             continue

#         block = data.get("data") or data
#         status = block.get("status")
#         print("⏱️ STATUS:", status)

#         video_url = block.get("result_url") or block.get("video_url")

#         if status == "done":
#             print("✅ VIDEO READY:", video_url)
#             return video_url

#         if status in ("failed", "error"):
#             print("❌ FAILED:", data)
#             return None

#         if time.time() - start > POLL_TIMEOUT_SECONDS:
#             print("❌ TIMEOUT waiting for D-ID")
#             return None

#         time.sleep(POLL_INTERVAL_SECONDS)

# avatar_generator_did.py

# avatar_generator_did.py

# 


"""
avatar_generator_did.py

D-ID helper that creates avatar videos from an image/presenter URL + text + voice.

Usage (from your API):
    from backend.ml.avatar_generator_did import generate_avatar_video
    video_url = generate_avatar_video(text, image_url, voice_id)

Environment:
  - DID_API_KEY : your D-ID API key in the format expected by D-ID (email:password or API token as required)

Returns:
  - final video URL (MP4) when completed, or
  - talk_id string if finished but no direct URL provided by D-ID (client can poll later), or
  - None on failure/timeout.

Notes:
  - This implementation uses Basic auth by base64-encoding the DID_API_KEY.
  - It supports using a presenter image URL (public D-ID presenter image) and overriding the voice
    by passing a Microsoft voice id (e.g. "en-IN-AartiNeural").
  - Polling defaults to 180s (3 minutes). You can shorten/lengthen by changing the constants.
"""

import os
import time
import requests
import json
import base64
from typing import Optional

# Load key from environment
DID_API_KEY = os.getenv("DID_API_KEY")  # expected like "email:password" or a D-ID API token per your account

# Polling configuration
POLL_INTERVAL_SECONDS = int(os.getenv("DID_POLL_INTERVAL", "2"))
POLL_TIMEOUT_SECONDS = int(os.getenv("DID_POLL_TIMEOUT", "180"))


def _auth_headers():
    """Return headers with Basic auth (base64 of DID_API_KEY)."""
    if not DID_API_KEY:
        return {}

    encoded = base64.b64encode(DID_API_KEY.encode()).decode()
    return {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Basic {encoded}",
    }


def generate_avatar_video(text: str, image_url: str, voice_id: Optional[str] = None) -> Optional[str]:
    """
    Create a D-ID 'talk' using an image URL (public presenter image) and Microsoft voice.
    D-ID will handle both video generation AND text-to-speech synthesis.

    Args:
        text: the script/text to speak.
        image_url: public D-ID presenter image url (e.g. https://clips-presenters.d-id.com/....png)
        voice_id: Microsoft voice id (e.g. "en-IN-AartiNeural"). Required for voice synthesis.

    Returns:
        Final video URL (mp4) if available, or the talk id (string) if completed without direct url,
        or None on error / timeout.
    """

    print("FILE USED:", __file__)
    print("DID_API_KEY loaded:", bool(DID_API_KEY))
    print("image_url:", image_url)
    print("voice_id:", voice_id)
    print("text preview:", text[:120].replace("\n", " "))

    if not DID_API_KEY:
        print("❌ DID_API_KEY missing — set DID_API_KEY in your .env")
        return None

    headers = _auth_headers()

    # Build script block with D-ID's built-in TTS
    script_block = {"type": "text", "input": text}
    if voice_id:
        # Use Microsoft voice for synthesis
        script_block["provider"] = {"type": "microsoft", "voice_id": voice_id}
        print(f"🎙️ Using D-ID TTS with Microsoft voice: {voice_id}")

    payload = {
        "source": {"type": "image", "url": image_url},
        "script": script_block,
        "config": {
            "format": "mp4",
            "resolution": "720p",
            # optionally set fluent/streaming flags here
        },
        "metadata": {"generated_by": "aimockinterview-backend"},
    }

    # Debug prints (trim long payload)
    try:
        print("\n📦 PAYLOAD SENT to D-ID:")
        print(json.dumps(payload, indent=2)[:3000])
    except Exception:
        pass

    create_url = "https://api.d-id.com/talks"

    try:
        resp = requests.post(create_url, headers=headers, json=payload, timeout=30)
    except Exception as e:
        print("❌ Error calling D-ID create:", e)
        return None

    # parse response
    try:
        result = resp.json()
    except Exception:
        print("❌ Non-JSON response from D-ID create:", resp.status_code, resp.text[:1000])
        return None

    print("\n📩 /talks create response:")
    print(json.dumps(result, indent=2)[:3000])

    # D-ID returns 'id' for the talk (sometimes under data.id)
    talk_id = result.get("id") or (result.get("data") or {}).get("id")
    # fallback: sometimes API returns video_id directly
    if not talk_id:
        talk_id = (result.get("data") or {}).get("video_id") or result.get("video_id")

    if not talk_id:
        print("❌ No talk/video id returned — create failed or payload invalid.")
        return None

    print("🎬 TALK ID:", talk_id)

    # Poll the talk status until finished
    status_url = f"https://api.d-id.com/talks/{talk_id}"
    start = time.time()
    print("\n⏳ Polling for video completion... (timeout %s seconds)" % POLL_TIMEOUT_SECONDS)

    while True:
        try:
            status_resp = requests.get(status_url, headers=headers, timeout=15)
        except Exception as e:
            print("❌ Error polling status:", e)
            if time.time() - start > POLL_TIMEOUT_SECONDS:
                print("❌ Polling timed out (network error).")
                return None
            time.sleep(POLL_INTERVAL_SECONDS)
            continue

        try:
            status_data = status_resp.json()
        except Exception:
            print("❌ Non-JSON status response:", status_resp.status_code, status_resp.text[:1000])
            if time.time() - start > POLL_TIMEOUT_SECONDS:
                print("❌ Polling timed out.")
                return None
            time.sleep(POLL_INTERVAL_SECONDS)
            continue

        # D-ID typically returns a `data` block; normalize
        block = status_data.get("data") or status_data
        status = (block.get("status") or block.get("state") or "")
        print("⏱️ status:", status)

        # Common places D-ID puts the final URL
        video_url = block.get("video_url") or block.get("result_url") or (block.get("video") or {}).get("url")

        # Success states vary: done/completed/succeeded/finished/ready
        if isinstance(status, str) and status.lower() in ("done", "completed", "succeeded", "finished", "ready"):
            if video_url:
                print("✅ VIDEO READY:", video_url)
                return video_url
            # finished but no url — return talk id so caller can fetch later
            print("✅ Finished but no direct URL found — returning talk_id:", talk_id)
            return talk_id

        if isinstance(status, str) and status.lower() in ("failed", "error"):
            print("❌ Video generation failed:", json.dumps(status_data, indent=2)[:2000])
            return None

        if time.time() - start > POLL_TIMEOUT_SECONDS:
            print("❌ Timeout waiting for D-ID to finish (polling stopped).")
            # D-ID may email the video or you can fetch later using talk_id
            return None

        time.sleep(POLL_INTERVAL_SECONDS)
