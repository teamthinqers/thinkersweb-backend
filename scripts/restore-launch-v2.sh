#!/bin/bash

# Restore Launch Version 2
echo "Restoring Launch Version 2 - Persistent login and WhatsApp activation..."

# Check if backup exists
if [ ! -d ".backup/launch_v2" ]; then
  echo "Error: Launch Version 2 backup not found!"
  exit 1
fi

# Restore files
cp .backup/launch_v2/useWhatsAppStatus.ts client/src/hooks/
cp .backup/launch_v2/authService.ts client/src/lib/
cp .backup/launch_v2/firebase.ts client/src/lib/
cp .backup/launch_v2/whatsapp.ts server/
cp .backup/launch_v2/routes.ts server/
cp .backup/launch_v2/auth.ts server/
cp .backup/launch_v2/Header.tsx client/src/components/layout/
cp .backup/launch_v2/NeuralWhatsAppLinking.tsx client/src/components/neural/
cp .backup/launch_v2/ActivateNeuralExtension.tsx client/src/pages/

echo "Launch Version 2 restored successfully!"
echo "Version info:"
cat .backup/launch_v2/VERSION_INFO.txt
