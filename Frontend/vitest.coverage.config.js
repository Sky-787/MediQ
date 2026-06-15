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
      include: [
        'src/components/shared/ProtectedRoute.jsx',
        'src/pages/public/LandingPage.jsx',
        'src/pages/public/LoginPage.jsx',
        'src/pages/public/RegisterPage.jsx',
        'src/stores/useAuthStore.js',
        'src/utils/validationSchemas.js',
      ],
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/**/__tests__/**',
      ],
    },
  },
});
