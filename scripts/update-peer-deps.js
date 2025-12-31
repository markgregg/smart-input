#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read core package.json to get the version
const corePkgPath = join(__dirname, '..', 'packages', 'core', 'package.json');
const corePkg = JSON.parse(readFileSync(corePkgPath, 'utf8'));
const version = corePkg.version;

// Function to update package.json
function updatePackageJson(pkgPath) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  let updated = false;

  // Update peerDependencies
  if (pkg.peerDependencies && pkg.peerDependencies['@smart-input/core'] === 'workspace:*') {
    pkg.peerDependencies['@smart-input/core'] = `^${version}`;
    updated = true;
  }

  // Optionally update devDependencies (uncomment if needed)
  // if (pkg.devDependencies && pkg.devDependencies['@smart-input/core'] === 'workspace:*') {
  //   pkg.devDependencies['@smart-input/core'] = version;
  //   updated = true;
  // }

  if (updated) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`Updated ${pkgPath}`);
  }
}

// List of packages to update (excluding core and test)
const packages = ['commitnotifier', 'dragblocks', 'dropcontent', 'reactblocks', 'typeahead'];

packages.forEach(pkg => {
  const pkgPath = join(__dirname, '..', 'packages', pkg, 'package.json');
  updatePackageJson(pkgPath);
});

console.log(`Updated peer dependencies to ^${version}`);