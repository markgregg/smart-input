#!/usr/bin/env node

/**
 * Combined Coverage Script
 * 
 * This script runs both unit tests and E2E tests, then merges their coverage reports.
 * 
 * Steps:
 * 1. Run Vitest unit tests with coverage
 * 2. Run Playwright E2E tests (coverage collected via vite-plugin-istanbul)
 * 3. Merge coverage reports using nyc
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const COVERAGE_DIR = path.join(ROOT_DIR, 'coverage');
const TEMP_COVERAGE_DIR = path.join(ROOT_DIR, '.nyc_output');

console.log('🧪 Running combined coverage collection...\n');

// Clean previous coverage
console.log('🧹 Cleaning previous coverage...');
if (fs.existsSync(COVERAGE_DIR)) {
  fs.rmSync(COVERAGE_DIR, { recursive: true, force: true });
}
if (fs.existsSync(TEMP_COVERAGE_DIR)) {
  fs.rmSync(TEMP_COVERAGE_DIR, { recursive: true, force: true });
}

try {
  // Step 1: Run unit tests with coverage
  console.log('\n📊 Step 1: Running unit tests with coverage...');
  execSync('pnpm test --run --coverage.enabled --coverage.reporter=json', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });

  // Rename Vitest coverage
  const vitestCoverage = path.join(COVERAGE_DIR, 'coverage-final.json');
  const vitestCoverageBackup = path.join(ROOT_DIR, '.coverage-vitest.json');
  if (fs.existsSync(vitestCoverage)) {
    fs.renameSync(vitestCoverage, vitestCoverageBackup);
  }

  // Step 2: Run E2E tests (coverage auto-collected by istanbul)
  // NOTE: Currently disabled - E2E test runner leaves hanging processes
  // TODO: Fix E2E coverage collection and process cleanup
  console.log('\n⏭️  Step 2: Skipping E2E tests for now');
  console.log('(E2E coverage integration is a future enhancement)\n');

  // try {
  //   execSync('pnpm test:e2e', {
  //     cwd: ROOT_DIR,
  //     stdio: 'inherit',
  //   });
  // } catch (error) {
  //   console.log('\n⚠️  E2E tests failed, but coverage was still collected.');
  // }

  // Step 3: Generate coverage report from unit tests
  // Note: E2E coverage integration with vite-plugin-istanbul requires additional
  // setup to extract coverage from the browser (window.__coverage__). This is a
  // future enhancement. For now, we generate reports from unit test coverage only.
  console.log('\n📈 Step 3: Generating coverage report...');

  // Move Vitest coverage to .nyc_output for NYC to process
  if (!fs.existsSync(TEMP_COVERAGE_DIR)) {
    fs.mkdirSync(TEMP_COVERAGE_DIR, { recursive: true });
  }

  if (fs.existsSync(vitestCoverageBackup)) {
    fs.copyFileSync(
      vitestCoverageBackup,
      path.join(TEMP_COVERAGE_DIR, 'vitest-coverage.json')
    );
  }

  // Generate report using NYC
  execSync('pnpm exec nyc report --reporter=html --reporter=text --reporter=lcov --report-dir=coverage', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });

  console.log('\n✅ Coverage report generated successfully!');
  console.log(`📁 View report at: ${path.join(COVERAGE_DIR, 'index.html')}`);
  console.log('\nℹ️  Note: E2E coverage integration is a future enhancement.');
  console.log('   Currently showing unit test coverage only.\n');

} catch (error) {
  console.error('\n❌ Error during coverage collection:', error.message);
  process.exit(1);
} finally {
  // Cleanup
  if (fs.existsSync(path.join(ROOT_DIR, '.coverage-vitest.json'))) {
    fs.unlinkSync(path.join(ROOT_DIR, '.coverage-vitest.json'));
  }
}
