@echo off
echo ========================================
echo LKS Translator - Backend Setup Script
echo ========================================
echo.

cd backend

echo [1/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [2/5] Checking for .env file...
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please edit backend\.env with your PostgreSQL credentials!
    echo    - Set DB_PASSWORD to your PostgreSQL password
    echo    - Set JWT_SECRET to a strong random string
    echo.
    pause
)
echo.

echo [3/5] Would you like to run database migration now? (y/n)
set /p migrate="Enter choice: "
if /i "%migrate%"=="y" (
    echo Running database migration...
    call npm run db:migrate
    if %errorlevel% neq 0 (
        echo ERROR: Migration failed. Please check your database configuration.
        pause
        exit /b 1
    )
)
echo.

echo [4/5] Backend setup complete!
echo.

echo [5/5] Would you like to start the backend server now? (y/n)
set /p start="Enter choice: "
if /i "%start%"=="y" (
    echo Starting backend server...
    call npm run dev
) else (
    echo.
    echo To start the backend later, run: cd backend && npm run dev
)

pause
