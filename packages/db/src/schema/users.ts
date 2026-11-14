import { sql } from "drizzle-orm";
import { pgPolicy, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { authenticatedRole, authUid, authUsers } from "drizzle-orm/supabase";
import { createdAt, updatedAt } from "./columns.js";

/** Profil applicatif d'un utilisateur Supabase Auth (même identifiant que auth.users). */
export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    githubLogin: text("github_login"),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    pgPolicy("users_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy("users_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
      withCheck: sql`${table.id} = ${authUid}`,
    }),
  ],
);
