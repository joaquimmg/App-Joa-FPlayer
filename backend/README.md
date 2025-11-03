# Backend Joalin FlowPlayer API

API REST construída com **FastAPI** para gerir autenticação de utilizadores e mixes de média.

## Requisitos

- Python 3.10 ou superior
- Ambiente virtual (`.venv`)

## Instalação

### 1. Ativar o ambiente virtual

**Windows (CMD):**
```cmd
.venv\Scripts\activate.bat
```

**Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
```

### 2. Instalar dependências

```cmd
pip install -r requirements.txt
```

Ou use o script automático:
```cmd
install.bat
```

## Executar o Servidor

### Método 1: Script Automático
```cmd
start.bat
```

### Método 2: Manual
```cmd
.venv\Scripts\activate.bat
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Método 3: Com parâmetros personalizados
```cmd
.venv\Scripts\activate.bat
uvicorn app.main:app --reload --host 192.168.100.3 --port 8000
```

## Testar o Backend

Execute o script de teste:
```cmd
.venv\Scripts\activate.bat
python test_backend.py
```

## Endpoints Disponíveis

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/` | Health check | Não |
| POST | `/auth/registar` | Registar novo utilizador | Não |
| POST | `/auth/token` | Login (obter JWT token) | Não |
| GET | `/mixes` | Listar mixes do utilizador | Sim |
| POST | `/mixes` | Criar novo mix | Sim |
| PUT | `/mixes/{mix_id}` | Atualizar mix | Sim |
| DELETE | `/mixes/{mix_id}` | Apagar mix | Sim |
| POST | `/mixes/{mix_id}/items` | Adicionar item ao mix | Sim |
| DELETE | `/mixes/{mix_id}/items/{item_id}` | Remover item do mix | Sim |

## Documentação da API

Após iniciar o servidor, aceda:

- **Swagger UI (interativo)**: http://localhost:8000/docs
- **ReDoc (alternativo)**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Autenticação

A API usa **JWT (JSON Web Tokens)** para autenticação.

### 1. Registar Utilizador

```bash
POST /auth/registar
Content-Type: application/json

{
  "nome": "João Mercado",
  "email": "joao@example.com",
  "password": "senha123"
}
```

### 2. Fazer Login

```bash
POST /auth/token
Content-Type: application/x-www-form-urlencoded

username=joao@example.com&password=senha123
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Usar o Token

Adicione o header nas requisições protegidas:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Banco de Dados

- **Tipo**: SQLite
- **Ficheiro**: `app.db` (criado automaticamente)
- **ORM**: SQLAlchemy

### Tabelas:

1. **users** - Utilizadores registados
2. **mixes** - Mixes criados pelos utilizadores
3. **itens_mix** - Itens de média dentro dos mixes

## Configuração

Edite `app/config.py` para alterar:

- `SECRET_KEY` - Chave secreta para JWT ( mude em produção!)
- `ALGORITHM` - Algoritmo de encriptação (padrão: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Tempo de expiração do token
- `ALLOWED_ORIGINS` - CORS (origens permitidas)

### Variáveis de Ambiente

Pode definir via variáveis de ambiente:

```cmd
set SECRET_KEY=sua_chave_super_secreta
set ALLOWED_ORIGINS=http://localhost:8081,http://192.168.100.3:8081
```

## Estrutura do Projeto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Ponto de entrada
│   ├── config.py            # Configurações
│   ├── database.py          # Conexão BD
│   ├── models.py            # Modelos SQLAlchemy
│   ├── schemas.py           # Schemas Pydantic
│   ├── auth.py              # Autenticação JWT
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth_router.py   # Rotas de auth
│   │   └── mixes_router.py  # Rotas de mixes
│   └── utils/
│       ├── __init__.py
│       └── security.py      # Hash de passwords
├── .venv/                   # Ambiente virtual
├── requirements.txt         # Dependências
├── install.bat             # Script de instalação
├── start.bat               # Script de inicialização
├── test_backend.py         # Testes
└── README.md               # Este ficheiro
```

## Resolução de Problemas

### Erro: "Module not found"
```cmd
pip install -r requirements.txt
```

### Erro: "No module named 'app'"
Certifique-se de estar no diretório `backend/` ao executar:
```cmd
cd backend
uvicorn app.main:app --reload
```

### Erro: "Port already in use"
Mude a porta:
```cmd
uvicorn app.main:app --reload --port 8001
```

### Erro de CORS
Adicione a origem do frontend em `config.py`:
```python
ALLOWED_ORIGINS = ["http://localhost:8081", "http://192.168.100.3:8081"]
```

## Notas de Desenvolvimento

- O servidor **recarrega automaticamente** quando ficheiros são alterados (modo `--reload`)
- A base de dados é criada automaticamente na primeira execução
- Os tokens JWT expiram após 60 minutos (configurável)
- As passwords são hasheadas com **bcrypt**

## Segurança

 **IMPORTANTE para produção:**

1. Mude a `SECRET_KEY` em `config.py`
2. Use HTTPS (não HTTP)
3. Configure CORS corretamente
4. Use variáveis de ambiente para segredos
5. Ative rate limiting
6. Use base de dados PostgreSQL/MySQL (não SQLite)

## Suporte

Em caso de dúvidas ou problemas, verifique:
- Documentação FastAPI: https://fastapi.tiangolo.com/
- Documentação SQLAlchemy: https://www.sqlalchemy.org/
