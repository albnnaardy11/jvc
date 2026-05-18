from sqlalchemy import String, Enum, Integer, DateTime, ForeignKey, Float, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional
import uuid
import enum
from app.core.database import Base

class SetoranStatus(str, enum.Enum):
    PENDING_AI = "PENDING_AI"
    PENDING_USTADZ = "PENDING_USTADZ"
    REVISION = "REVISION"
    ACCEPTED = "ACCEPTED"

class SetoranSubmission(Base):
    __tablename__ = "setoran_submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    murid_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    ustadz_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # Assigned later
    start_ayah_id: Mapped[int] = mapped_column(Integer, ForeignKey("quran_ayahs.id"), nullable=False)
    end_ayah_id: Mapped[int] = mapped_column(Integer, ForeignKey("quran_ayahs.id"), nullable=False)
    audio_url: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[SetoranStatus] = mapped_column(Enum(SetoranStatus), default=SetoranStatus.PENDING_AI)
    
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    murid: Mapped["User"] = relationship("User", foreign_keys=[murid_id])
    ustadz: Mapped[Optional["User"]] = relationship("User", foreign_keys=[ustadz_id])
    ai_analysis: Mapped[Optional["SetoranAIAnalysis"]] = relationship("SetoranAIAnalysis", back_populates="submission", uselist=False)

class SetoranAIAnalysis(Base):
    __tablename__ = "setoran_ai_analysis"

    submission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("setoran_submissions.id"), primary_key=True)
    waveform_metadata: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    ai_confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    processed_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    submission: Mapped["SetoranSubmission"] = relationship("SetoranSubmission", back_populates="ai_analysis")
