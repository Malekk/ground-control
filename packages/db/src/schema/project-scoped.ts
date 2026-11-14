import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { pgPolicy } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { ownsProject } from "./rls.js";

/** Politique RLS standard d'une table rattachée à un projet : tout accès réservé au propriétaire. */
export function projectOwnerPolicy(tableName: string, projectId: AnyPgColumn) {
  return pgPolicy(`${tableName}_project_owner_all`, {
    for: "all",
    to: authenticatedRole,
    using: ownsProject(projectId),
    withCheck: ownsProject(projectId),
  });
}
