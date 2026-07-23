#!/usr/bin/env bash
cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies, this only happens once..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "No .env file found. Copy .env.example to .env and add your token first."
    exit 1
fi

echo "Starting bot..."
node src/index.js
