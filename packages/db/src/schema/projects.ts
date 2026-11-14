import { sql } from "drizzle-orm";
import { index, pgPolicy, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { authenticatedRole, authUid } from "drizzle-orm/supabase";
import { createdAt, id, updatedAt } from "./columns.js";
import { users } from "./users.js";

export const projects = pgTable(
  "projects",
  {
    id: id(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Dépôt GitHub du produit, au format « propriétaire/nom ». */
    repositoryFullName: text("repository_full_name"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("projects_owner_id_idx").on(table.ownerId),
    pgPolicy("projects_owner_all", {
      for: "all",
      to: authenticatedRole,
      using: sql`${table.ownerId} = ${authUid}`,
      withCheck: sql`${table.ownerId} = ${authUid}`,
    }),
  ],
);
