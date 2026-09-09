# Découpeur de signes

Outil local qui découpe une vidéo où plusieurs signes se suivent en un fichier
par signe. Il repère les pauses entre les signes et coupe au milieu.

Tout se passe sur la machine : aucune vidéo n'est envoyée sur internet.

---

## Pour la personne qui utilise l'outil

### Installer

1. Décompressez le dossier reçu, et posez-le où vous voulez (le Bureau, par exemple).
2. Double-cliquez sur **`start.command`**.
3. macOS affichera sans doute « impossible d'ouvrir car le développeur ne peut
   pas être vérifié ». C'est normal pour un outil qui ne vient pas de l'App Store.
   Faites un **clic droit** sur `start.command`, puis **Ouvrir**, et confirmez.
   Cette manipulation n'est à faire qu'une seule fois.
4. Votre navigateur s'ouvre sur l'outil.

Si un message signale que **Node.js** manque, la page de téléchargement s'ouvre
toute seule : prenez la version marquée « LTS », installez-la, puis
double-cliquez à nouveau sur `start.command`.

### Utiliser

La page vous guide en quatre étapes. Les deux points qui décident vraiment de la
qualité du résultat se jouent au tournage :

- **Posez la caméra**, elle ne doit pas bouger.
- **Revenez au repos entre deux signes**, mains baissées, une bonne seconde.

Déposez ensuite la vidéo, vérifiez le découpage proposé sur la courbe, ajustez si
besoin, puis découpez.

### Arrêter

Fermez la fenêtre noire (Terminal) qui s'est ouverte, ou faites `Ctrl+C` dedans.

### Nommer les clips

Une fois les clips découpés, cliquez sur le nom sous chaque vidéo et tapez celui
du signe. Les accents, les espaces, les tirets et les apostrophes passent sans
problème : `l'école`, `sourd-muet`, `langue des signes`. Appuyez sur Entrée pour
valider, sur Échap pour annuler votre saisie.

Si vous relancez le découpage alors que des clips sont déjà là, une alerte vous
prévient : les fichiers actuels seront remplacés et les noms donnés perdus.

Le nom affiché est toujours celui du fichier sur le disque. Si un nom est refusé
(deux clips ne peuvent pas porter le même), l'ancien revient et la raison
s'affiche sous le champ.

### Ranger les clips

Le bouton **Déplacer vers un dossier…** ouvre le sélecteur de dossiers du Mac :
choisissez où vous rangez vos signes, et les clips y sont déplacés d'un coup.

Si un fichier du même nom s'y trouve déjà, il n'est **jamais écrasé** : le clip
arrive avec un numéro ajouté, comme le fait le Finder, et la liste des fichiers
concernés s'affiche.

Tant que vous ne les avez pas déplacés, les clips restent dans le sous-dossier
`work`. Le bouton **Ouvrir le dossier** les affiche dans le Finder, et ils sont
aussi téléchargeables un par un depuis la page. Vous pouvez vider `work` quand
vous voulez : il se recrée tout seul.

---

## Pour la maintenance

L'app est autonome : serveur `node:http`, front sans build, aucune dépendance
hors `ffmpeg-static`.

```bash
npm install
npm start          # http://127.0.0.1:4321
```

`PORT` change le port, `NO_OPEN=1` empêche l'ouverture automatique du navigateur.

### Envoyer une version à la cliente

```bash
./pack.sh
```

Produit `dist/decoupeur-de-signes.zip`, avec `node_modules` et le binaire ffmpeg
dedans — rien à installer en face, hormis Node.js.

**Le binaire ffmpeg est celui de la machine qui lance `pack.sh`.** Une archive
fabriquée sur un Mac Apple Silicon ne tournera pas sur un Mac Intel. Si besoin,
refaites l'archive depuis un Mac de l'architecture visée. À défaut, l'app se
rabat automatiquement sur un ffmpeg déjà installé (`brew install ffmpeg`), et le
bandeau en haut de la page indique lequel est utilisé.

### Le découpage

L'algorithme est dans [`public/segmentation.js`](public/segmentation.js), et il
est **partagé avec `scripts/split-sign-video.js`** à la racine du dépôt, pour que
la ligne de commande et l'app ne divergent jamais. Il est volontairement sans
dépendance ni API de plateforme : le navigateur et Node l'importent tel quel.

La courbe de mouvement vient d'une passe ffmpeg (voir `lib/analysis.js`) qui
recadre, floute, puis différencie chaque image avec la précédente. **Le flou
n'est pas cosmétique** : sans lui, le scintillement de compression H.264 sur les
contours du décor est lu comme du mouvement et noie les vraies pauses.

Le recadrage 4:3 est celui que le site applique à l'upload (`pb/hooks.go`), pour
que l'analyse porte sur le cadrage qui finira réellement en ligne.

L'app n'optimise pas les vidéos : la compression est faite par le serveur au
moment de l'envoi.

Une nuance à connaître : le ffmpeg embarqué (6.0) et un ffmpeg récent installé
via Homebrew (8.x) ne produisent pas exactement la même courbe — les bornes
peuvent différer d'une image ou deux. Sans conséquence, la marge autour de chaque
signe l'absorbe.
