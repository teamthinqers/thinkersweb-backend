#!/bin/bash

# Script to restore DotSpark functional version 2
# Usage: bash scripts/restore-v2.sh

echo "Restoring DotSpark functional version 2..."

# Check if backup exists
if [ ! -d "backups/v2" ]; then
  echo "Error: Backup directory 'backups/v2' not found!"
  exit 1
fi

# Restore server files
echo "Restoring server files..."
cp backups/v2/openai.ts server/
cp backups/v2/whatsapp.ts server/

echo "Restoration complete! DotSpark has been restored to functional version 2."
echo "Please restart the server to apply changes."