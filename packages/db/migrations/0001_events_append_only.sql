-- La table events est un journal en ajout seul : aucune mise à jour, suppression ni troncature,
-- quel que soit le rôle (y compris service_role et le propriétaire de la table).
CREATE FUNCTION "public"."prevent_events_mutation"() RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'events is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;--> statement-breakpoint
CREATE TRIGGER "events_prevent_update_delete"
  BEFORE UPDATE OR DELETE ON "public"."events"
  FOR EACH ROW EXECUTE FUNCTION "public"."prevent_events_mutation"();--> statement-breakpoint
CREATE TRIGGER "events_prevent_truncate"
  BEFORE TRUNCATE ON "public"."events"
  FOR EACH STATEMENT EXECUTE FUNCTION "public"."prevent_events_mutation"();--> statement-breakpoint
-- Défense en profondeur : les rôles exposés par l'API Supabase n'ont même pas le droit.
REVOKE UPDATE, DELETE, TRUNCATE ON "public"."events" FROM "anon", "authenticated", "service_role";--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION "public"."prevent_events_mutation"() FROM PUBLIC, "anon", "authenticated";
