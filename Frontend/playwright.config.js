import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
      env: {
        ...process.env,
        VITE_API_URL: process.env.VITE_API_URL || 'http://127.0.0.1:5001/api',
      },
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm start',
      url: 'http://localhost:5001',
      cwd: '../Backend',
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        PORT: '5001',
        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediq_test',
        JWT_SECRET: process.env.JWT_SECRET || 'supersecret_test_key_12345',
      },
      stdout: 'ignore',
      stderr: 'pipe',
    }
  ],
});
