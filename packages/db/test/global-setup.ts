import { readFile } from "node:fs/promises";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { connect } from "./database.js";

const migrationsFolder = new URL("../migrations", import.meta.url).pathname;
const shimFile = new URL("./supabase-shim.sql", import.meta.url);

/** Repart d'une base vide, simule Supabase puis applique toutes les migrations. */
export default async function setup(): Promise<void> {
  const sql = connect();
  try {
    await sql.unsafe(`
      DROP SCHEMA IF EXISTS public CASCADE;
      DROP SCHEMA IF EXISTS auth CASCADE;
      DROP SCHEMA IF EXISTS drizzle CASCADE;
      CREATE SCHEMA public;
    `);
    await sql.unsafe(await readFile(shimFile, "utf8"));
    await migrate(drizzle(sql), { migrationsFolder });
  } finally {
    await sql.end();
  }
}
