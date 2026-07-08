import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // ✅ Change this line to only include your pure utility specs
    include: ['src/app/core/utils/**/*.spec.ts'],
  },
});