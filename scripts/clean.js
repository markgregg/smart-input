#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    console.log(`Removing ${dir}...`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Clean root node_modules and dist
removeDir(path.join(__dirname, '..', 'node_modules'));
removeDir(path.join(__dirname, '..', 'dist'));

// Clean packages - only remove dist folders, not node_modules
// (pnpm workspaces use a shared node_modules at root)
const packagesDir = path.join(__dirname, '..', 'packages');
if (fs.existsSync(packagesDir)) {
  const packages = fs.readdirSync(packagesDir);
  packages.forEach(pkg => {
    const pkgPath = path.join(packagesDir, pkg);
    if (fs.statSync(pkgPath).isDirectory()) {
      removeDir(path.join(pkgPath, 'dist'));
    }
  });
}

console.log('Clean complete!');
