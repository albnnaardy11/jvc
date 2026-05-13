from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# 1. Create Async Engine
engine = create_async_engine(
    settings.POSTGRES_URL,
    echo=True, # Set False in production
    future=True
)

# 2. Create Session Local
AsyncSessionLocal = async_sessionmaker(
    engine, 
    expire_on_commit=False
)

# 3. Base class for all models
Base = declarative_base()

# Dependency to get DB session in FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
