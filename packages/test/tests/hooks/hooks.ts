import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setWorldConstructor,
} from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { ChildProcess, spawn, exec } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let devServer: ChildProcess | null = null;

class CustomWorld {
  browser: any;
  context: any;
  page: any;

  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }
}

setWorldConstructor(CustomWorld);

BeforeAll({ timeout: 60000 }, async function () {
  // Kill any process using port 3001 (cross-platform)
  try {
    console.log('Checking for processes on port 3001...');
    const isWindows = process.platform === 'win32';

    if (isWindows) {
      const { stdout } = await execAsync(
        'netstat -ano | findstr :3001 | findstr LISTENING',
      );
      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        const match = line.match(/\s+(\d+)$/);
        if (match) {
          const pid = match[1];
          console.log(`Killing process ${pid} on port 3001...`);
          try {
            await execAsync(`taskkill /F /PID ${pid}`);
          } catch {
            // Ignore errors if process is already gone
          }
        }
      }
    } else {
      // Unix-like systems (Linux, macOS)
      try {
        const { stdout } = await execAsync('lsof -ti:3001');
        const pids = stdout.trim().split('\n').filter(Boolean);
        for (const pid of pids) {
          console.log(`Killing process ${pid} on port 3001...`);
          try {
            await execAsync(`kill -9 ${pid}`);
          } catch {
            // Ignore errors if process is already gone
          }
        }
      } catch {
        // lsof command might not exist or no processes found
      }
    }
  } catch {
    // Port is free, which is what we want
    console.log('Port 3001 is free');
  }

  // Start the dev server
  console.log('Starting dev server...');
  const testDir = path.resolve(__dirname, '..');

  devServer = spawn('pnpm', ['dev'], {
    shell: true,
    stdio: 'pipe',
    cwd: testDir,
  });

  // Log server output for debugging
  if (devServer.stdout) {
    devServer.stdout.on('data', (data) => {
      console.log(`[dev-server]: ${data}`);
    });
  }

  if (devServer.stderr) {
    devServer.stderr.on('data', (data) => {
      console.error(`[dev-server error]: ${data}`);
    });
  }

  devServer.on('error', (error) => {
    console.error('Failed to start dev server:', error);
  });

  // Wait for the server to be ready
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Dev server failed to start within 60 seconds'));
    }, 60000);

    const checkServer = async () => {
      try {
        const response = await fetch('http://localhost:3001');
        if (response.ok || response.status === 404) {
          clearTimeout(timeout);
          console.log('Dev server is ready');
          resolve();
        } else {
          setTimeout(checkServer, 500);
        }
      } catch (error) {
        setTimeout(checkServer, 500);
      }
    };

    checkServer();
  });
});

AfterAll(async function () {
  // Stop the dev server by killing processes on port 3001
  try {
    console.log('Stopping dev server...');
    const isWindows = process.platform === 'win32';

    if (isWindows) {
      const { stdout } = await execAsync(
        'netstat -ano | findstr :3001 | findstr LISTENING',
      );
      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        const match = line.match(/\s+(\d+)$/);
        if (match) {
          const pid = match[1];
          console.log(`Killing process ${pid} on port 3001...`);
          try {
            await execAsync(`taskkill /F /PID ${pid}`);
          } catch {
            // Ignore errors if process is already gone
          }
        }
      }
    } else {
      // Unix-like systems (Linux, macOS)
      try {
        const { stdout } = await execAsync('lsof -ti:3001');
        const pids = stdout.trim().split('\n').filter(Boolean);
        for (const pid of pids) {
          console.log(`Killing process ${pid} on port 3001...`);
          try {
            await execAsync(`kill -9 ${pid}`);
          } catch {
            // Ignore errors if process is already gone
          }
        }
      } catch {
        // lsof command might not exist or no processes found
      }
    }
  } catch {
    // Ignore errors
  }

  // Also try to kill the direct child process if it still exists
  if (devServer) {
    devServer.kill('SIGKILL');
    devServer = null;
  }
});

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld, { result, pickle }) {
  // Take screenshot on failure
  if (result?.status === 'FAILED' && this.page) {
    const screenshotDir = path.resolve(__dirname, '../screenshots');
    try {
      const fs = await import('fs');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const fileName = `${pickle.name.replace(
        /[^a-z0-9]/gi,
        '_',
      )}_${timestamp}.png`;
      const screenshotPath = path.join(screenshotDir, fileName);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  }

  if (this.page) await this.page.close();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();
});

export { CustomWorld };
