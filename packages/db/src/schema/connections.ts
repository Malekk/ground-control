import { index, pgEnum, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./columns.js";
import { projectOwnerPolicy } from "./project-scoped.js";
import { projects } from "./projects.js";

export const connectionProvider = pgEnum("connection_provider", [
  "github",
  "vercel",
  "anthropic",
  "openai",
  "deepseek",
]);

/**
 * Connexion d'un projet à un fournisseur externe.
 * Le secret vit dans Supabase Vault : cette table n'en stocke que la référence.
 */
export const connections = pgTable(
  "connections",
  {
    id: id(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    provider: connectionProvider("provider").notNull(),
    label: text("label"),
    /** Identifiant du secret dans vault.secrets. */
    vaultSecretId: uuid("vault_secret_id").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    unique("connections_project_provider_key").on(table.projectId, table.provider),
    index("connections_project_id_idx").on(table.projectId),
    projectOwnerPolicy("connections", table.projectId),
  ],
);
