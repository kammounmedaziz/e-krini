#!/bin/bash

# Face Authentication Service Startup Script

echo "Starting Face Authentication Service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r face_auth/requirements.txt

# Start the Flask API
echo "Starting Flask API server on port 5001..."
python face_auth_api.py