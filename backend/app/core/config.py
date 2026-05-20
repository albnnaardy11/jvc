from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Quranic SuperApp Enterprise API"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []

    # Database
    POSTGRES_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/Talaqqi"
    
    # JWT Auth
    SECRET_KEY: str = "juaravibecoding-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Groq STT (Whisper-large-v3)
    GROQ_API_KEY: str = ""

    # Supabase Storage Credentials
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # Tambahkan env_file agar Pydantic membaca dari file .env secara otomatis
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
