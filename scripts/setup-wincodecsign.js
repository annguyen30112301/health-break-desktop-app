/**
 * Pre-extracts winCodeSign into the electron-builder cache,
 * excluding the darwin/ directory (contains macOS symlinks that
 * require elevated privileges to create on Windows).
 *
 * Run once before building: node scripts/setup-wincodecsign.js
 * This script is FULLY SYNCHRONOUS to ensure it completes before
 * electron-builder starts.
 */

'use strict';
const { execFileSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const VERSION = '2.6.0';
const DOWNLOAD_URL = `https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-${VERSION}/winCodeSign-${VERSION}.7z`;
const CACHE_ROOT = path.join(os.homedir(), 'AppData', 'Local', 'electron-builder', 'Cache', 'winCodeSign');
const CACHE_DIR  = path.join(CACHE_ROOT, `winCodeSign-${VERSION}`);
const SEVENZIP   = path.join(__dirname, '..', 'node_modules', '7zip-bin', 'win', 'x64', '7za.exe');
const MARKER     = path.join(CACHE_DIR, 'windows-10', 'x64', 'signtool.exe');

// Already extracted — nothing to do
if (fs.existsSync(MARKER)) {
  console.log('winCodeSign already cached, skipping setup.');
  process.exit(0);
}

if (!fs.existsSync(SEVENZIP)) {
  console.error('7za.exe not found. Run: npm install');
  process.exit(1);
}

// Reuse any .7z left over from a previous failed electron-builder attempt
function findExistingArchive() {
  if (!fs.existsSync(CACHE_ROOT)) return null;
  for (const entry of fs.readdirSync(CACHE_ROOT)) {
    if (!entry.endsWith('.7z')) continue;
    const full = path.join(CACHE_ROOT, entry);
    try {
      if (fs.statSync(full).size > 1_000_000) return full;
    } catch {}
  }
  return null;
}

let archive = findExistingArchive();

if (!archive) {
  // Download synchronously via PowerShell (handles GitHub's HTTPS redirects correctly)
  archive = path.join(os.tmpdir(), `winCodeSign-${VERSION}-setup.7z`);
  console.log(`Downloading winCodeSign-${VERSION}...`);
  try {
    execSync(
      `powershell.exe -NoProfile -NonInteractive -Command "` +
        `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; ` +
        `Invoke-WebRequest -Uri '${DOWNLOAD_URL}' -OutFile '${archive}' -UseBasicParsing` +
      `"`,
      { stdio: 'inherit' }
    );
  } catch (e) {
    console.error('Download failed:', e.message);
    process.exit(1);
  }
} else {
  console.log(`Re-using cached archive: ${path.basename(archive)}`);
}

// Extract, skipping darwin/ to avoid Windows symlink permission errors
console.log('Extracting winCodeSign (excluding darwin/)...');
fs.mkdirSync(CACHE_DIR, { recursive: true });
try {
  execFileSync(
    SEVENZIP,
    ['x', archive, `-o${CACHE_DIR}`, '-x!darwin', '-y', '-bd'],
    { stdio: 'inherit' }
  );
} catch (e) {
  console.error('Extraction failed:', e.message);
  process.exit(1);
}

if (!fs.existsSync(MARKER)) {
  console.error('Extraction seemed to succeed but signtool.exe was not found. Setup failed.');
  process.exit(1);
}

console.log('winCodeSign setup complete.');
