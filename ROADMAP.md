# RoadMap du projet ls-flex.com

Ce document maintient la liste des changements planifiés pour le projet et sert de référence partagée pour la priorisation, le périmètre et l’avancement.

Format recommandé pour le suivi: `- [AAAA-MM-JJ] Titre — note courte`.

## Améliorations, refactorings

Liste des petites améliorations et refactorings potentiels.

(Aucune amélioration en attente pour le moment.)

## Nouvelles fonctionalités

### Admin personnes/organismes — onglet Liens / Bibliographie

Ajouter un onglet « Liens / Bibliographie » avec CRUD de liens web, sur le même modèle que l’onglet des vidéos YouTube.
Dans la partie publique, afficher ces liens sous la description, séparés par un trait.

### Fiche personne — champs “décédé” et “date de décès”

Ajouter un champ booléen « Décédé » et un champ « Date de décès » dans la fiche personne (admin et public).

### Signes — finaliser l’implémentation des mouvements

L’UI admin est déjà en place via `HandMovementForm` dans `SignForm`, et les formulaires initient `movements` pour la main droite/gauche. Il manque la persistance côté PocketBase (ajouter le champ/migration si nécessaire et sérialiser `movements` dans `useSigns.setFormData`), puis l’affichage côté public : remplacer les placeholders « Mouvement main ... (bientôt disponible) » dans la page signe par un rendu des données sauvegardées. Vérifier aussi la cohérence main gauche (si pas de configuration gauche, ne pas stocker/afficher). Enfin, clarifier le rôle de la collection `hand_movements`/composable associé (utiliser pour des options dynamiques ou le supprimer).

### Reporting sur les sessions de révision

Un utilisateur doit pouvoir consulter un maximum d'informations sur les sessions de révision qu'il a effectuées.
Il doit avoir accès à des statistiques, des charts illustrant sa progression dans différents aspects (vitesse, précision, etc.)

### Trombinoscope des personnages/organisations culturels

Créer une espèce de trombinoscope avec des flipCards. Face A: photo. Face B: Nom + vidéo du signe s'il y en a une. L'utilité de cet outil c'est d'avoir une vue d'ensemble des infos principales des personnes et organismes, sans devoir passer par les quiz.

## Historique (fait)

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

