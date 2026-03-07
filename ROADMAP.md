# RoadMap du projet ls-flex.com

Ce document maintient la liste des changements planifiés pour le projet et sert de référence partagée pour la priorisation, le périmètre et l’avancement.

Format recommandé pour le suivi: `- [AAAA-MM-JJ] Titre — note courte`.

## Améliorations, refactorings

Liste des petites améliorations et refactorings potentiels.

- Gérer un peu mieux la largeur des colonnes dans la liste des signes dans l'admin.

## Nouvelles fonctionnalités

### Amélioration de l'UX/UI dans une question de quiz.
Pour l'instant on a une FlipCard très large qui ne sert à rien et dont l'animation fatigue les utilisateur.

On garde la card, mais on arrête le flip.
On garde la zone question à gauche, mais on met la zone réponse à droite (qui va apparaître lorsque l'utilisateur clique sur "Retourner", bouton à renommer "Réponse").
On déplace tous les boutons d'action en-dessous de la carte, centrés.
On ne garde que la vidéo (ou l'image pour les quiz "personnes") et le terme. On dégage les autres champs.
On ajoute un bouton "Ouvrir la fiche" qui ouvre le détail du signe ou de la personne dans une nouvelle fenêtre.

### Changement visibilité signes - association avec les rôles
Pour l'instant on détermine ce que les utilisateurs 'student' peuvent voir comme signe en se basant sur le level=c1. C'est pas idéal. Le signe doit avoir un lien avec la table role et on doit pouvoir explicitement associer un signe à un role.

Par défaut, le role admin a accès à tous les signes, sans qu'une association explicite soit nécessaire.

Une fois cette modification effectuée, il faut retirer la contrainte sur level=c1

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

## Historique (fait)

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

