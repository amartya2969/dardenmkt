import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    // Plain Node environment is fine — we only test pure functions in this
    // first pass. Switch to 'jsdom' if/when we add component tests.
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Don't pull in our Vercel/Next build output or any other test-runner
    // configs that might lurk in node_modules.
    exclude: ['node_modules', '.next', 'dist'],
    globals: false,
  },
  resolve: {
    alias: {
      // Mirror the `@/*` path alias from tsconfig so test files can use the
      // same imports as source.
      '@': path.resolve(__dirname, './src'),
    },
  },
})
