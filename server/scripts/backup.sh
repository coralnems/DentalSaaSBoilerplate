#!/bin/bash

# Load environment variables
source .env

# Set backup directory
BACKUP_DIR="/backup"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_PATH="$BACKUP_DIR/$DATE"

# Create backup directory
mkdir -p $BACKUP_PATH

# MongoDB backup
echo "Starting MongoDB backup..."
mongodump --uri="$MONGO_URI" --out="$BACKUP_PATH/mongodb"

# Files backup (PDF invoices, uploads, etc.)
echo "Starting files backup..."
tar -czf "$BACKUP_PATH/files.tar.gz" ./storage/pdfs ./storage/uploads

# Upload to S3
echo "Uploading to S3..."
aws s3 sync $BACKUP_PATH "s3://$AWS_BUCKET/backups/$DATE"

# Cleanup old backups (keep last 30 days)
echo "Cleaning up old backups..."
find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} \;

# Verify backup
echo "Verifying backup..."
if aws s3 ls "s3://$AWS_BUCKET/backups/$DATE" >/dev/null; then
    echo "Backup completed successfully"
    # Send success notification
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"✅ Backup completed successfully for $DATE\"}"
else
    echo "Backup verification failed"
    # Send failure notification
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"❌ Backup failed for $DATE\"}"
    exit 1
fi 