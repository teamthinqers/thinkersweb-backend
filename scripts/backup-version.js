/**
 * Script to create backup versions of key files for easy rollback
 * Usage: node scripts/backup-version.js <version_name>
 * Example: node scripts/backup-version.js launch_v1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get version name from command line args
const versionName = process.argv[2] || 'default';

// Key files to backup
const filesToBackup = [
  'server/whatsapp.ts',
  'server/openai.ts',
  'client/src/components/landing/WhatsAppPromo.tsx',
  'client/src/components/landing/WhatsAppContactButton.tsx',
  'client/src/components/landing/CompactWhatsAppButton.tsx'
];

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '../backups', versionName);
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`Created backup directory: ${backupDir}`);
}

// Backup each file
filesToBackup.forEach(filePath => {
  try {
    const sourceFile = path.join(__dirname, '..', filePath);
    const fileName = path.basename(filePath);
    const destinationFile = path.join(backupDir, fileName);
    
    // Create subdirectories if needed
    const subDir = path.dirname(destinationFile);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    
    // Copy the file
    fs.copyFileSync(sourceFile, destinationFile);
    console.log(`Backed up: ${filePath} -> ${path.relative(path.join(__dirname, '..'), destinationFile)}`);
  } catch (error) {
    console.error(`Error backing up ${filePath}:`, error);
  }
});

// Create version info file
const versionInfo = {
  name: versionName,
  date: new Date().toISOString(),
  files: filesToBackup,
  description: 'Neural extension with interactive WhatsApp chat capabilities'
};

fs.writeFileSync(
  path.join(backupDir, 'version-info.json'),
  JSON.stringify(versionInfo, null, 2)
);

console.log(`\nSuccessfully created backup version: ${versionName}`);
console.log(`To restore this version, run: node scripts/restore-version.js ${versionName}`);