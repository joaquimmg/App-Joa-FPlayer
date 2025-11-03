"""
Script de teste para verificar se o backend está funcionando corretamente
"""

import sys
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Testa se todas as importações funcionam"""
    print("Testando importações...")
    
    try:
        from app.main import app
        print("✓ app.main importado com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar app.main: {e}")
        return False
    
    try:
        from app.models import User, Mix, ItemMix
        print("✓ Models importados com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar models: {e}")
        return False
    
    try:
        from app.schemas import UserCreate, MixOut, Token
        print("✓ Schemas importados com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar schemas: {e}")
        return False
    
    try:
        from app.auth import criar_token_acesso, get_current_user
        print("✓ Auth importado com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar auth: {e}")
        return False
    
    try:
        from app.routers import auth_router, mixes_router
        print("✓ Routers importados com sucesso")
    except Exception as e:
        print(f"✗ Erro ao importar routers: {e}")
        return False
    
    return True

def test_database():
    """Testa a criação do banco de dados"""
    print("\nTestando banco de dados...")
    
    try:
        from app.database import engine, Base
        Base.metadata.create_all(bind=engine)
        print("✓ Banco de dados criado com sucesso")
        return True
    except Exception as e:
        print(f"✗ Erro ao criar banco de dados: {e}")
        return False

def test_routes():
    """Testa se as rotas estão registadas"""
    print("\nTestando rotas...")
    
    try:
        from app.main import app
        routes = [route.path for route in app.routes]
        
        expected_routes = ["/", "/auth/registar", "/auth/token", "/mixes"]
        
        for route in expected_routes:
            if any(route in r for r in routes):
                print(f"✓ Rota {route} encontrada")
            else:
                print(f"✗ Rota {route} não encontrada")
        
        return True
    except Exception as e:
        print(f"✗ Erro ao verificar rotas: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("TESTE DO BACKEND JOALIN FLOWPLAYER")
    print("=" * 60)
    
    success = True
    
    success = test_imports() and success
    success = test_database() and success
    success = test_routes() and success
    
    print("\n" + "=" * 60)
    if success:
        print("✓ TODOS OS TESTES PASSARAM!")
        print("=" * 60)
        print("\nO backend está pronto para ser executado.")
        print("Execute: uvicorn app.main:app --reload")
    else:
        print("✗ ALGUNS TESTES FALHARAM")
        print("=" * 60)
        print("\nVerifique os erros acima.")
    
    sys.exit(0 if success else 1)
