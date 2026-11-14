import { index, jsonb, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./columns.js";
import { projectOwnerPolicy } from "./project-scoped.js";
import { projects } from "./projects.js";

export const specStatus = pgEnum("spec_status", ["draft", "approved", "archived"]);

export const specs = pgTable(
  "specs",
  {
    id: id(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: specStatus("status").notNull().default("draft"),
    /** Spec structurée, validée par un schéma Zod côté domaine. */
    content: jsonb("content").notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("specs_project_id_idx").on(table.projectId),
    projectOwnerPolicy("specs", table.projectId),
  ],
);
