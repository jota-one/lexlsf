# RoadMap du projet ls-flex.com

Ce document maintient la liste des changements planifiés pour le projet et sert de référence partagée pour la priorisation, le périmètre et l’avancement.

Format recommandé pour le suivi: `- [AAAA-MM-JJ] Titre — note courte`.

## Améliorations, refactorings

Liste des petites améliorations et refactorings potentiels.

- Culture, galerie photo des personnes: ne pas faire apparaître le nom dans la carte, juste la photo et faire apparaître le nom en blanc sur un overlay un peu foncé au survol de la photo
- Culture: ajouter un mode "liste" en plus du mode (implicite) galerie actuel. Le mode liste va afficher une liste des personnes, bcp plus compacte, sans photo.
- Quizz création: Mettre des cases à cocher et un bouton "save" au lieu du bouton "+" et du "ajouter tous"
- Quizz exécution: Ajouter un champ "à réviser" dans un signe ou une personne (cochable par utilisateur et par quizz)

## Nouvelles fonctionnalités

### Admin personnes/organismes — onglet Liens / Bibliographie

Ajouter un onglet « Liens / Bibliographie » avec CRUD de liens web, sur le même modèle que l'onglet des vidéos YouTube.
Dans la partie publique, afficher ces liens sous la description, séparés par un trait.

### Signes — finaliser l'implémentation des mouvements

L’UI admin est déjà en place via `HandMovementForm` dans `SignForm`, et les formulaires initient `movements` pour la main droite/gauche. Il manque la persistance côté PocketBase (ajouter le champ/migration si nécessaire et sérialiser `movements` dans `useSigns.setFormData`), puis l’affichage côté public : remplacer les placeholders « Mouvement main ... (bientôt disponible) » dans la page signe par un rendu des données sauvegardées. Vérifier aussi la cohérence main gauche (si pas de configuration gauche, ne pas stocker/afficher). Enfin, clarifier le rôle de la collection `hand_movements`/composable associé (utiliser pour des options dynamiques ou le supprimer).

### Reporting sur les sessions de révision

Un utilisateur doit pouvoir consulter un maximum d'informations sur les sessions de révision qu'il a effectuées.
Il doit avoir accès à des statistiques, des charts illustrant sa progression dans différents aspects (vitesse, précision, etc.)

### Trombinoscope des personnages/organisations culturels

Créer une espèce de trombinoscope avec des flipCards. Face A: photo. Face B: Nom + vidéo du signe s'il y en a une. L'utilité de cet outil c'est d'avoir une vue d'ensemble des infos principales des personnes et organismes, sans devoir passer par les quiz.

### Migration SPA Vue — Lexique et Culture

Les pages publiques actuelles (`/categories/`, `/signs/`, `/culture/`, `/persons/`) sont des pages Astro SSR qui font des requêtes PocketBase **non authentifiées**. Avec un auth JWT stocké en `sessionStorage` (pas de session serveur), il est impossible d'appliquer un role-gating cohérent côté SSR.

Migrer en **2 SPAs Vue** (`client:only`), sur le modèle de l'admin et des pages Outils :

- **SPA Lexique** : drill-down catégorie → liste de signes → détail d'un signe (`/categories/`, `/signs/`)
- **SPA Culture** : galerie/liste de personnes et organismes → détail (`/culture/`, `/persons/`)

Les deux SPAs utilisent le token JWT de l'utilisateur connecté, ce qui permet d'uniformiser le contrôle d'accès par rôles sur l'ensemble du site.

Impact : retirer `@request.auth.id = ''` des `listRule`/`viewRule` des collections `sign`, `person`, `category` une fois la migration effectuée.

### Nouvelles sections "Outils": Champs lexicaux - Expressions françaises - Expressions pi-sourde

Ajouter un menu principal au site nommé "Outils". Dans ce menu, on pourra trouver plusieurs outils dont les 3 cités en titre. Il s'agit essentiellement d'entités qui permettent de regrouper des signes dans un certain thème.

Un champ lexical se compose d'un nom (ex. "Politique"), d'un petit texte d'introduction et d'une liste de termes en français. Si un terme possède déjà un signe dans le lexique, il faudra pouvoir le lui associer.

Une expression française se compose de l'expression en elle-même (ex: "Il l'a vraiment fait par dessus la jambe"), d'un champ texte "stratégies" dans lequel on peut écrire les différentes stratégies possibles pour signer cette expression et des liens vers les signes utiles.

Une expression pi sourde se compose forcément d'un lien vers le signe ad-hoc (et donc sa vidéo), d'un champ texte "stratégies" dans lequel on peut écrire les différentes stratégies possibles pour retranscrire cette expression en français.

