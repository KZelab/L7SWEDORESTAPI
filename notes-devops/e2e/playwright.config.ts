import { defineConfig, devices } from '@playwright/test';

// Set BASE_URL to test an app that is already running somewhere else.
// Without it, Playwright starts the built app itself on port 3000.
const externalUrl = process.env.BASE_URL;

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: externalUrl ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externalUrl
    ? undefined
    : {
        command: 'npm start',
        cwd: '../server',
        url: 'http://localhost:3000/api/health',
        reuseExistingServer: !process.env.CI,
        env: { PUBLIC_DIR: '../client/dist' },
      },
});
