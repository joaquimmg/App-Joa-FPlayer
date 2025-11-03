
# Ponto de entrada da aplicação FastAPI. Inclui routers e cria as tabelas.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth_router, mixes_router
from .config import ALLOWED_ORIGINS

# Cria as tabelas (se não existirem)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Joalin FlowPlayer API", version="1.0.0")

# CORS básico para permitir o app mobile em desenvolvimento
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Em dev, "*" é suficiente
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Regista as rotas
app.include_router(auth_router.router)   # /auth/...
app.include_router(mixes_router.router)  # /mixes/...

# Health check opcional
@app.get("/")
def root():
    return {"status": "ok", "service": "joalin-flowplayer-api"}
