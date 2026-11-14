# @ground-control/db

Schéma Drizzle, migrations versionnées et client Postgres (Supabase). Côté serveur uniquement.

## Tables

`users`, `projects`, `connections`, `policies`, `specs`, `tickets`, `runs`, `events`.

- RLS activée partout : un utilisateur ne voit que ses projets et ce qui s'y rattache ; `anon` ne voit rien.
- `connections` ne stocke qu'une référence au secret dans Supabase Vault (`vault_secret_id`).
- `events` est en ajout seul : un trigger bloque UPDATE, DELETE et TRUNCATE pour tous les rôles.

## Commandes

```bash
pnpm --filter @ground-control/db db:generate   # nouvelle migration après une modification du schéma
pnpm --filter @ground-control/db db:migrate    # applique les migrations sur DATABASE_URL
pnpm test:db                                   # migrations sur base vide + tests RLS (TEST_DATABASE_URL)
```

Une migration déjà mergée ne se modifie jamais : on en ajoute une nouvelle.
Pour du SQL que Drizzle ne sait pas exprimer : `pnpm --filter @ground-control/db db:generate --custom --name <nom>`.

## Tests de base de données en local

`pnpm test:db` efface entièrement la base pointée par `TEST_DATABASE_URL` (localhost uniquement) :

```bash
docker run --rm -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:17
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres pnpm test:db
```

Supabase est simulé par `test/supabase-shim.sql` (voir `docs/adr/0002-database-package-and-rls-tests.md`).
