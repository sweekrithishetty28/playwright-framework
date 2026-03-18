// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 180000,
  retries: 1,
    expect: {
    timeout: 15000
  },

  reporter: [
    ['html', { outputFolder: 'reports', open: 'never' }],
    ['list']
  ],
  use: {
    headless: false,          
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'UI',
      testDir: './tests/ui',
      use: { browserName: 'chromium' }
    },
  {
      name: 'API',
      testDir: './tests/api',
      use: {
        // Base URL for all API requests
        baseURL: 'https://petstore.swagger.io/v2',
      }
    }
  ]
});