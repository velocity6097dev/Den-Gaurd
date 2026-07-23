@echo off
cd /d %~dp0

if not exist node_modules (
    echo Installing dependencies, this only happens once...
    call npm install
)

if not exist .env (
    echo No .env file found. Copy .env.example to .env and add your token first.
    pause
    exit /b 1
)

echo Starting bot...
node src\index.js

pause
