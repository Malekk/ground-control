import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// Charge le .env de la racine du dépôt s'il existe (jamais committé).
const rootEnv = new URL("../../.env", import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  schemaFilter: ["public"],
  // Les rôles Supabase (anon, authenticated…) existent déjà : Drizzle ne doit pas les créer.
  entities: { roles: { provider: "supabase" } },
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
});
