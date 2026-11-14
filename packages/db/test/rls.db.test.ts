import { randomUUID } from "node:crypto";
import type postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { connect } from "./database.js";

const sql = connect();
afterAll(() => sql.end());

type Role = "anon" | "authenticated";
type Tx = postgres.TransactionSql;

class Rollback extends Error {}

/**
 * Exécute `fn` comme le ferait l'API Supabase pour ce rôle et cet utilisateur,
 * dans une transaction toujours annulée.
 */
async function as<T>(role: Role, userId: string | null, fn: (tx: Tx) => Promise<T>): Promise<T> {
  let result: T | undefined;
  try {
    await sql.begin(async (tx) => {
      await tx.unsafe(`set local role ${role}`);
      await tx`select set_config('request.jwt.claims', ${JSON.stringify({ sub: userId, role })}, true)`;
      result = await fn(tx);
      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
  return result as T;
}

const asUser = <T>(userId: string, fn: (tx: Tx) => Promise<T>) => as("authenticated", userId, fn);
const asAnon = <T>(fn: (tx: Tx) => Promise<T>) => as("anon", null, fn);

type Fixture = {
  userId: string;
  projectId: string;
  specId: string;
  ticketId: string;
  runId: string;
};

/** Crée, en superutilisateur, un utilisateur avec un projet et une ligne dans chaque table. */
async function seedUser(name: string): Promise<Fixture> {
  const userId = randomUUID();
  const projectId = randomUUID();
  const specId = randomUUID();
  const ticketId = randomUUID();
  const runId = randomUUID();
  await sql.begin(async (tx) => {
    await tx`insert into auth.users (id, email) values (${userId}, ${`${name}@example.com`})`;
    await tx`insert into public.users (id, github_login) values (${userId}, ${name})`;
    await tx`insert into public.projects (id, owner_id, name) values (${projectId}, ${userId}, ${`${name} project`})`;
    await tx`insert into public.connections (project_id, provider, vault_secret_id) values (${projectId}, 'github', ${randomUUID()})`;
    await tx`insert into public.policies (project_id) values (${projectId})`;
    await tx`insert into public.specs (id, project_id, title) values (${specId}, ${projectId}, 'Spec')`;
    await tx`insert into public.tickets (id, project_id, spec_id, title) values (${ticketId}, ${projectId}, ${specId}, 'Ticket')`;
    await tx`insert into public.runs (id, project_id, ticket_id, agent) values (${runId}, ${projectId}, ${ticketId}, 'developer')`;
    await tx`insert into public.events (project_id, run_id, type) values (${projectId}, ${runId}, 'run.queued')`;
  });
  return { userId, projectId, specId, ticketId, runId };
}

const projectScopedTables = ["connections", "policies", "specs", "tickets", "runs", "events"];
const allTables = ["users", "projects", ...projectScopedTables];

let alice: Fixture;
let bob: Fixture;

beforeAll(async () => {
  alice = await seedUser("alice");
  bob = await seedUser("bob");
});

describe("row level security", () => {
  it("lets a user see only their own profile", async () => {
    const rows = await asUser(alice.userId, (tx) => tx`select id from public.users`);
    expect(rows.map((row) => row.id)).toEqual([alice.userId]);
  });

  it("lets a user see only their own projects", async () => {
    const rows = await asUser(alice.userId, (tx) => tx`select id from public.projects`);
    expect(rows.map((row) => row.id)).toEqual([alice.projectId]);
  });

  it.each(projectScopedTables)("limits %s to the user's projects", async (table) => {
    const rows = await asUser(
      alice.userId,
      (tx) => tx`select project_id from ${tx("public")}.${tx(table)}`,
    );
    expect(rows.map((row) => row.project_id)).toEqual([alice.projectId]);
  });

  it.each(allTables)("hides every row of %s from anonymous visitors", async (table) => {
    const rows = await asAnon((tx) => tx`select 1 from ${tx("public")}.${tx(table)}`);
    expect(rows).toHaveLength(0);
  });

  it("refuses to create a project on behalf of another user", async () => {
    await expect(
      asUser(
        alice.userId,
        (tx) => tx`insert into public.projects (owner_id, name) values (${bob.userId}, 'stolen')`,
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("refuses to write into another user's project", async () => {
    await expect(
      asUser(
        alice.userId,
        (tx) =>
          tx`insert into public.specs (project_id, title) values (${bob.projectId}, 'intrusion')`,
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("refuses to move a row into another user's project", async () => {
    await expect(
      asUser(
        alice.userId,
        (tx) =>
          tx`update public.specs set project_id = ${bob.projectId} where id = ${alice.specId}`,
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("silently ignores updates and deletes on another user's rows", async () => {
    const result = await asUser(alice.userId, async (tx) => {
      const updated =
        await tx`update public.projects set name = 'hacked' where id = ${bob.projectId}`;
      const deleted = await tx`delete from public.tickets where id = ${bob.ticketId}`;
      return { updated: updated.count, deleted: deleted.count };
    });
    expect(result).toEqual({ updated: 0, deleted: 0 });
  });

  it("lets a user manage rows of their own project", async () => {
    const count = await asUser(alice.userId, async (tx) => {
      await tx`insert into public.specs (project_id, title) values (${alice.projectId}, 'New spec')`;
      const updated =
        await tx`update public.tickets set status = 'done' where id = ${alice.ticketId}`;
      return updated.count;
    });
    expect(count).toBe(1);
  });
});

describe("events journal", () => {
  it("lets a user append an event to their own project", async () => {
    const rows = await asUser(
      alice.userId,
      (tx) =>
        tx`insert into public.events (project_id, type) values (${alice.projectId}, 'spec.created') returning id`,
    );
    expect(rows).toHaveLength(1);
  });

  it("refuses to append an event to another user's project", async () => {
    await expect(
      asUser(
        alice.userId,
        (tx) =>
          tx`insert into public.events (project_id, type) values (${bob.projectId}, 'forged')`,
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });

  it.each([
    ["update", "update public.events set type = 'edited'"],
    ["delete", "delete from public.events"],
  ])("refuses %s to authenticated users", async (_operation, statement) => {
    await expect(asUser(alice.userId, (tx) => tx.unsafe(statement))).rejects.toMatchObject({
      code: "42501",
    });
  });

  it.each([
    ["update", "update public.events set type = 'edited'"],
    ["delete", "delete from public.events"],
    ["truncate", "truncate public.events"],
  ])("refuses %s even to the table owner", async (_operation, statement) => {
    await expect(
      sql.begin(async (tx) => {
        await tx.unsafe(statement);
      }),
    ).rejects.toThrow(/append-only/);
  });
});
