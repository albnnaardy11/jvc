from sqlalchemy import Column, String, Enum, Integer, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
import enum
from app.core.database import Base
from app.models.user import func

class SetoranStatus(str, enum.Enum):
    PENDING_AI = "PENDING_AI"
    PENDING_USTADZ = "PENDING_USTADZ"
    REVISION = "REVISION"
    ACCEPTED = "ACCEPTED"

class SetoranSubmission(Base):
    __tablename__ = "setoran_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    murid_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    ustadz_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # Assigned later
    start_ayah_id = Column(Integer, nullable=False)
    end_ayah_id = Column(Integer, nullable=False)
    audio_url = Column(String, nullable=False)
    status = Column(Enum(SetoranStatus), default=SetoranStatus.PENDING_AI)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    murid = relationship("User", foreign_keys=[murid_id])
    ustadz = relationship("User", foreign_keys=[ustadz_id])
    ai_analysis = relationship("SetoranAIAnalysis", back_populates="submission", uselist=False)

class SetoranAIAnalysis(Base):
    __tablename__ = "setoran_ai_analysis"

    submission_id = Column(UUID(as_uuid=True), ForeignKey("setoran_submissions.id"), primary_key=True)
    waveform_metadata = Column(JSONB, nullable=True)
    ai_confidence_score = Column(Float, nullable=True)
    processed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    submission = relationship("SetoranSubmission", back_populates="ai_analysis")
