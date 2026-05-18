from datetime import timedelta
from typing import Any, cast
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.user import User, UserProfile, AccountRole
from app.api import deps

router = APIRouter()

@router.post("/login")
async def login_access_token(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    result = await db.execute(select(User).filter(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, cast(str, user.password_hash)):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            subject=user.id, role=user.account_role.value, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register")
async def register_user(
    email: str,
    password: str,
    display_name: str,
    role: AccountRole = AccountRole.USER,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Create new user and their profile.
    """
    result = await db.execute(select(User).filter(User.email == email))
    if result.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
        
    user = User(
        email=email,
        password_hash=get_password_hash(password),
        account_role=role,
    )
    profile = UserProfile(
        display_name=display_name,
    )
    user.profile = profile
    
    db.add(user)
    db.add(profile)
    await db.commit()
    await db.refresh(user)
    
    return {"message": "User created successfully", "user_id": user.id}

@router.get("/me")
async def read_users_me(
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get current user.
    """
    display_name = current_user.profile.display_name if current_user.profile else ""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "display_name": display_name,
        "role": current_user.account_role
    }
