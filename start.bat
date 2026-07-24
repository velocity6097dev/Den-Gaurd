@echo off
title Den-Guard Bot

echo =========================================
echo          Den-Guard Bot Startup
echo =========================================
echo.

echo Do you want to deploy/sync slash commands to Discord? (y/n)
set /p deployChoice="Choice: "

if /i "%deployChoice%"=="y" (
    echo.
    echo 🔄 Deploying commands...
    node src/utils/deployCommands.js
    echo.
)

echo 🚀 Starting Den-Guard...
node src/index.js

echo.
pause