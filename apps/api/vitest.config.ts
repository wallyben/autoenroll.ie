import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      HASH_SALT: 'test-salt-for-testing-only'
    }
  }
});
