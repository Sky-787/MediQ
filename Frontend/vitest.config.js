import { mergeConfig } from 'vite';
import { defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.js',
      exclude: [...configDefaults.exclude, 'e2e/**/*'],
    },
  })
);
