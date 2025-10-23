#!/bin/bash

# LILERP Backend Server Startup Script
# This script starts the LILERP backend server with proper checks

echo "============================================================"
echo "🚀 LILERP Backend Server Startup Script"
echo "============================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found:${NC} $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found:${NC} $(npm --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL not found${NC}"
    echo "Installing PostgreSQL..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
fi

# Check if PostgreSQL is running
if ! sudo service postgresql status > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running${NC}"
    echo "Starting PostgreSQL..."
    sudo service postgresql start
    sleep 2
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Check if database exists
DB_EXISTS=$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -w lilerp_development | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Database 'lilerp_development' does not exist${NC}"
    echo "Creating database..."
    sudo -u postgres psql -c "CREATE DATABASE lilerp_development;" 2>/dev/null || echo "Database may already exist"
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'password';" 2>/dev/null
    echo -e "${GREEN}✅ Database created${NC}"
else
    echo -e "${GREEN}✅ Database 'lilerp_development' exists${NC}"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
        echo -e "${YELLOW}⚠️  Please update .env with your Twilio credentials${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found${NC}"
    echo "Installing dependencies..."
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Check if port 3001 is already in use
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3001 is already in use${NC}"
    echo "Would you like to kill the existing process? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        PID=$(lsof -ti:3001)
        kill -9 $PID
        echo -e "${GREEN}✅ Killed process on port 3001${NC}"
        sleep 1
    else
        echo "Please stop the existing server or use a different port"
        exit 1
    fi
fi

# Check for server file
if [ -f "server.js" ]; then
    SERVER_FILE="server.js"
    echo -e "${GREEN}✅ Using server: server.js${NC}"
else
    echo -e "${RED}❌ server.js not found${NC}"
    exit 1
fi

echo ""
echo "============================================================"
echo "🎯 Starting LILERP Backend Server..."
echo "============================================================"
echo ""
echo "Server file: $SERVER_FILE"
echo "Port: 3001"
echo "Database: lilerp_development"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "============================================================"
echo ""

# Start the server
node $SERVER_FILE

