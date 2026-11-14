import { defineConfig } from "vitest/config";

// Tests d'intégration : migrations et règles RLS sur un vrai Postgres (TEST_DATABASE_URL).
export default defineConfig({
  test: {
    include: ["test/**/*.db.test.ts"],
    globalSetup: ["test/global-setup.ts"],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
