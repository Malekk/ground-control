import { jsonb, pgTable, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./columns.js";
import { projectOwnerPolicy } from "./project-scoped.js";
import { projects } from "./projects.js";

/** Règles fixées par l'humain pour un projet (merge automatique, plafonds…). Une ligne par projet. */
export const policies = pgTable(
  "policies",
  {
    id: id(),
    projectId: uuid("project_id")
      .notNull()
      .unique()
      .references(() => projects.id, { onDelete: "cascade" }),
    /** Contenu validé par un schéma Zod côté domaine. */
    rules: jsonb("rules").notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [projectOwnerPolicy("policies", table.projectId)],
);
