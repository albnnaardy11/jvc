from sqlalchemy import Column, String, Enum, Float, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from app.core.database import Base

class AccountRole(str, enum.Enum):
    USER = "USER"
    USTADZ = "USTADZ"
    DKM = "DKM"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    display_name = Column(String, nullable=False)
    account_role = Column(Enum(AccountRole), default=AccountRole.USER)
    
    # Stats
    tajwid_score = Column(Float, default=0.0)
    streak_days = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
