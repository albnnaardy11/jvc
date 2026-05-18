from decimal import Decimal
from sqlalchemy import Numeric, Enum, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional
import uuid
import enum
from app.core.database import Base

class TransactionStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

class Wallet(Base):
    __tablename__ = "wallets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, unique=True)  # Can be user_id or mosque_id
    balance: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0.00, nullable=False)
    
    updated_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    
class Transaction(Base):
    __tablename__ = "transactions"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_wallet_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("wallets.id"), nullable=False)
    receiver_wallet_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("wallets.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    status: Mapped[TransactionStatus] = mapped_column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    sender_wallet: Mapped["Wallet"] = relationship("Wallet", foreign_keys=[sender_wallet_id])
    receiver_wallet: Mapped["Wallet"] = relationship("Wallet", foreign_keys=[receiver_wallet_id])
