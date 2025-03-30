#!/bin/bash

# Build the Docker image
echo "Building Docker image..."
docker build -t collaborative-ide-executor:latest .

# Test the container
echo "Testing container..."
docker run --rm collaborative-ide-executor:latest python -c "import pygame; print(f'Pygame version: {pygame.version.ver}')"

echo "Docker setup complete!" 