import { defineConfig } from "vitest/config";

// Tests unitaires : aucune base de données requise.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
