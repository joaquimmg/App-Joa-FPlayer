
# Funções de hashing e verificação de password.

import bcrypt

def gerar_hash(password: str) -> str:
    """Gera hash bcrypt para a password."""
    # Converte string para bytes
    password_bytes = password.encode('utf-8')
    # Trunca para 72 bytes (limite do bcrypt)
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    # Gera salt e hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Retorna como string
    return hashed.decode('utf-8')

def verificar_password(password: str, hashed: str) -> bool:
    """Verifica se a password corresponde ao hash."""
    # Converte strings para bytes
    password_bytes = password.encode('utf-8')
    # Trunca para 72 bytes (limite do bcrypt)
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    hashed_bytes = hashed.encode('utf-8')
    # Verifica
    return bcrypt.checkpw(password_bytes, hashed_bytes)
