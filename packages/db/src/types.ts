// Types TypeScript dérivés du schéma Drizzle : une seule source de vérité.
import type {
  connections,
  events,
  policies,
  projects,
  runs,
  specs,
  tickets,
  users,
} from "./schema/index.js";

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
export type ConnectionRow = typeof connections.$inferSelect;
export type NewConnectionRow = typeof connections.$inferInsert;
export type PolicyRow = typeof policies.$inferSelect;
export type NewPolicyRow = typeof policies.$inferInsert;
export type SpecRow = typeof specs.$inferSelect;
export type NewSpecRow = typeof specs.$inferInsert;
export type TicketRow = typeof tickets.$inferSelect;
export type NewTicketRow = typeof tickets.$inferInsert;
export type RunRow = typeof runs.$inferSelect;
export type NewRunRow = typeof runs.$inferInsert;
export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
