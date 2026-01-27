#!/bin/bash

echo "========================================"
echo "LKS Translator - Backend Setup Script"
echo "========================================"
echo ""

cd backend

echo "[1/5] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo ""

echo "[2/5] Checking for .env file..."
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit backend/.env with your PostgreSQL credentials!"
    echo "   - Set DB_PASSWORD to your PostgreSQL password"
    echo "   - Set JWT_SECRET to a strong random string"
    echo ""
    read -p "Press enter to continue..."
fi
echo ""

echo "[3/5] Would you like to run database migration now? (y/n)"
read -p "Enter choice: " migrate
if [ "$migrate" = "y" ] || [ "$migrate" = "Y" ]; then
    echo "Running database migration..."
    npm run db:migrate
    if [ $? -ne 0 ]; then
        echo "ERROR: Migration failed. Please check your database configuration."
        exit 1
    fi
fi
echo ""

echo "[4/5] Backend setup complete!"
echo ""

echo "[5/5] Would you like to start the backend server now? (y/n)"
read -p "Enter choice: " start
if [ "$start" = "y" ] || [ "$start" = "Y" ]; then
    echo "Starting backend server..."
    npm run dev
else
    echo ""
    echo "To start the backend later, run: cd backend && npm run dev"
fi
