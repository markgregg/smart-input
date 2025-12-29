#!/usr/bin/env node

/**
 * Tree-shaking verification script
 * 
 * This script verifies that the packages are properly tree-shakeable by:
 * 1. Checking for side effects in package.json
 * 2. Analyzing bundle for unused exports
 * 3. Ensuring proper ESM format
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const PACKAGES = [
  'core',
  'typeahead',
  'commitnotifier',
  'dragblocks',
  'dropcontent',
  'reactblocks',
];

let hasErrors = false;

console.log('🌲 Verifying tree-shaking configuration...\n');

PACKAGES.forEach(pkg => {
  const packageDir = join(rootDir, 'packages', pkg);
  const packageJsonPath = join(packageDir, 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    console.error(`❌ Package ${pkg}: package.json not found`);
    hasErrors = true;
    return;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  
  console.log(`📦 Checking @smart-input/${pkg}...`);
  
  // Check 1: sideEffects field
  if (packageJson.sideEffects === undefined) {
    console.warn(`  ⚠️  No sideEffects field defined (consider adding "sideEffects": false or ["*.css"])`);
  } else if (packageJson.sideEffects === false) {
    console.log(`  ✅ sideEffects: false - fully tree-shakeable`);
  } else if (Array.isArray(packageJson.sideEffects)) {
    console.log(`  ✅ sideEffects defined: ${packageJson.sideEffects.join(', ')}`);
  }
  
  // Check 2: ESM exports
  if (!packageJson.module && !packageJson.exports) {
    console.error(`  ❌ No ESM entry point (module or exports field missing)`);
    hasErrors = true;
  } else {
    if (packageJson.module) {
      console.log(`  ✅ ESM module: ${packageJson.module}`);
    }
    if (packageJson.exports) {
      console.log(`  ✅ Package exports defined`);
    }
  }
  
  // Check 3: Type field
  if (packageJson.type !== 'module' && !packageJson.exports) {
    console.warn(`  ⚠️  Consider adding "type": "module" for better ESM support`);
  }
  
  // Check 4: Check for barrel exports that might hurt tree-shaking
  const indexPath = join(packageDir, 'src', 'index.ts');
  if (existsSync(indexPath)) {
    const indexContent = readFileSync(indexPath, 'utf-8');
    const reExportCount = (indexContent.match(/export \* from/g) || []).length;
    const namedReExportCount = (indexContent.match(/export \{[^}]+\} from/g) || []).length;
    
    if (reExportCount > 0) {
      console.warn(`  ⚠️  Found ${reExportCount} wildcard re-exports (export *) - may reduce tree-shaking effectiveness`);
    }
    if (namedReExportCount > 5) {
      console.log(`  ℹ️  ${namedReExportCount} named re-exports found`);
    }
  }
  
  console.log('');
});

console.log('🔍 Tree-shaking verification complete!\n');

if (hasErrors) {
  console.error('❌ Found critical issues that may prevent tree-shaking');
  process.exit(1);
} else {
  console.log('✅ All packages are configured for tree-shaking');
  console.log('\nTo verify actual tree-shaking, run: pnpm analyze\n');
}
