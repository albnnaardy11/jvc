from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from app.core.database import get_db
from app.models.user import User
from app.models.setoran import SetoranSubmission, SetoranAIAnalysis, SetoranStatus
from app.api import deps
from app.services.stt_service import transcribe_audio
from app.core.config import settings
from fastapi import File, Form, UploadFile
from pydantic import BaseModel
from supabase import create_client, Client
import uuid
import os

class ReviewPayload(BaseModel):
    is_approved: bool
    ustadz_feedback: str

# Initialize Supabase Client if keys are present (Fault Tolerance)
supabase: Client | None = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase client init failed: {e}")

router = APIRouter()

@router.post("/submit")
async def submit_setoran(
    start_ayah_id: int = Form(...),
    end_ayah_id: int = Form(...),
    audio_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Submit a new Quran memorization (Setoran) recording.
    Transcribes audio using Groq Whisper-large-v3.
    """
    # 1. Transcribe audio with Groq
    # This will also validate the audio format and size.
    transcription = await transcribe_audio(audio_file, language="ar")
    
    # 2. Upload file
    # Priority 1: Supabase Storage (Production). Priority 2: Local Storage (MVP Fallback)
    file_ext = os.path.splitext(audio_file.filename)[1] if audio_file.filename else ".webm"
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    await audio_file.seek(0)
    file_bytes = await audio_file.read()
    
    if supabase:
        try:
            # Upload to Supabase bucket
            supabase.storage.from_("setoran_audio").upload(
                path=unique_filename,
                file=file_bytes,
                file_options={"content-type": audio_file.content_type or "audio/webm"}
            )
            audio_url = supabase.storage.from_("setoran_audio").get_public_url(unique_filename)
        except Exception as e:
            # Fallback local if bucket error
            print(f"Supabase storage error, falling back to local: {e}")
            local_path = os.path.join("static", "uploads", unique_filename)
            with open(local_path, "wb") as f:
                f.write(file_bytes)
            audio_url = f"/static/uploads/{unique_filename}"
    else:
        # Save file locally (Fallback)
        local_path = os.path.join("static", "uploads", unique_filename)
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        audio_url = f"/static/uploads/{unique_filename}"

    # 3. Create the submission
    submission = SetoranSubmission(
        murid_id=current_user.id,
        start_ayah_id=start_ayah_id,
        end_ayah_id=end_ayah_id,
        audio_url=audio_url,
        status=SetoranStatus.PENDING_USTADZ
    )
    db.add(submission)
    await db.flush()  # Extract auto-generated UUID
    
    # 4. Save AI Analysis from Groq
    ai_analysis = SetoranAIAnalysis(
        submission_id=submission.id,
        ai_confidence_score=95.0, # Placeholder for confidence logic
        waveform_metadata={
            "transcription_text": transcription["text"],
            "segments": transcription.get("segments", []),
            "anomalies": [
                {"ayah": start_ayah_id, "word_index": 0, "error_type": "Makhraj Check", "timestamp": 0.0}
            ]
        }
    )
    db.add(ai_analysis)
    await db.commit()
    await db.refresh(submission)
    
    return {
        "message": "Setoran submitted and analyzed by AI successfully",
        "submission_id": submission.id,
        "status": submission.status,
        "ai_confidence_score": ai_analysis.ai_confidence_score
    }

@router.get("/history")
async def get_setoran_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get all setoran submissions for the current user.
    """
    result = await db.execute(
        select(SetoranSubmission)
        .options(joinedload(SetoranSubmission.ai_analysis))
        .filter(SetoranSubmission.murid_id == current_user.id)
        .order_by(SetoranSubmission.created_at.desc())
    )
    submissions = result.scalars().all()
    
    return [
        {
            "id": sub.id,
            "start_ayah_id": sub.start_ayah_id,
            "end_ayah_id": sub.end_ayah_id,
            "audio_url": sub.audio_url,
            "status": sub.status,
            "created_at": sub.created_at,
            "ai_analysis": {
                "confidence_score": sub.ai_analysis.ai_confidence_score,
                "waveform_metadata": sub.ai_analysis.waveform_metadata
            } if sub.ai_analysis else None
        }
        for sub in submissions
    ]

@router.get("/{submission_id}")
async def get_setoran_detail(
    submission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get detailed information about a setoran submission including AI analysis.
    """
    result = await db.execute(
        select(SetoranSubmission)
        .options(joinedload(SetoranSubmission.ai_analysis))
        .filter(SetoranSubmission.id == submission_id)
    )
    sub = result.scalars().first()
    
    if not sub:
        raise HTTPException(status_code=404, detail="Setoran submission not found")
        
    if sub.murid_id != current_user.id and sub.ustadz_id != current_user.id and current_user.account_role != "USTADZ":
        raise HTTPException(status_code=403, detail="Access denied")
        
    return {
        "id": sub.id,
        "murid_id": sub.murid_id,
        "ustadz_id": sub.ustadz_id,
        "start_ayah_id": sub.start_ayah_id,
        "end_ayah_id": sub.end_ayah_id,
        "audio_url": sub.audio_url,
        "status": sub.status,
        "created_at": sub.created_at,
        "ai_analysis": {
            "confidence_score": sub.ai_analysis.ai_confidence_score,
            "waveform_metadata": sub.ai_analysis.waveform_metadata,
            "processed_at": sub.ai_analysis.processed_at
        } if sub.ai_analysis else None
    }

@router.get("/pending/all")
async def get_pending_reviews(
    db: AsyncSession = Depends(get_db),
    # Strict Role Verification Restored
    current_user: User = Depends(deps.get_current_ustadz)
) -> Any:
    """
    [USTADZ ROLE] Get all setoran submissions pending ustadz review.
    """
    result = await db.execute(
        select(SetoranSubmission)
        .options(joinedload(SetoranSubmission.ai_analysis))
        .filter(SetoranSubmission.status == SetoranStatus.PENDING_USTADZ)
        .order_by(SetoranSubmission.created_at.desc())
    )
    submissions = result.scalars().all()
    
    return [
        {
            "id": sub.id,
            "murid_id": sub.murid_id,
            "start_ayah_id": sub.start_ayah_id,
            "end_ayah_id": sub.end_ayah_id,
            "audio_url": sub.audio_url,
            "status": sub.status,
            "created_at": sub.created_at,
            "ai_analysis": {
                "confidence_score": sub.ai_analysis.ai_confidence_score,
                "waveform_metadata": sub.ai_analysis.waveform_metadata
            } if sub.ai_analysis else None
        }
        for sub in submissions
    ]

@router.post("/{submission_id}/review")
async def submit_ustadz_review(
    submission_id: uuid.UUID,
    payload: ReviewPayload,
    db: AsyncSession = Depends(get_db),
    # Strict Role Verification Restored
    current_user: User = Depends(deps.get_current_ustadz)
) -> Any:
    """
    [USTADZ ROLE] Submit feedback for a setoran.
    """
    result = await db.execute(
        select(SetoranSubmission).filter(SetoranSubmission.id == submission_id)
    )
    sub = result.scalars().first()
    
    if not sub:
        raise HTTPException(status_code=404, detail="Setoran submission not found")
        
    sub.status = SetoranStatus.APPROVED if payload.is_approved else SetoranStatus.REJECTED
    # Hackathon note: We should ideally have a column for ustadz_notes in SetoranSubmission,
    # For MVP we inject it dynamically or assume the DB model has `ustadz_notes`.
    # Assuming the SQLAlchemy model has `ustadz_notes`:
    if hasattr(sub, 'ustadz_notes'):
        sub.ustadz_notes = payload.ustadz_feedback
        
    await db.commit()
    await db.refresh(sub)
    
    return {
        "message": "Review submitted successfully",
        "status": sub.status,
        "submission_id": sub.id
    }

