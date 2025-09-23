import { defineConfig } from '@playwright/test';

const runTime = 2 * 60 * 1000
const baseUrl = 'http://localhost:8768'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    locale: 'en-GB',
    timezoneId: 'Europe/London',
    screenshot: 'only-on-failure',
    trace: 'on',
    browserName: 'chromium',
    viewport: { width: 1920, height: 1080 },
    baseURL: baseUrl,
  },
  timeout: runTime,
  reportSlowTests: null,
  projects: [
    {
      name: 'Tests',
      testMatch: '**/*.spec.ts',
    }
  ],
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['dot'], ['html']],
  webServer: {
    command: 'npm run preview',
    url: baseUrl,
    reuseExistingServer: false,
  },
  retries: 0,
  forbidOnly: !!process.env.CI,
});