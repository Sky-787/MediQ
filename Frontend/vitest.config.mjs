import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    exclude: [...configDefaults.exclude, 'e2e/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.js', 'src/**/*.jsx'],
      exclude: [
        'src/main.jsx',
        'src/assets/**',
        'src/**/*.test.{js,jsx}',
        'src/**/__tests__/**',
      ],
    },
  },
});
