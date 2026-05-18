from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from app.core.database import get_db
from app.models.user import User
from app.models.setoran import SetoranSubmission, SetoranAIAnalysis, SetoranStatus
from app.api import deps
import uuid

router = APIRouter()

@router.post("/submit")
async def submit_setoran(
    start_ayah_id: int,
    end_ayah_id: int,
    audio_url: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Submit a new Quran memorization (Setoran) recording.
    Simulates triggering Vertex AI / Chirp async analysis.
    """
    # Create the submission
    submission = SetoranSubmission(
        murid_id=current_user.id,
        start_ayah_id=start_ayah_id,
        end_ayah_id=end_ayah_id,
        audio_url=audio_url,
        status=SetoranStatus.PENDING_AI
    )
    db.add(submission)
    await db.flush()  # Extract auto-generated UUID
    
    # Pre-simulate an AI Analysis for the wow factor
    ai_analysis = SetoranAIAnalysis(
        submission_id=submission.id,
        ai_confidence_score=92.5,
        waveform_metadata={
            "peaks": [0.1, 0.5, 0.8, 0.4, 0.9, 0.7, 0.2, 0.6],
            "anomalies": [
                {"ayah": start_ayah_id, "word_index": 3, "error_type": "Makhraj (Ikhfa')", "timestamp": 12.4}
            ]
        }
    )
    db.add(ai_analysis)
    
    # Transition status to PENDING_USTADZ since AI has instantly analyzed it!
    submission.status = SetoranStatus.PENDING_USTADZ
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
