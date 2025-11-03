
# Esquemas Pydantic (validação de entrada/saída).

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# ---- Utilizadores ----
class UserCreate(BaseModel):
    nome: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=6)

class UserOut(BaseModel):
    id: int
    nome: str
    email: EmailStr

    class Config:
        from_attributes = True

# ---- Autenticação ----
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ---- Mixes ----
class MixBase(BaseModel):
    nome: str
    flow_cor_base: str

class MixCreate(MixBase):
    pass

class MixUpdate(MixBase):
    pass

class ItemBase(BaseModel):
    media_titulo: str
    media_tipo: str  # 'audio' ou 'video'

class ItemCreate(ItemBase):
    pass

class ItemOut(ItemBase):
    id: int

    class Config:
        from_attributes = True

class MixOut(BaseModel):
    id: int
    nome: str
    flow_cor_base: str
    items: List[ItemOut] = []

    class Config:
        from_attributes = True
