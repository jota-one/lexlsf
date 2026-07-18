# Lexique LSF

Plateforme d'apprentissage et de documentation de la langue des signes française
(LSF) : lexique de signes en vidéo, culture sourde, culture générale, outils
lexicaux et module de révision par quiz, avec une interface d'administration
complète.

## Stack

- **Frontend** : [Astro](https://astro.build) + îlots [Vue 3](https://vuejs.org)
  (PrimeVue, Tailwind CSS 4, daisyUI). Cinq mini-SPA indépendantes (admin,
  lexique, culture, culture générale, révisions) — voir
  [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
- **Backend** : [PocketBase](https://pocketbase.io) avec binaire Go custom
  (hooks d'optimisation vidéo ffmpeg, validation des slugs) — voir
  [pb/README.md](./pb/README.md).

## Développement

```bash
pnpm install
pnpm db        # terminal 1 — PocketBase sur http://127.0.0.1:8090
pnpm dev       # terminal 2 — Astro sur http://localhost:4321
```

## Build & vérifications

```bash
pnpm build     # astro check + astro build
pnpm build:db  # compile le binaire PocketBase custom (pb/)
pnpm lint      # oxlint (type-aware)
pnpm test      # vitest
```

## Documentation

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — architecture multi-SPA et frontières
- [docs/ARCHITECTURE-ANALYSIS.md](./docs/ARCHITECTURE-ANALYSIS.md) — analyse détaillée
- [docs/IMPLEMENTATION-PLAN.md](./docs/IMPLEMENTATION-PLAN.md) — plan d'amélioration
- [pb/README.md](./pb/README.md) — backend PocketBase custom et déploiement
