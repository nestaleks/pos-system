// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    // Tablet landscape (primary target)
    {
      name: 'Tablet Landscape',
      use: { 
        ...devices['Desktop Chrome'],
        hasTouch: true,
        viewport: { width: 1024, height: 768 },
        deviceScaleFactor: 2,
        isMobile: false
      },
    },

    // Tablet portrait
    {
      name: 'Tablet Portrait',
      use: { 
        ...devices['Desktop Chrome'],
        hasTouch: true,
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
        isMobile: false
      },
    },

    // Large tablet (iPad Pro)
    {
      name: 'Large Tablet',
      use: { 
        ...devices['Desktop Safari'],
        hasTouch: true,
        viewport: { width: 1366, height: 1024 },
        deviceScaleFactor: 2,
        isMobile: false
      },
    },

    // Desktop touch display
    {
      name: 'Desktop Touch',
      use: { 
        ...devices['Desktop Chrome'],
        hasTouch: true,
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        isMobile: false
      },
    },

    // Mobile fallback testing
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        hasTouch: true
      },
    },

    // WebKit for Safari testing
    {
      name: 'Safari Touch',
      use: { 
        ...devices['Desktop Safari'],
        hasTouch: true,
        viewport: { width: 1024, height: 768 },
        deviceScaleFactor: 2
      },
    },
  ],

  webServer: {
    command: 'npx serve -s . -p 8080',
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
});