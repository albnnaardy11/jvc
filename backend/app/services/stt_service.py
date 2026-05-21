"""
Speech-to-Text Service using Groq API (Whisper-large-v3).

AI_Rules compliance:
- Section 6: Groq is the EXCLUSIVE STT engine. Python SDK only.
- Server-side ONLY — API key never exposed to client.
- Audio validated before forwarding to Groq.
"""

import os
import io
from groq import Groq
from fastapi import HTTPException, UploadFile
from app.core.config import settings

SUPPORTED_AUDIO_FORMATS = {"audio/mpeg", "audio/mp4", "audio/m4a", "audio/webm", "audio/wav", "audio/ogg"}
MAX_AUDIO_BYTES = 25 * 1024 * 1024  # Groq Whisper limit: 25 MB

# Client is instantiated once at module load
_client = Groq(api_key=settings.GROQ_API_KEY)


async def transcribe_audio(file: UploadFile, language: str = "ar") -> dict:
    """
    Transcribe an uploaded audio file using Groq Whisper-large-v3.

    Args:
        file:     FastAPI UploadFile object from the multipart/form-data request.
        language: BCP-47 language code. Default 'ar' (Arabic) for Quran setoran.
                  Pass 'id' for Indonesian-language submissions.

    Returns:
        dict with keys: `text` (transcribed string), `language`, `filename`.

    Raises:
        HTTPException 415: if the audio format is unsupported.
        HTTPException 413: if the file exceeds the 25 MB Groq limit.
        HTTPException 502: if the Groq API returns an error.
    """
    # 1. Validate MIME type
    if file.content_type not in SUPPORTED_AUDIO_FORMATS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported audio format: '{file.content_type}'. "
                   f"Accepted: {', '.join(SUPPORTED_AUDIO_FORMATS)}"
        )

    # 2. Read and validate file size
    audio_bytes = await file.read()
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Audio file too large ({len(audio_bytes) / 1024 / 1024:.1f} MB). "
                   f"Maximum allowed: 25 MB."
        )

    # 3. Forward to Groq Whisper-large-v3
    try:
        transcription = _client.audio.transcriptions.create(
            file=(file.filename or "audio.m4a", io.BytesIO(audio_bytes)),
            model="whisper-large-v3",
            language=language,
            response_format="verbose_json",  # Includes word timestamps for Makhraj error pinpointing
            temperature=0.0,                 # Deterministic output — critical for scoring consistency
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Groq STT API error: {str(e)}"
        )

    return {
        "text": transcription.text,
        "language": language,
        "filename": file.filename,
        # verbose_json provides word-level segments for waveform anomaly markers
        "segments": getattr(transcription, "segments", []),
    }
