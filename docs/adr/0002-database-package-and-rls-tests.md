# ADR 0002 : package `db` et tests RLS sur Postgres nu

- Statut : accepté
- Date : 2026-11-15
- Ticket : #3

## Contexte

Le ticket #3 introduit le schéma Postgres (Drizzle), ses migrations et des règles RLS qui doivent être testées en CI.
La structure prévue ne contenait pas d'emplacement pour la base, et la RLS Supabase repose sur des éléments
propres à Supabase (`auth.uid()`, rôles `anon` / `authenticated` / `service_role`, table `auth.users`).

## Décision

- Nouveau package **`packages/db`** : schéma Drizzle, migrations versionnées (`packages/db/migrations`), types dérivés
  du schéma (`$inferSelect` / `$inferInsert`) et client Postgres. Il est importé par les adaptateurs et `apps/web`,
  jamais par `packages/core`.
- Les règles RLS sont déclarées dans le schéma Drizzle (`pgPolicy`) et générées dans les migrations.
  Ce qui ne s'exprime pas en Drizzle (trigger d'ajout seul sur `events`) passe par une migration SQL personnalisée.
- Les tests de base tournent sur un **Postgres 17 nu** (service de la CI). Un script `test/supabase-shim.sql`
  reproduit le minimum de Supabase : les trois rôles, `auth.users`, `auth.uid()` (même implémentation) et les droits
  par défaut. La base de test est effacée à chaque exécution ; seules les URL `localhost` sont acceptées.
- La CI vérifie aussi que les migrations sont à jour avec le schéma (`drizzle-kit generate` ne doit rien produire).

## Conséquences

- Tests rapides et sans dépendance supplémentaire ; pas besoin de la pile Supabase complète en CI.
- Le shim peut diverger de Supabase. Il se limite à ce que les migrations utilisent ; toute nouvelle dépendance
  à une fonction Supabase doit y être ajoutée.
- `events` n'a pas de `ON DELETE CASCADE` : un projet (ou un utilisateur) qui a des événements ne peut pas être
  supprimé. Il faudra un archivage plutôt qu'une suppression.