Ces 3 nouvelles entités doivent apparaître dans les résultats de recherche du site.


## Historique (fait)

- [2026-04-14] Section "Outils" — nouveau menu principal avec 3 entités : Champs lexicaux (nom + intro + liste de termes liables aux signes), Expressions françaises (expression + stratégies + signes utiles), Expressions pi-sourdes (signe ad-hoc + vidéo + stratégies) ; CRUD admin complet, pages publiques SSR, intégration dans la recherche globale. Correctif simultané : le picker de signe dans l'admin passe d'un dropdown chargé en masse à une recherche à la frappe (`SignPicker.vue`).
- [2026-03-08] Visibilité des personnes par rôles — ajout d'un champ `Roles` (relation) sur `person` + règles PocketBase identiques aux signes (`admin` voit tout, autres utilisateurs selon intersection de rôles) ; UI admin enrichie avec sélecteur de rôles dans `PersonForm`.
- [2026-03-07] UX quiz — refonte de la carte : layout question/réponse côte à côte, suppression de l'animation flip, champs réduits à vidéo/image + terme, boutons en bas centrés, bouton "Ouvrir la fiche".
- [2026-03-07] Retrait uni/m1 — suppression de la valeur `uni/m1` du champ `learning_source` (migration DB + labels UI admin et public).
- [2026-03-07] Import des signes finalisé — import/export admin des signes validé avec prise en charge des rôles ; données réimportées et signes mis à jour (attribution du rôle `student` appliquée sur l'existant).
- [2026-03-07] Visibilité des signes par rôles — ajout d'une relation `roles` sur `sign` + règles PocketBase mises à jour (`admin` voit tout, autres utilisateurs selon intersection de rôles) ; UI admin des signes enrichie pour associer explicitement les rôles.
- [2026-03-07] Partage de quiz — champ `shared_with_users` sur la collection `quiz` ; modal de partage dans l'admin (liste + QuizEdit) ; règles d'accès PocketBase mises à jour sur `quiz`, `quiz_item` et la vue `quiz_counts` pour inclure les utilisateurs partagés ; les quiz partagés apparaissent dans la liste publique des révisions.
- [2026-03-07] Quiz shuffle & skip — deck mélangé au démarrage/reprise ; cartes passées réinsérées aléatoirement dans la file des skips (jamais avant une carte non évaluée) ; session terminée uniquement quand toutes les cartes ont une réponse définitive.
- [2026-03-07] Historique sessions quiz — cartouche de stats (durée min/moy/max, réussite min/moy/max, mini graphique) affiché sous le formulaire de démarrage.
- [2026-03-07] Prise de contrôle — un admin peut prendre le contrôle d'un autre compte utilisateur et reprendre son compte admin via le menu public.
- [2026-03-07] Admin signes colonnes — ajout des colonnes "Langue" et "Source" dans la liste des signes (fetch PocketBase + DataTable).
- [2026-03-07] Droits étudiants signes — les étudiants peuvent voir les signes de level c1 (migration DB, règle remplacée : `learning_source = 'uni/m1'` → `level = 'c1'`).
- [2026-03-07] Renommage LSI — "LS Internationale" renommé en "LSI" dans le champ `primary_language` (migration DB + labels UI admin et public).
- [2026-02-17] Fiche personne — champs "décédé" et "date de décès" disponibles en admin et public, avec labels adaptés pour personnes/organismes et support import/export.
- [2026-02-08] Affichage personne associée — remplacement de l'alert par un bouton icône discret sur la page signe.
- [2026-02-08] Migration vers dayjs — remplacement de l'objet Date natif par dayjs() pour le formatage des dates.
- [2026-02-08] Gestion des slugs — amélioration de la génération avec normalisation des accents et ajout de l'édition manuelle.
- [2026-02-07] Optimisation vidéos — suppression du son et ajustements build/migrations.
- [2026-01-25] Rôles & permissions — gestion des rôles, accès restreints, profil utilisateur.
- [2026-01-20] Quiz — première version du module de quiz.
- [2025-12-23] PocketBase étendu — optimisation vidéo à l’upload.
- [2025-12-21] Authentification — login/logout et amélioration des pages personnes.
- [2025-11-30] Admin UI — gestion des personnes et catégories, refonte PrimeVue.
- [2025-08-03] Admin SPA — ajout de l’app admin et enrichissement des métadonnées des signes.
- [2025-04-23] Base du projet — Astro + Vue, SSR catégories, outDir PocketBase.

ARCHIVE des demandes plus anciennes (dans Telegram)
LEXIQUE
Admin: 
- choisir catégories avec boutons au lieu de drop down
- pareil pour statut du signe, source d'apprentissage
- Source d'app : enlever famille. recherche
- Renommer personne en particulier en précision
- Langue principale : ajouter LS Internationale, BSL, ISL
- mouvements : boutons à cliquer

Front end
- Catégories : changer en menu déroulant, enlever la photo
- Titres ok, catégories en noir

Mouvements : boutons images + champ autre à remplir 
Orientation : ajouter
Direction : boutons images (reste a faire)
Mouvement
ENLEVER : mouvement de chemin,  type de main, trajectoire, mouvement interne (x3) et tout ce qu'il y après
Ajouter champ précision
Répétiion : x2, 

Pied de page :
- d'une autre couleur contrastée
- Textes en colonne à droit et a gauche : qui prenne moins de place verticalement

PAGE Detail signe
MG -MD -Emplacement

Form Person:
✅ Sourds/entendant
✅ Date de naissance
✅ Lieu de naissance
✅ Né(e) de famille sourde/ né(e) de famille entendante
✅ Précision sur la famille
✅ Activité (utiliser sous ensemble de catégories)
- Récompenses (reconnaissance institutionnelle)

- Liens (label + url)

Catégories:
✅ Pouvoir sélectionner plusieurs sous-catégories dans une catégorie parente
✅ Ajouter entité "personne activité"


Front:
Page personne:
✅ Bloc gris du haut: né + lieu -> ligne de séparation, activités
✅ Biographie à gauche (colonne 1/3). 
✅ Autre descriptions à venir (colonne 2/3). Même système que biographique. Description en markdown. Police un peu plus grande que bio (plutôt comme dans la carte du haut).

Page signes
✅ Aligner titre et def avec les textes DANS la carte
✅ Afficher lien vers Personne depuis page Signe
✅ Simplifier le pied de page et garder que le copyright
✅ Ordre: MG -MD - Emplacement
✅ En-dessous de MG (mouvement MG), pareil pour MD
✅ Aligner les 2 images d'emplacement
✅ Image emplacement tête, enlever les arrondis en bas

- Fixer taille image (max 300px de large)
✅ Ajouter champ prénom
✅ Tri par nom, prénom dans les listes
- Edit du slug
- Formulaire pour gérer les liens
- Afficher les liens en-dessous de la description avec un trait de séparation
- Ajouter champ "décédé" + "date décès" dans fiche personne
✅ Dans résultat de recherche: mettre tag à droite au lieu de gauche (signe, personne, etc.)
✅ Agrandir titres "Main droite", "Main gauche" et utiliser les couleurs standard rose et bleu
- Personne associée: changer le design et faire plus discret.

✅ 1. Import/Export (personne):
- nom
- prénom
- birthdate
- sourds?
- métier (catégorie)

✅ 2. Import/Export (signe):
- Tout ce qu'il y a dans les 2 premiers onglets (sauf vidéo)

✅ 3. Sécuriser le site complet par mot de passe

4. Révision:
✅ S'inspirer de Quizlet
✅ Créer un quizz de révision selon des critères de recherche (niveau, catégorie, date d'ajout, etc.)
- Champ "à réviser" dans un signe ou une personne (cochable par utilisateur et par quizz)
✅ Ajouter filtre par date d'ajout
✅ Mettre pouce en l'air, pouce en bas au lieu de "Je savais", "je savais pas"
✅ Remonter les boutons "passer", "retourner", etc juste en-dessous de la flip-card.
- Mettre des cases à cocher et un bouton "save" au lieu du bouton "+" et du "ajouter tous"
✅ Corriger bug "Supprimer un quiz"

General:
✅ Hauteur flipcard pas correct. Si trop de contenu, override les boutons.
✅ Bouton pouces à faire plus gros
✅ Aligner à gauche les boutons
✅ marge top trop faible. Le contenu passe presque sous le header
✅ Renommer le menu Révision en Quiz et le déplacer dans un sous-menu qui apparaitra quand on clique sur le nom-prénom de la personne connectée.
✅ Ajouter un menu d'édition du profil de la personne connectée

Culture:
- Créer une espèce de trombinoscope avec des flipCards. Face A: photo. Face B: Nom + vidéo du signe s'il y en a une. L'utilité de cet outil c'est d'avoir une vue d'ensemble des infos principales des personnes et organismes, sans devoir passer par les quiz

Admin signes:
- Renommer LS Internationale en LSI (migration db)
- Ajouter 2 colonnes dans UI list (type de langue et learning source)

Admin Quizz:
- Geetha n'arrive pas à supprimer un certain quizz "test"
- Admin doit pouvoir partager un quizz avec d'autres utilisateurs

Accès "Etudiant":
- Doivent pouvoir voir les quizz partagé avec eux