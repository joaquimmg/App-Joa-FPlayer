@echo off
REM Script para ativar o ambiente virtual e iniciar o servidor FastAPI

cd /d "%~dp0"

echo ========================================
echo  Joalin FlowPlayer - Backend API
echo ========================================
echo.

REM Verifica se o ambiente virtual existe
if not exist ".venv\Scripts\activate.bat" (
    echo [ERRO] Ambiente virtual nao encontrado!
    echo Por favor, crie o ambiente virtual primeiro.
    echo.
    pause
    exit /b 1
)

echo [1/3] Ativando ambiente virtual...
call .venv\Scripts\activate.bat

echo [2/3] Verificando dependencias...
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo [AVISO] Dependencias nao instaladas!
    echo Instalando dependencias...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo [3/3] Iniciando servidor FastAPI...
echo.

REM Obter o IP da máquina automaticamente
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "IP=%%a"
    goto :found
)
:found
set IP=%IP:~1%

echo ========================================
echo  Backend disponivel em:
echo  - Local: http://localhost:8000
echo  - Rede:  http://%IP%:8000
echo.
echo  IMPORTANTE: Configure este IP em:
echo  app/src/services/api.ts
echo.
echo  Documentacao:
echo  - Swagger: http://localhost:8000/docs
echo  - ReDoc:   http://localhost:8000/redoc
echo ========================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
