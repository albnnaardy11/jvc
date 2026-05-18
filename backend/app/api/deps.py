from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy.dialects.postgresql import UUID
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, AccountRole
import uuid

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(
    db: AsyncSession = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str | None = payload.get("sub")
        if not isinstance(user_id, str):
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(
        select(User)
        .options(joinedload(User.profile))
        .filter(User.id == uuid.UUID(user_id))
    )
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    # Future: check if user is active/banned
    return current_user

async def get_current_ustadz(
    current_user: User = Depends(get_current_active_user)
) -> User:
    if current_user.account_role != AccountRole.USTADZ:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges (Ustadz role required)"
        )
    return current_user

async def get_current_dkm(
    current_user: User = Depends(get_current_active_user)
) -> User:
    if current_user.account_role != AccountRole.DKM:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges (DKM role required)"
        )
    return current_user
