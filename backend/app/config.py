
# Configurações básicas do backend, como a SECRET_KEY do JWT e o algoritmo.

import os
from datetime import timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "troca_esta_chave_por_uma_muito_forte")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # token expira em 60 minutos por padrão

# CORS básico (se fores testar no dispositivo)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
