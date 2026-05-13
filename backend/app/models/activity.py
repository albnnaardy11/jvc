from sqlalchemy import Column, Integer, Enum, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from app.core.database import Base
from app.models.user import func

class ActivityType(str, enum.Enum):
    TILAWAH = "TILAWAH"
    JAMAAH = "JAMAAH"
    SEDEKAH = "SEDEKAH"

class WorshipActivity(Base):
    __tablename__ = "worship_activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    activity_type = Column(Enum(ActivityType), nullable=False)
    metric_value = Column(Integer, nullable=False) # e.g., duration in seconds or amount
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
