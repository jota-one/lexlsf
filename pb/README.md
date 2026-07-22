# Déployer PocketBase « custom » (lexlsf)

> Avant-propos — Cher Tadai, Maître architecte de l’infrastructure Jota : veuillez pardonner l’audace de ces lignes. Je m’incline bien bas devant votre clairvoyance et votre science du déploiement ; ce qui suit n’est qu’un modeste pense-bête, probablement incomplet (voire parfois naïf), rédigé par une humble petite main encore très junior. Vos corrections, raffinements et bénédictions priment évidemment sur ces suggestions et feront autorité.

Ce dossier contient tout ce qui est déployé côté PocketBase pour lexlsf. Nous utilisons un binaire PocketBase personnalisé (Go) qui ajoute :

- des hooks post-commit pour optimiser les vidéos via ffmpeg ;
- une commande CLI `video:optimize` dédiée (utile pour reprocess).

Ce document explique comment remplacer proprement le binaire standard par notre version custom dans les pipelines existants et sur l’infra JOTA.

## TL;DR (build local)

1. Générer les assets publics Astro dans `pb/pb_public` :

```bash
pnpm install
pnpm build   # sort dans pb/pb_public
```

2. Compiler le binaire Linux statique dans `pb/pocketbase` :

```bash
cd pb
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o pocketbase .
# ou pour ARM64
# GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o pocketbase .
chmod +x pocketbase
```

Déployer ensuite comme d’habitude via les workflows (voir intégration CI dessous).

## Intégration CI avec notre infra

Le workflow App de ce repo : `.github/workflows/deploy.yaml`

- Étape `Build app` exécute `pnpm build` et remplie `pb/pb_public`.
- L’artefact publié embarque actuellement le dossier `pb` (cf. étape « Prepare artifact »).
- Côté infra, deux workflows orchestrent le déploiement :
  - `infra/.github/workflows/deploy-pb-db.yaml` (bundle « pb »)
  - `infra/.github/workflows/deploy-pb-app.yaml` (bundle « app »)

Par défaut, le bundle « pb » inclut : `.nodeversion`, `.pbversion`, `pb_hooks`, `pb_migrations`, `pb_public`, `pb_assets` (mais pas le binaire).

### Mécanisme effectif de déploiement du binaire custom

Vérifié sur `jota-one/infra` (2026-07-14) — aucun changement n'est requis dans ce repo :

1. `infra/.github/workflows/deploy-pb-db.yaml` détecte la présence de `go.mod`
   dans le bundle « pb » et **construit le binaire depuis les sources** (`main.go`,
   `hooks.go`) au déploiement.
2. `infra/bin/pb_install` ne remplace jamais un binaire construit depuis les
   sources : celui-ci se signale avec la version `(untracked)`, que le script
   saute systématiquement.
3. `.pbversion` ne sert qu'au rollback vers un binaire upstream officiel : le
   modifier puis relancer un déploiement télécharge la version upstream
   correspondante.

## Prérequis côté serveur

- `ffmpeg` installé (le binaire custom le détecte ; s’il est absent, l’optimisation est simplement ignorée et n’empêche pas les saves).
- Droits d’exécution sur `pocketbase` (le bundle l’embarque déjà avec `chmod +x`).
- Pas de changement côté systemd : le service continue d’exécuter `./pocketbase serve` dans le dossier de l’app.

## Vérification après déploiement

Sur le serveur (dossier de l’app sous `/srv/www/<domain>`)

```bash
./pocketbase -v             # vérifier la version s’affiche
ls -al                       # vérifier la présence/permissions du binaire
tail -f pb_logs/out.log      # vérifier les logs « Optimizing video » lors d’un upload
```

Tester un upload/édition d’un « sign » : la taille de la vidéo dans `pb_data/storage/<collectionId>/<recordId>` doit diminuer, et des logs « ✅ Video optimized » apparaissent.

## Notes d’exploitation

- Les hooks tournent en asynchrone post-commit et n’entravent pas les sauvegardes.
- Les paramètres ffmpeg par défaut : `crop=ih*4/3:ih,scale=720:-2:flags=lanczos:force_divisible_by=2,fps=24`, `libx265` (tag `hvc1`), `crf=24`, `preset=slow`, pas de piste audio (`-an`), `-movflags +faststart`. Les vidéos déjà en HEVC sont ignorées (probe `ffprobe`).
- On peut retuner `crf`/`preset` ultérieurement sans impacter les schémas.

## Plan de rollback

1. Modifier `.pbversion` vers la version upstream désirée (ex. `v0.34.2`).
2. Redéployer (workflow habituel). `pb_install` remplacera `pocketbase` par l’officiel.
3. Alternativement, pousser un bundle « pb » sans le fichier `pocketbase`.

---

Pour toute question/validation d’infra (inclusion du binaire dans le bundle « pb »), voir :

- `lexlsf/.github/workflows/deploy.yaml`
- `infra/.github/workflows/deploy-pb-db.yaml`
- `infra/bin/pb_deploy`, `infra/bin/pb_install`, `infra/bin/pb_watch_check`
