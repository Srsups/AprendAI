from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name      : str   = Field(..., min_length=2, max_length=255)
    email     : EmailStr
    password  : str   = Field(..., min_length=8, max_length=100)
    is_teacher: bool  = False


class LoginRequest(BaseModel):
    email   : EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type  : str = "bearer"


class UserResponse(BaseModel):
    id        : str
    name      : str
    email     : str
    is_teacher: bool
    subscription_plan: str = "free"

    model_config = {"from_attributes": True}


# ─── Recuperação de senha ─────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token       : str
    new_password: str = Field(..., min_length=8, max_length=100)