from sqlalchemy import Integer, Enum, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
import uuid
import enum
from app.core.database import Base

class ActivityType(str, enum.Enum):
    TILAWAH = "TILAWAH"
    JAMAAH = "JAMAAH"
    SEDEKAH = "SEDEKAH"

class WorshipActivity(Base):
    __tablename__ = "worship_activities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    activity_type: Mapped[ActivityType] = mapped_column(Enum(ActivityType), nullable=False)
    metric_value: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g., duration in seconds or amount
    
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    user: Mapped["User"] = relationship("User")
