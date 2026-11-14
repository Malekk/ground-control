import { index, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./columns.js";
import { projectOwnerPolicy } from "./project-scoped.js";
import { projects } from "./projects.js";
import { specs } from "./specs.js";

export const ticketStatus = pgEnum("ticket_status", [
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
]);

export const tickets = pgTable(
  "tickets",
  {
    id: id(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    specId: uuid("spec_id").references(() => specs.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    status: ticketStatus("status").notNull().default("todo"),
    /** Identifiant chez le fournisseur de tickets (ex. numéro d'issue GitHub). */
    externalId: text("external_id"),
    externalUrl: text("external_url"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("tickets_project_id_idx").on(table.projectId),
    index("tickets_spec_id_idx").on(table.specId),
    projectOwnerPolicy("tickets", table.projectId),
  ],
);
