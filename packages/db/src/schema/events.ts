import { bigint, index, jsonb, pgPolicy, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { createdAt } from "./columns.js";
import { projects } from "./projects.js";
import { ownsProject } from "./rls.js";
import { runs } from "./runs.js";

/**
 * Journal des événements, en ajout seul : aucune mise à jour ni suppression.
 * Le blocage est assuré par un trigger et par les droits (migration events_append_only),
 * en plus de l'absence de politique RLS UPDATE/DELETE.
 * Les clés étrangères n'ont pas de ON DELETE CASCADE : un projet journalisé ne peut pas être supprimé.
 */
export const events = pgTable(
  "events",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    runId: uuid("run_id").references(() => runs.id),
    type: text("type").notNull(),
    payload: jsonb("payload").notNull().default({}),
    createdAt: createdAt(),
  },
  (table) => [
    index("events_project_id_created_at_idx").on(table.projectId, table.createdAt),
    pgPolicy("events_select_project_owner", {
      for: "select",
      to: authenticatedRole,
      using: ownsProject(table.projectId),
    }),
    pgPolicy("events_insert_project_owner", {
      for: "insert",
      to: authenticatedRole,
      withCheck: ownsProject(table.projectId),
    }),
  ],
);
