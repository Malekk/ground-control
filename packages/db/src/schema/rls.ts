import { type SQL, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { authUid } from "drizzle-orm/supabase";

/** Vrai si l'utilisateur connecté possède le projet référencé par la colonne. */
export function ownsProject(projectId: AnyPgColumn): SQL {
  return sql`exists (select 1 from public.projects p where p.id = ${projectId} and p.owner_id = ${authUid})`;
}
