import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5173',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      gracefulShutdown: {
        signal: 'SIGTERM',
        timeout: 5000,
      },
      env: {
        ...process.env,
        VITE_API_URL: process.env.VITE_API_URL || 'http://127.0.0.1:5001/api',
      },
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm run start:e2e',
      url: 'http://localhost:5001',
      cwd: '../Backend',
      reuseExistingServer: !process.env.CI,
      gracefulShutdown: {
        signal: 'SIGTERM',
        timeout: 5000,
      },
      env: {
        ...process.env,
        PORT: '5001',
        JWT_SECRET: process.env.JWT_SECRET || 'supersecret_test_key_12345',
      },
      stdout: 'ignore',
      stderr: 'pipe',
    }
  ],
});
