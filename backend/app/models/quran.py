from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class QuranAyah(Base):
    __tablename__ = "quran_ayahs"
    
    # Note: We use Integers here because the Quran is static and universal (6,236 Ayahs).
    # UUIDs are unnecessary overhead for static reference data.
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)  # 1 to 6236
    surah_id: Mapped[int] = mapped_column(Integer, nullable=False)
    ayah_number_in_surah: Mapped[int] = mapped_column(Integer, nullable=False)
    juz_number: Mapped[int] = mapped_column(Integer, nullable=False)
    hizb_number: Mapped[int] = mapped_column(Integer, nullable=False)
    rubu_el_hizb_number: Mapped[int] = mapped_column(Integer, nullable=False)  # Maqra'
    ruku_number: Mapped[int] = mapped_column(Integer, nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    manzil_number: Mapped[int] = mapped_column(Integer, nullable=False)
