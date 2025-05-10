/**
 * Script to restore backup versions for easy rollback
 * Usage: node scripts/restore-version.js <version_name>
 * Example: node scripts/restore-version.js launch_v1
 */

const fs = require('fs');
const path = require('path');

// Get version name from command line args
const versionName = process.argv[2];

if (!versionName) {
  console.error('Error: Please provide a version name to restore.');
  console.error('Usage: node scripts/restore-version.js <version_name>');
  process.exit(1);
}

// Check if backup exists
const backupDir = path.join(__dirname, '../backups', versionName);
if (!fs.existsSync(backupDir)) {
  console.error(`Error: Backup version "${versionName}" does not exist.`);
  
  // List available backups
  const backupsParentDir = path.join(__dirname, '../backups');
  if (fs.existsSync(backupsParentDir)) {
    const availableBackups = fs.readdirSync(backupsParentDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (availableBackups.length > 0) {
      console.error('\nAvailable backup versions:');
      availableBackups.forEach(backup => console.error(`- ${backup}`));
    } else {
      console.error('No backup versions available.');
    }
  }
  
  process.exit(1);
}

// Read version info
let versionInfo;
try {
  const versionInfoPath = path.join(backupDir, 'version-info.json');
  versionInfo = JSON.parse(fs.readFileSync(versionInfoPath, 'utf8'));
} catch (error) {
  console.error('Error reading version info:', error);
  process.exit(1);
}

console.log(`Restoring backup version: ${versionName}`);
console.log(`Version date: ${versionInfo.date}`);
console.log(`Description: ${versionInfo.description || 'No description'}`);
console.log('\nRestoring files:');

// Restore each file
versionInfo.files.forEach(filePath => {
  try {
    const fileName = path.basename(filePath);
    const sourceFile = path.join(backupDir, fileName);
    const destinationFile = path.join(__dirname, '..', filePath);
    
    // Create parent directory if needed
    const parentDir = path.dirname(destinationFile);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    
    // Copy the file back to its original location
    fs.copyFileSync(sourceFile, destinationFile);
    console.log(`✓ Restored: ${filePath}`);
  } catch (error) {
    console.error(`✗ Error restoring ${filePath}:`, error);
  }
});

console.log('\nRestore complete! Remember to restart your server for changes to take effect.');