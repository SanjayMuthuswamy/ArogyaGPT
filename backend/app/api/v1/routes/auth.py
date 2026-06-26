import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter()

DEV_DEMO_EMAIL = os.getenv('DEV_DEMO_EMAIL', 'dev@example.com')
DEV_DEMO_PASSWORD = os.getenv('DEV_DEMO_PASSWORD', 'dev123456')


class AuthRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    message: str
    success: bool


@router.post('/signup', response_model=AuthResponse)
async def signup(payload: AuthRequest):
    if not payload.password or len(payload.password) < 6:
        raise HTTPException(status_code=400, detail='Password must be at least 6 characters long')

    return AuthResponse(message='Signup successful. Backend auth placeholder is active.', success=True)


@router.post('/signin', response_model=AuthResponse)
async def signin(payload: AuthRequest):
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail='Email and password are required')

    if payload.email.lower() == DEV_DEMO_EMAIL.lower() and payload.password == DEV_DEMO_PASSWORD:
        return AuthResponse(message='Signin successful. Demo user authenticated.', success=True)

    raise HTTPException(status_code=401, detail='Invalid credentials')
