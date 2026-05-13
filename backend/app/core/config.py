from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Quranic SuperApp Enterprise API"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []

    # Database
    POSTGRES_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/sanad_db"
    
    # GCP
    # GCP_PROJECT_ID: str

    # Tambahkan env_file agar Pydantic membaca dari file .env secara otomatis
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
