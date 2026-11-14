import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

export type Database = ReturnType<typeof createDatabase>;

/**
 * Crée un client Drizzle. À n'utiliser que côté serveur.
 * `prepare: false` est requis derrière le pooler Supabase en mode transaction.
 */
export function createDatabase(url: string) {
  const client = postgres(url, { prepare: false });
  return drizzle(client, { schema });
}
