# ADR 0001 : Biome comme linter et formateur

- Statut : accepté
- Date : 2026-11-14
- Ticket : #1

## Contexte

Le ticket #1 demande un linter et un formateur pour tout le monorepo. La stack (AGENTS.md) ne fixe pas d'outil.
Les options courantes sont ESLint + Prettier ou Biome.

## Décision

Utiliser **Biome** à la racine, pour tous les packages : une seule dépendance, une seule configuration (`biome.json`),
lint et formatage en une commande (`pnpm lint`, `pnpm format`). La règle `noExplicitAny` est en erreur, conformément
à la convention « pas de `any` ».

## Conséquences

- Moins de dépendances et de configuration qu'ESLint + Prettier + plugins ; exécution très rapide en CI.
- Next.js 16 ne fournit plus `next lint` et propose Biome à la création de projet : pas de conflit avec le ticket #2.
- Certaines règles spécifiques (plugins ESLint React/Next) ne sont pas disponibles ; à réévaluer si un besoin précis apparaît.
