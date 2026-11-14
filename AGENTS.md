# Ground Control

Plateforme de pilotage de produit : des agents IA transforment une idée en spec, puis en tickets, en pull requests mergées et en déploiements, dans les limites de règles fixées par l'humain.

- **Ground Control = le cerveau** : chat, planification, règles, journal. Hébergé sur Vercel + Supabase + Upstash.
- **La CI du dépôt produit = les bras** : les agents tournent dans GitHub Actions, jamais dans Ground Control.
- Next.js ne fait que recevoir et décider. Tout traitement long part vers GitHub Actions ou QStash.

Document d'analyse complet : https://claude.ai/artifact/TcxEriRsLQn3i22TvgTRGc

## Stack

- TypeScript strict partout, monorepo **pnpm + Turborepo**, runtime **Node** (version LTS)
- **Next.js** (App Router) + Tailwind + shadcn/ui, déployé sur **Vercel** (Hobby : fonctions limitées à 300 s)
- **Supabase** : Postgres, Auth (connexion GitHub), Vault (secrets), Realtime
- **Drizzle** pour le schéma et les migrations
- **Upstash** : Redis (verrous, limitation de débit) et QStash (tâches planifiées, relances)
- **AI SDK** : fournisseurs Anthropic, OpenAI, DeepSeek ; `@ai-sdk/mcp` pour les outils MCP
- **Zod** pour valider toute donnée qui entre ou sort (API, IA, webhooks)
- **Octokit** pour GitHub
- Tests : **Vitest** (unitaires), **Playwright** (bout en bout), **promptfoo** ou Vitest (évals IA)

## Structure

```
apps/
  web/                 # Next.js : interface, Server Actions, routes API (webhooks)
packages/
  core/                # Domaine + ports. Aucune dépendance vers un SDK externe.
  connectors/          # Adaptateurs : github, vercel, llm, upstash…
  db/                  # Schéma Drizzle, migrations, client Postgres (Supabase). Jamais importé par core.
  agents/              # Prompts, schémas de sortie, logique des agents
  evals/               # Jeux de données et évals
```

## Architecture : hexagonale

- `packages/core` contient les entités (Project, Spec, Ticket, Run, Policy, Event) et les **ports** :
  `TicketProvider`, `GitProvider`, `LLMProvider`, `DeployProvider`.
- Chaque fournisseur externe est un **adaptateur** dans `packages/connectors`, qui implémente un port.
- `core` n'importe jamais `connectors`, ni Next.js, ni un SDK. Les dépendances pointent vers le cœur.
- Chaque port a une implémentation factice (fake) pour les tests.
- Toute décision d'architecture importante fait l'objet d'un ADR dans `docs/adr/` (format court : contexte, décision, conséquences).

## Règles de sécurité (non négociables)

- **Aucun secret en clair** : ni en base, ni dans les logs, ni dans une réponse renvoyée au navigateur. Les secrets vivent dans Supabase Vault ; la table `connections` ne stocke qu'une référence.
- Les secrets ne sont lus que côté serveur.
- **Vérifier la signature** de chaque webhook entrant (GitHub, QStash) avant tout traitement.
- La table `events` est en **ajout seul** : jamais d'UPDATE ni de DELETE.
- Row Level Security activée sur toutes les tables exposées.
- Ne jamais committer de fichier `.env`. Mettre à jour `.env.example` quand une variable est ajoutée.

## Conventions de code

- Nommage du code (variables, fonctions, fichiers) en **anglais** ; commentaires et docs en français.
- Pas de `any`. Préférer les types dérivés des schémas Zod (`z.infer`).
- Fonctions courtes, une responsabilité. Pas de logique métier dans les composants React ni dans les routes Next.js.
- Les erreurs attendues sont des valeurs typées, pas des exceptions silencieuses.
- Pas de nouvelle dépendance sans raison claire ; la justifier dans la PR.

## Workflow

- **Un ticket = une branche = une PR.** Nom de branche : `feat/<numéro>-<slug>` (ou `fix/`, `chore/`, `docs/`).
- Commits au format Conventional Commits : `feat(core): add TicketProvider port (#6)`.
- La PR référence son ticket (`Closes #<numéro>`) et reprend ses critères de fin, cochés.
- Avant d'ouvrir une PR, tout doit passer :

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
```

- Pour une migration de base : la générer avec Drizzle, vérifier qu'elle s'applique sur une base vide, et la signaler dans la PR. Ne jamais modifier une migration déjà mergée.
- Ne jamais merger soi-même : c'est l'humain qui merge (en V1).

## Ce que l'agent ne doit pas faire sans validation explicite

- Modifier les workflows CI (`.github/workflows/`), les migrations existantes ou la configuration de sécurité
- Ajouter ou changer un fournisseur externe
- Supprimer des fichiers ou des données
- Changer un choix de la stack ci-dessus

En cas de doute sur un choix d'architecture : s'arrêter et poser la question plutôt que deviner.

## Tickets

Les tickets V1 sont les issues #1 à #17 (libellé `v1`). Chacun liste ses tâches, ses critères de fin et ses dépendances (« Dépend de #… ») : ne pas commencer un ticket dont les dépendances ne sont pas mergées.
