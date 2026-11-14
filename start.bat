@echo off
title Flame in Freefall Launcher
echo =======================================================
echo        🔥 Launching Flame in Freefall Full Stack
echo =======================================================

set ROOT_DIR=%~dp0
set PY_EXE=C:\Users\Admin\AppData\Local\Programs\Python\Python312\python.exe

if exist "%ROOT_DIR%.venv\Scripts\python.exe" (
    set PY_EXE="%ROOT_DIR%.venv\Scripts\python.exe"
)

echo Starting FastAPI Backend on port 8000...
start "Flame Backend (FastAPI)" cmd /k "cd /d "%ROOT_DIR%" && %PY_EXE% -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting React Vite Frontend...
start "Flame Frontend (Vite)" cmd /k "cd /d "%ROOT_DIR%frontend" && npm run dev"

echo.
echo =======================================================
echo Both servers have been launched in separate windows!
echo - Backend:  http://127.0.0.1:8000/docs
echo - Frontend: http://localhost:5174 (or 5173)
echo =======================================================
pause
