
# Endpoints: /auth/registar e /auth/token

from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import UserCreate, UserOut, Token
from ..models import User
from ..utils.security import gerar_hash, verificar_password
from ..auth import criar_token_acesso, obter_user_por_email

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/registar", response_model=UserOut)
def registar(user_in: UserCreate, db: Session = Depends(get_db)):
    print(f"[DEBUG] Recebido pedido de registo: {user_in.email}")
    
    # Impede registos duplicados com o mesmo e-mail
    if obter_user_por_email(db, user_in.email):
        print(f"[WARN] E-mail já existe: {user_in.email}")
        raise HTTPException(status_code=400, detail="E-mail já registado.")
    
    # Cria utilizador com password hasheada
    try:
        user = User(
            nome=user_in.nome,
            email=user_in.email,
            hashed_password=gerar_hash(user_in.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"[SUCCESS] Utilizador registado: {user.email}")
        return user
    except Exception as e:
        print(f"[ERROR] Erro ao registar: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao registar: {str(e)}")

@router.post("/token", response_model=Token)
def login(
    db: Session = Depends(get_db),
    username: str = Form(...),  # OAuth2: 'username' e 'password' via x-www-form-urlencoded
    password: str = Form(...)
):
    print(f"[DEBUG] Tentativa de login: {username}")
    
    user = obter_user_por_email(db, username)
    if not user:
        print(f"[WARN] Utilizador não encontrado: {username}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
    
    if not verificar_password(password, user.hashed_password):
        print(f"[WARN] Password incorreta para: {username}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
    
    access_token = criar_token_acesso({"sub": user.email})
    print(f"[SUCCESS] Login bem-sucedido: {username}")
    return {"access_token": access_token, "token_type": "bearer"}
