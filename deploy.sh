#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Variables
DEPLOY_ENV=${1:-production}
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="./backups"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Deploying to $DEPLOY_ENV environment"

# Backup current build
if [ -d "./client/build" ]; then
  echo "Backing up current build..."
  tar -czf "$BACKUP_DIR/build-backup-$TIMESTAMP.tar.gz" ./client/build
fi

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build client
echo "Building client..."
cd client && npm ci && npm run build && cd ..

# Run tests
echo "Running tests..."
npm test

# Deploy based on environment
if [ "$DEPLOY_ENV" = "production" ]; then
  echo "Deploying to production server..."
  # Add your production deployment commands here
  # Example: scp -r ./client/build user@production-server:/path/to/deployment
elif [ "$DEPLOY_ENV" = "staging" ]; then
  echo "Deploying to staging server..."
  # Add your staging deployment commands here
  # Example: scp -r ./client/build user@staging-server:/path/to/deployment
else
  echo "Unknown deployment environment: $DEPLOY_ENV"
  exit 1
fi

echo "Deployment completed successfully!"
