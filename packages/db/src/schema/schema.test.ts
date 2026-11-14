import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import * as schema from "./index.js";

const tables = [
  schema.users,
  schema.projects,
  schema.connections,
  schema.policies,
  schema.specs,
  schema.tickets,
  schema.runs,
  schema.events,
];

describe("schema", () => {
  it("defines the V1 tables", () => {
    expect(tables.map((table) => getTableConfig(table).name)).toEqual([
      "users",
      "projects",
      "connections",
      "policies",
      "specs",
      "tickets",
      "runs",
      "events",
    ]);
  });

  it.each(tables.map((table) => [getTableConfig(table).name, table] as const))(
    "enables row level security on %s",
    (_name, table) => {
      expect(getTableConfig(table).enableRLS || getTableConfig(table).policies.length > 0).toBe(
        true,
      );
    },
  );

  it("never grants update or delete on events", () => {
    const commands = getTableConfig(schema.events).policies.map((policy) => policy.for);
    expect(commands).toEqual(["select", "insert"]);
  });

  it("stores only a Vault reference for connection secrets", () => {
    const columns = getTableConfig(schema.connections).columns.map((column) => column.name);
    expect(columns).toContain("vault_secret_id");
    expect(
      columns.some((name) => /secret$|token|key$/.test(name) && name !== "vault_secret_id"),
    ).toBe(false);
  });
});
