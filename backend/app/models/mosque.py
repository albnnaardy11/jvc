from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
import uuid
from app.core.database import Base

class Mosque(Base):
    __tablename__ = "mosques"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dkm_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    
    # In Supabase/PostgreSQL, we typically use PostGIS for Geometry.
    # For now, we store it as a WKT string or use a specific geometry type.
    location: Mapped[str] = mapped_column(String, nullable=False)  # e.g. "POINT(longitude latitude)"
    
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    dkm: Mapped["User"] = relationship("User")
