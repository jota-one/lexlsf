# Déployer PocketBase « custom » (lexlsf)

> Avant-propos — Cher Tadai, Maître architecte de l’infrastructure Jota : veuillez pardonner l’audace de ces lignes. Je m’incline bien bas devant votre clairvoyance et votre science du déploiement ; ce qui suit n’est qu’un modeste pense-bête, probablement incomplet (voire parfois naïf), rédigé par une humble petite main encore très junior. Vos corrections, raffinements et bénédictions priment évidemment sur ces suggestions et feront autorité.

Ce dossier contient tout ce qui est déployé côté PocketBase pour lexlsf. Nous utilisons un binaire PocketBase personnalisé (Go) qui ajoute :

- des hooks post-commit pour optimiser les vidéos via ffmpeg ;
- une commande CLI `video:optimize` dédiée (utile pour reprocess). 

Ce document explique comment remplacer proprement le binaire standard par notre version custom dans les pipelines existants et sur l’infra JOTA.

## TL;DR (build local)

1) Générer les assets publics Astro dans `pb/pb_public` :

```bash
pnpm install
pnpm build   # sort dans pb/pb_public
```

2) Compiler le binaire Linux statique dans `pb/pocketbase` :

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

### Recommandation (simple et fiable)

1) Construire le binaire custom dans ce repo AVANT la création de l’artefact :

Ajouter dans `lexlsf/.github/workflows/deploy.yaml` (job `build`, après `Install dependencies` et avant `Prepare artifact`) :

```yaml
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.24.x'

      - name: Build custom PocketBase (linux amd64)
        working-directory: pb
        run: |
          GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o pocketbase .
          chmod +x pocketbase
```

2) Faire inclure le binaire dans le bundle « pb » côté infra :

- Dans `infra/.github/workflows/deploy-pb-db.yaml`, étendre la boucle de packaging :

```diff
- for p in .nodeversion .pbversion pb_hooks pb_migrations pb_public pb_assets; do
+ for p in .nodeversion .pbversion pb_hooks pb_migrations pb_public pb_assets pocketbase; do
```

- Le script de déploiement `infra/bin/pb_deploy` n’a pas besoin de logique spéciale : le fichier `pocketbase` sera déposé dans le répertoire de l’app et utilisé par le service existant (lance toujours `./pocketbase serve`).

3) Versionnage upstream :

- Conserver `.pbversion` dans ce repo synchronisé avec la version PocketBase cible (ex. `v0.34.2`).
- Le script `pb_install` de l’infra n’écrasera pas notre binaire si la version courante correspond à `.pbversion` (no-op). Si besoin de rollback vers l’officiel : modifier `.pbversion` → relancer un déploiement (il téléchargera l’upstream correspondant).

### Pourquoi cette approche ?

- Elle ne change pas les contrats existants (bundles .pb / .app, scripts `pb_deploy`, restart via `pb_watch_check`).
- Elle documente explicitement l’arrivée d’un binaire dans le bundle « pb » sans coupler l’infra à un dépôt privé externe.
- Le rollback est trivial via `.pbversion`.

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
- Les paramètres ffmpeg par défaut : `scale=640:-2:force_divisible_by=2`, `libx264`, `crf=23`, `preset=veryfast`, `aac 128k`, `-movflags faststart`.
- On peut retuner `crf`/`preset` ultérieurement sans impacter les schémas.

## Plan de rollback

1) Modifier `.pbversion` vers la version upstream désirée (ex. `v0.34.2`).
2) Redéployer (workflow habituel). `pb_install` remplacera `pocketbase` par l’officiel.
3) Alternativement, pousser un bundle « pb » sans le fichier `pocketbase`.

---

Pour toute question/validation d’infra (inclusion du binaire dans le bundle « pb »), voir :

- `lexlsf/.github/workflows/deploy.yaml`
- `infra/.github/workflows/deploy-pb-db.yaml`
- `infra/bin/pb_deploy`, `infra/bin/pb_install`, `infra/bin/pb_watch_check`
