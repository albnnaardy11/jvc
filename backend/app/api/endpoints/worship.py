from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.user import User, UserProfile
from app.models.activity import WorshipActivity, ActivityType
from app.api import deps

router = APIRouter()

@router.post("/log")
async def log_worship_activity(
    activity_type: ActivityType,
    metric_value: int,  # e.g., pages read, prayer duration, or sedekah amount
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Log a daily worship activity (Tilawah, Jamaah prayer, Sedekah).
    Dynamically updates user streak if they log Tilawah.
    """
    activity = WorshipActivity(
        user_id=current_user.id,
        activity_type=activity_type,
        metric_value=metric_value
    )
    db.add(activity)
    
    # Bump streak if user logs tilawah
    profile: UserProfile | None = current_user.profile
    if activity_type == ActivityType.TILAWAH and profile:
        profile.streak_days += 1
        db.add(profile)
        
    await db.commit()
    
    return {
        "message": "Activity logged successfully",
        "activity_id": activity.id,
        "new_streak": profile.streak_days if profile else 0
    }

@router.get("/history")
async def get_worship_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get all worship activities logged by the current user.
    """
    result = await db.execute(
        select(WorshipActivity)
        .filter(WorshipActivity.user_id == current_user.id)
        .order_by(WorshipActivity.created_at.desc())
    )
    activities = result.scalars().all()
    
    return [
        {
            "id": act.id,
            "activity_type": act.activity_type,
            "metric_value": act.metric_value,
            "created_at": act.created_at
        }
        for act in activities
    ]

@router.get("/stats")
async def get_worship_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get aggregate worship stats for the dashboard.
    """
    result = await db.execute(
        select(WorshipActivity)
        .filter(WorshipActivity.user_id == current_user.id)
    )
    activities = result.scalars().all()
    
    total_tilawah_pages = sum(act.metric_value for act in activities if act.activity_type == ActivityType.TILAWAH)
    total_jamaah_prayers = sum(1 for act in activities if act.activity_type == ActivityType.JAMAAH)
    total_sedekah_rupiah = sum(act.metric_value for act in activities if act.activity_type == ActivityType.SEDEKAH)
    
    profile: UserProfile | None = current_user.profile
    return {
        "streak_days": profile.streak_days if profile else 0,
        "tajwid_score": profile.tajwid_score if profile else 0.0,
        "total_tilawah_pages": total_tilawah_pages,
        "total_jamaah_prayers": total_jamaah_prayers,
        "total_sedekah_rupiah": total_sedekah_rupiah
    }
