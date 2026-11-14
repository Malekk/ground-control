CREATE TYPE "public"."connection_provider" AS ENUM('github', 'vercel', 'anthropic', 'openai', 'deepseek');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('queued', 'running', 'succeeded', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."spec_status" AS ENUM('draft', 'approved', 'archived');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('todo', 'in_progress', 'in_review', 'done', 'cancelled');--> statement-breakpoint
CREATE TABLE "connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"provider" "connection_provider" NOT NULL,
	"label" text,
	"vault_secret_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connections_project_provider_key" UNIQUE("project_id","provider")
);
--> statement-breakpoint
ALTER TABLE "connections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"project_id" uuid NOT NULL,
	"run_id" uuid,
	"type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"rules" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "policies_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
ALTER TABLE "policies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"repository_full_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"ticket_id" uuid,
	"agent" text NOT NULL,
	"status" "run_status" DEFAULT 'queued' NOT NULL,
	"external_id" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "runs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "specs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" "spec_status" DEFAULT 'draft' NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "specs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"spec_id" uuid,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"status" "ticket_status" DEFAULT 'todo' NOT NULL,
	"external_id" text,
	"external_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tickets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"github_login" text,
	"display_name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specs" ADD CONSTRAINT "specs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_spec_id_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."specs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "connections_project_id_idx" ON "connections" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "events_project_id_created_at_idx" ON "events" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "projects_owner_id_idx" ON "projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "runs_project_id_idx" ON "runs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "runs_ticket_id_idx" ON "runs" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "specs_project_id_idx" ON "specs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tickets_project_id_idx" ON "tickets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tickets_spec_id_idx" ON "tickets" USING btree ("spec_id");--> statement-breakpoint
CREATE POLICY "connections_project_owner_all" ON "connections" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from public.projects p where p.id = "connections"."project_id" and p.owner_id = (select auth.uid()))) WITH CHECK (exists (select 1 from public.projects p where p.id = "connections"."project_id" and p.owner_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "events_select_project_owner" ON "events" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from public.projects p where p.id = "events"."project_id" and p.owner_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "events_insert_project_owner" ON "events" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from public.projects p where p.id = "events"."project_id" and p.owner_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "policies_project_owner_all" ON "policies" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from public.projects p where p.id = "policies"."project_id" and p.owner_id = (select auth.uid()))) WITH CHECK (exists (select 1 from public.projects p where p.id = "policies"."project_id" and p.owner_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "projects_owner_all" ON "projects" AS PERMISSIVE FOR ALL TO "authenticated" USING ("projects"."owner_id" = (select auth.uid())) WITH CHECK ("projects"."owner_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "runs_project_owner_all" ON "runs" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from public.projects p where p.id = "runs"."project_id" and p.owner_id = (select auth.uid()))) WITH CHECK (exists (select 1 from public.projects p where p.id = "runs"."project_id" and p.owner_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "specs_project_owner_all" ON "specs" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from public.projects p where p.id = "specs"."project_id" and p.owner_id = (select auth.uid()))) WITH CHECK (exists (select 1 from public.projects p where p.id = "specs"."project_id" and p.owner_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "tickets_project_owner_all" ON "tickets" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from public.projects p where p.id = "tickets"."project_id" and p.owner_id = (select auth.uid()))) WITH CHECK (exists (select 1 from public.projects p where p.id = "tickets"."project_id" and p.owner_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "users_select_own" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("users"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "users_update_own" ON "users" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("users"."id" = (select auth.uid())) WITH CHECK ("users"."id" = (select auth.uid()));