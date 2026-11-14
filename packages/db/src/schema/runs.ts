import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./columns.js";
import { projectOwnerPolicy } from "./project-scoped.js";
import { projects } from "./projects.js";
import { tickets } from "./tickets.js";

export const runStatus = pgEnum("run_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
]);

/** Exécution d'un agent (dans la CI du dépôt produit). */
export const runs = pgTable(
  "runs",
  {
    id: id(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    ticketId: uuid("ticket_id").references(() => tickets.id, { onDelete: "set null" }),
    agent: text("agent").notNull(),
    status: runStatus("status").notNull().default("queued"),
    /** Identifiant de l'exécution chez le fournisseur (ex. run GitHub Actions). */
    externalId: text("external_id"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("runs_project_id_idx").on(table.projectId),
    index("runs_ticket_id_idx").on(table.ticketId),
    projectOwnerPolicy("runs", table.projectId),
  ],
);
