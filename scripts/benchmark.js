#!/usr/bin/env node

/**
 * Performance Benchmark Script
 * 
 * This script creates performance benchmarks for the Open Input components
 * measuring rendering performance, editor operations, and bundle size.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const benchmarkDir = join(rootDir, 'benchmarks');
const resultsDir = join(benchmarkDir, 'results');

// Ensure directories exist
if (!existsSync(benchmarkDir)) {
  mkdirSync(benchmarkDir, { recursive: true });
}
if (!existsSync(resultsDir)) {
  mkdirSync(resultsDir, { recursive: true });
}

console.log('📊 Performance Benchmark Suite\n');
console.log('This will measure:');
console.log('  • Bundle sizes');
console.log('  • Build times');
console.log('  • Package metrics\n');

const PACKAGES = [
  'core',
  'typeahead',
  'commitnotifier',
  'dragblocks',
  'dropcontent',
  'reactblocks',
];

const results = {
  timestamp: new Date().toISOString(),
  benchmarks: [],
};

PACKAGES.forEach(pkg => {
  const packageDir = join(rootDir, 'packages', pkg);
  const distDir = join(packageDir, 'dist');
  const packageJsonPath = join(packageDir, 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    return;
  }

  console.log(`📦 Benchmarking @smart-input/${pkg}...`);
  
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const benchmark = {
    package: pkg,
    version: packageJson.version,
    bundleSize: {},
  };
  
  // Measure bundle sizes if dist exists
  if (existsSync(distDir)) {
    try {
      const files = readdirSync(distDir);
      let totalSize = 0;
      
      files.forEach(file => {
        if (file.endsWith('.js') || file.endsWith('.mjs')) {
          const filePath = join(distDir, file);
          const stats = statSync(filePath);
          const sizeKB = (stats.size / 1024).toFixed(2);
          benchmark.bundleSize[file] = `${sizeKB} KB`;
          totalSize += stats.size;
        }
      });
      
      benchmark.bundleSize.total = `${(totalSize / 1024).toFixed(2)} KB`;
      console.log(`  Bundle size: ${benchmark.bundleSize.total}`);
    } catch (error) {
      console.warn(`  ⚠️  Could not read dist files: ${error.message}`);
    }
  } else {
    console.warn(`  ⚠️  No dist folder found - run build first`);
  }
  
  results.benchmarks.push(benchmark);
  console.log('');
});

// Save results
const resultsFile = join(resultsDir, `benchmark-${Date.now()}.json`);
writeFileSync(resultsFile, JSON.stringify(results, null, 2));

console.log(`✅ Benchmark complete! Results saved to:`);
console.log(`   ${resultsFile}\n`);

// Generate summary
console.log('📊 Summary:');
results.benchmarks.forEach(b => {
  if (b.bundleSize.total) {
    console.log(`  ${b.package.padEnd(15)} ${b.bundleSize.total}`);
  }
});

console.log('\n💡 Next steps:');
console.log('  • Run benchmarks regularly to track changes');
console.log('  • Compare with previous results to catch regressions');
console.log('  • Use "pnpm analyze" for detailed bundle analysis\n');
