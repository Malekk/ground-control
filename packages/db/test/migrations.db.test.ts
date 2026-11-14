import { readFile } from "node:fs/promises";
import { afterAll, describe, expect, it } from "vitest";
import { connect } from "./database.js";

const sql = connect();
afterAll(() => sql.end());

type Journal = { entries: { tag: string }[] };

describe("migrations", () => {
  it("applies every migration of the journal on an empty database", async () => {
    const journalFile = new URL("../migrations/meta/_journal.json", import.meta.url);
    const journal = JSON.parse(await readFile(journalFile, "utf8")) as Journal;
    const [row] = await sql<{ count: number }[]>`
      select count(*)::int as count from drizzle.__drizzle_migrations
    `;
    expect(row?.count).toBe(journal.entries.length);
  });

  it("creates the V1 tables with row level security enabled", async () => {
    const rows = await sql<{ name: string; rls: boolean }[]>`
      select relname as name, relrowsecurity as rls
      from pg_class
      where relnamespace = 'public'::regnamespace and relkind = 'r'
      order by relname
    `;
    expect(rows).toEqual(
      ["connections", "events", "policies", "projects", "runs", "specs", "tickets", "users"].map(
        (name) => ({ name, rls: true }),
      ),
    );
  });
});
