from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Quranic SuperApp Enterprise API"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    # Database
    # SPANNER_INSTANCE_ID: str
    # SPANNER_DATABASE_ID: str
    
    # GCP
    # GCP_PROJECT_ID: str

    class Config:
        case_sensitive = True

settings = Settings()
