from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    is_teacher: bool = False

    @field_validator("password")
    @classmethod
    def validate_password_bcrypt_limit(cls, value: str) -> str:
        # bcrypt suporta no maximo 72 bytes no segredo.
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Senha muito longa para o algoritmo atual (maximo: 72 bytes).")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    is_teacher: bool

    model_config = {"from_attributes": True}