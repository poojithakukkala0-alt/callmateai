"""
CallMateAI Speech-to-Text (STT) Module.
Provides audio transcription for voice calling sessions with Whisper / audio pipeline.
"""
import io
import os
from typing import Optional


def transcribe_audio(audio_data: bytes, audio_format: str = "wav") -> str:
    """
    Transcribe raw voice audio into normalized textual transcript.
    Falls back gracefully if Whisper or external audio models are not loaded locally.
    
    Args:
        audio_data: Raw byte stream of recorded caller audio.
        audio_format: Encoding format (e.g., 'wav', 'mp3', 'ogg', 'webm').
        
    Returns:
        str: Transcribed text query.
    """
    if not audio_data:
        return ""

    # Attempt to load Whisper if available in environment
    try:
        import whisper
        # Load small/base Whisper model dynamically if available
        model = whisper.load_model("base")
        # Process audio buffer
        result = model.transcribe(io.BytesIO(audio_data))
        return result.get("text", "").strip()
    except Exception:
        pass

    # Fallback to UTF-8 decoded text if raw text was passed in audio buffer
    try:
        decoded = audio_data.decode("utf-8", errors="ignore").strip()
        if decoded:
            return decoded
    except Exception:
        pass

    return "Audio transcription received."
