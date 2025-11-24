# 🗺️ ROADMAP PROJET VERA - Équipe de 3 Développeurs

> **Dernière mise à jour**: 24 novembre 2025  
> **Statut**: En cours - Phase 2

---

## 📋 TABLE DES MATIÈRES

1. ~~[Phase 0 - Préparation & Organisation](#phase-0---préparation--organisation)~~ ✅ **TERMINÉE**
2. ~~[Phase 1 - Backend Fondations](#phase-1---backend-fondations)~~ ✅ **TERMINÉE**
3. [Phase 2 - Backend Avancé](#phase-2---backend-avancé) 🔄 **EN COURS**
4. [Phase 3 - Frontend Vera Web](#phase-3---frontend-vera-web) ⏳ **En attente maquettes**
5. [Phase 4 - Bots d'Extraction & Vérification](#phase-4---bots-dextraction--vérification-automatique)
6. [Phase 5 - Tests & Déploiement](#phase-5---tests--déploiement)

---

## ~~PHASE 0 - Préparation & Organisation~~ ✅ **TERMINÉE**

### 📌 Objectif

Mettre en place l'organisation du projet et attendre les maquettes avant de commencer le frontend.

---

### ✅ ~~Étape 0.1 - Organisation de l'équipe~~ **TERMINÉE**

**Description**:  
Définir les rôles et responsabilités de chaque développeur.

**Livrables**:

- [x] Définir un lead technique (coordination, revue de code)
- [x] Définir les spécialités de chacun (Backend API, Backend Auth, Fullstack)
- [x] Mettre en place un système de communication (Discord, Slack)
- [x] Créer un board Trello/Notion/GitHub Projects

**Temps estimé**: 2h

---

### ✅ ~~Étape 0.2 - Configuration de l'environnement de développement~~ **TERMINÉE**

**Description**:  
Chaque développeur doit avoir un environnement de travail identique et fonctionnel.

**Livrables**:

- [x] Cloner le repo Git
- [x] Installer Node.js (v20+)
- [x] Installer pnpm (`npm install -g pnpm`)
- [x] Installer les dépendances: `pnpm install`
- [x] Vérifier que le frontend démarre: `pnpm nx serve frontend`
- [x] Vérifier que le backend démarre: `pnpm nx serve:dev backend`
- [x] Installer les extensions VSCode recommandées (Angular, Prettier, ESLint)

**Temps estimé**: 1h par développeur

---

### ✅ ~~Étape 0.3 - Configuration Supabase~~ **TERMINÉE**

**Description**:  
Créer et configurer le projet Supabase pour la base de données PostgreSQL.

**Livrables**:

- [x] Créer un compte Supabase
- [x] Créer un nouveau projet
- [x] Récupérer l'URL et la clé API (anon key)
- [x] Créer un fichier `.env` à la racine du backend
- [x] Ajouter `.env` au `.gitignore` (déjà fait normalement)
- [x] Documenter les variables d'environnement dans un fichier `.env.example`

**Temps estimé**: 1h

---

### ✅ ~~Étape 0.4 - Récupération de la clé API Vera~~ **TERMINÉE**

**Description**:  
Contacter le référent pour obtenir la clé API de Vera pour le fact-checking.

**Livrables**:

- [x] Contacter le référent projet
- [x] Récupérer la clé API Vera
- [x] Ajouter `VERA_API_KEY=xxx` dans le `.env`
- [x] Tester l'API Vera avec un cURL (voir doc dans `app.md`)

**Temps estimé**: 30 min + délai d'attente

---

### ✅ ~~Étape 0.5 - Attente des maquettes~~ **TERMINÉE**

**Description**:  
Pendant que l'équipe UX/UI travaille sur les maquettes, se concentrer sur le backend.

**Livrables**:

- [x] Demander les maquettes à l'équipe design
- [x] Définir une deadline pour la réception des maquettes
- [x] Lister les pages nécessaires:
  - Landing Page (présentation Vera)
  - Page de connexion admin
  - Dashboard admin (statistiques, sondages)
  - Page d'intégration du module fact-checking
- [x] Pendant ce temps: **commencer la Phase 1 (Backend)**

**Temps estimé**: En parallèle du backend

---

## ~~PHASE 1 - Backend Fondations~~ ✅ **TERMINÉE**

### 📌 Objectif

Créer l'API REST de base avec authentification et structure modulaire.

---

### ✅ ~~Étape 1.1 - Configuration TypeORM & Base de données~~ **TERMINÉE**

**Description**:  
Connecter NestJS à la base de données Supabase PostgreSQL via TypeORM.

**Livrables**:

- [x] Installer les dépendances
- [x] Configurer `TypeOrmModule` dans `app.module.ts`
- [x] Créer la configuration avec validation Joi des variables d'environnement
- [x] Tester la connexion à la base de données

**Temps estimé**: 2-3h

---

### ✅ ~~Étape 1.2 - Module Admin & Authentification JWT~~ **TERMINÉE**

**Description**:  
Mettre en place le système d'authentification sécurisé pour les administrateurs.

**Livrables**:

- [x] Installer les dépendances
- [x] Créer l'entité `Admin` (table `admins` dans Supabase)
- [x] Créer la migration pour la table `admins`
- [x] Implémenter `AuthService`
- [x] Implémenter `JwtStrategy` pour Passport
- [x] Créer `JwtAuthGuard` et `AdminGuard`
- [x] Créer `AuthController`
- [x] Créer un script pour générer le hash d'un mot de passe admin
- [x] Insérer manuellement un admin de test dans Supabase

**Temps estimé**: 4-5h

---

### ✅ ~~Étape 1.3 - Module Supabase Service~~ **TERMINÉE**

**Description**:  
Créer un service centralisé pour les interactions avec Supabase.

**Livrables**:

- [x] Installer Supabase client
- [x] Compléter `SupabaseService`
- [x] Rendre le service injectable globalement
- [x] Tester les requêtes de base (select, insert, update, delete)

**Temps estimé**: 2h

---

### ✅ ~~Étape 1.4 - Tests des endpoints d'authentification~~ **TERMINÉE**

**Description**:  
Valider que l'authentification fonctionne correctement.

**Livrables**:

- [x] Tester avec Postman/Insomnia/cURL
- [x] Documenter les endpoints dans un fichier `API.md` ou via Swagger
- [x] Corriger les bugs identifiés

**Temps estimé**: 1h

---

### ✅ ~~Étape 1.5 - Configuration CORS~~ **TERMINÉE**

**Description**:  
Permettre au frontend Angular de communiquer avec le backend.

**Livrables**:

- [x] Configurer CORS dans `main.ts`
- [x] Tester avec une requête depuis le frontend

**Temps estimé**: 30 min

---

## PHASE 2 - Backend Avancé

### 📌 Objectif

Développer les modules métier (fact-checking, sondages Instagram, contenus TikTok/Telegram).

---

### ✅ Étape 2.1 - Module Fact-Checking (Intégration API Vera)

**Description**:  
Créer un module pour communiquer avec l'API Vera et vérifier des informations.

**Livrables**:

- [ ] Créer le module `fact-check`:

```bash
pnpm nx g @nestjs/schematics:module fact-check --project=backend
pnpm nx g @nestjs/schematics:service fact-check --project=backend
pnpm nx g @nestjs/schematics:controller fact-check --project=backend
```

- [ ] Créer l'entité `FactCheck`:
  - `id`, `user_id`, `query`, `response`, `status`, `created_at`
- [ ] Implémenter `FactCheckService`:
  - `verifyFact(userId, query)`: appel streaming à l'API Vera
  - `autoVerify(contentId)`: vérification automatique depuis un contenu
  - Stocker les requêtes et réponses dans la DB
- [ ] Créer les DTOs:
  - `CreateFactCheckDto`: `{ userId: string, query: string }`
- [ ] Implémenter `FactCheckController`:
  - `POST /api/fact-check` (protégé)
  - `GET /api/fact-check` (historique, protégé)
  - `GET /api/fact-check/:id` (détail, protégé)
- [ ] Gérer le streaming de la réponse Vera
- [ ] Tester avec cURL/Postman

**Temps estimé**: 5-6h

---

### ✅ Étape 2.2 - Module Sondages Instagram (Backend)

**Description**:  
Créer un système complet de gestion des sondages Instagram (stockage + API Instagram).

**Livrables**:

- [ ] Créer le module `instagram-polls`:

```bash
pnpm nx g @nestjs/schematics:resource instagram-polls --project=backend
```

- [ ] Installer les dépendances:

```bash
pnpm add axios
```

- [ ] Créer les entités:
  - `Poll`: `id`, `question`, `options[]`, `platform`, `instagram_story_id`, `status`, `created_at`
  - `PollResponse`: `id`, `poll_id`, `user_instagram_id`, `selected_option`, `created_at`
- [ ] Implémenter `InstagramPollsService`:
  - CRUD des sondages locaux
  - `publishToInstagram(pollId)`: publier un sondage sur Instagram (story avec sticker)
  - `syncResponses(pollId)`: récupérer les réponses depuis Instagram
  - `getStatistics(pollId)`: calculer les stats (nombre de réponses, %, etc.)
- [ ] Créer les DTOs:
  - `CreatePollDto`, `UpdatePollDto`, `PollResponseDto`, `PollStatsDto`
- [ ] Implémenter `InstagramPollsController`:
  - `POST /api/instagram-polls` (créer + publier, protégé)
  - `GET /api/instagram-polls` (liste, protégé)
  - `GET /api/instagram-polls/:id` (détail + stats, protégé)
  - `POST /api/instagram-polls/:id/sync` (synchroniser, protégé)
  - `PATCH /api/instagram-polls/:id` (modifier, protégé)
  - `DELETE /api/instagram-polls/:id` (supprimer, protégé)
- [ ] Webhook Instagram (optionnel - temps réel):
  - `POST /api/instagram-polls/webhook` (recevoir les réponses)
- [ ] Tester les endpoints

**Temps estimé**: 6-7h

---

### ✅ Étape 2.3 - Module Contenus TikTok/Telegram (Backend)

**Description**:  
Gérer les contenus extraits de TikTok/Telegram pour le fact-checking.

**Livrables**:

- [ ] Créer le module `contents`:

```bash
pnpm nx g @nestjs/schematics:resource contents --project=backend
```

- [ ] Créer l'entité `Content`:
  - `id`, `platform` (tiktok/telegram), `content_url`, `metadata`, `extracted_at`, `verified`, `verification_result`, `fact_check_id`
- [ ] Implémenter `ContentsService`:
  - CRUD des contenus
  - `extractFromUrl(url, platform)`: extraire métadonnées
  - `markAsVerified(id, result)`: marquer comme vérifié
  - Stocker les métadonnées (auteur, date, likes, commentaires, texte, hashtags)
- [ ] Créer les DTOs:
  - `CreateContentDto`, `UpdateContentDto`, `ContentMetadataDto`
- [ ] Implémenter `ContentsController`:
  - `POST /api/contents` (ajouter un contenu, protégé)
  - `GET /api/contents` (liste avec filtres, protégé)
  - `GET /api/contents/:id` (détail, protégé)
  - `POST /api/contents/:id/verify` (envoyer à Vera, protégé)
- [ ] Tester les endpoints

**Temps estimé**: 3-4h

---

### ✅ Étape 2.4 - Documentation API avec Swagger

**Description**:  
Générer une documentation interactive de l'API.

**Livrables**:

- [x] Installer Swagger:

```bash
pnpm add @nestjs/swagger
```

- [x] Configurer Swagger dans `main.ts`
- [x] Ajouter les décorateurs `@ApiTags`, `@ApiOperation`, `@ApiResponse` sur tous les endpoints
- [x] Tester l'interface Swagger: `http://localhost:3000/api/docs`
- [x] Documenter les schémas des DTOs avec `@ApiProperty`

**Temps estimé**: 2h

---

## PHASE 3 - Frontend Vera Web

### 📌 Objectif

Développer l'interface utilisateur complète : Landing Page publique + Dashboard Admin (une fois les maquettes reçues).

---

### ✅ ~~Étape 3.1 - Configuration des environnements Angular~~ **TERMINÉE**

**Description**:  
Configurer les variables d'environnement pour communiquer avec le backend.

**Livrables**:

- [x] Mettre à jour `apps/frontend/src/environments/environment.ts`
- [x] Créer `environment.production.ts` avec les URLs de production
- [x] Créer un alias `@env` dans `tsconfig.json` pour faciliter les imports

**Temps estimé**: 30 min

---

### ✅ ~~Étape 3.2 - Service d'authentification Angular~~ **TERMINÉE**

**Description**:  
Créer un service pour gérer l'authentification côté frontend.

**Livrables**:

- [x] Générer le service
- [x] Implémenter `AuthService`:
  - `login(email, password)`: appel à `POST /api/auth/login`
  - `logout()`: suppression du token
  - `isAuthenticated()`: vérification du token (signal)
  - `getToken()`: récupération du token depuis localStorage
  - `currentUser`: signal contenant l'utilisateur connecté
- [x] Créer les modèles:
  - `User`: `{ id, email, name }`
  - `LoginResponse`: `{ access_token, user }`
- [x] Utiliser des **signals** et **computed** pour la réactivité

**Temps estimé**: 2-3h

---

### ✅ ~~Étape 3.3 - Auth Guard & Interceptor~~ **TERMINÉE**

**Description**:  
Protéger les routes et ajouter automatiquement le token JWT aux requêtes HTTP.

**Livrables**:

- [x] Compléter `auth.guard.ts`:
  - Rediriger vers `/login` si non authentifié
  - Utiliser `inject(AuthService)` et `inject(Router)`
- [x] Compléter `auth.interceptor.ts`:
  - Ajouter le header `Authorization: Bearer <token>` à toutes les requêtes
  - Gérer les erreurs 401 (redirection vers login)
- [x] Configurer l'interceptor dans `app.config.ts`

**Temps estimé**: 1-2h

---

### ✅ ~~Étape 3.4 - Composant Login~~ **TERMINÉE**

**Description**:  
Créer le formulaire de connexion pour les administrateurs.

**Livrables**:

- [x] Créer le composant (standalone)
- [x] Implémenter le formulaire:
  - Utiliser `ReactiveFormsModule`
  - Champs: `email`, `password`
  - Validation: email valide, password requis
  - Bouton de soumission
- [x] Gérer la soumission:
  - Appeler `authService.login()`
  - Afficher un message d'erreur en cas d'échec
  - Rediriger vers `/dashboard` en cas de succès
- [x] Styliser avec Tailwind CSS (base, à affiner avec les maquettes)
- [x] Utiliser des **signals** pour l'état du formulaire

**Temps estimé**: 2-3h

---

### ✅ Étape 3.5 - Landing Page Vera Web (à voir avec les maquettes)

**Description**:  
Créer la page d'accueil publique présentant Vera et ses valeurs.

**Livrables**:

- [ ] Créer le composant:

```bash
pnpm nx g @nx/angular:component landing --project=frontend --standalone
```

- [ ] Créer les sections (structure de base, à affiner avec les maquettes):
  - **Hero**: titre accrocheur, sous-titre, CTA vers module fact-checking
  - **Présentation Vera**: valeurs, mission, objectifs
  - **Explication fact-checking**: comment ça fonctionne
  - **Protocoles**: méthodologie, sources, transparence
  - **Module fact-checking**: formulaire pour tester (appel API)
  - **Footer**: liens, contact, mentions légales, RGPD
- [ ] Navigation:
  - Lien vers `/login` (accès admin)
  - Menu avec ancres vers sections
- [ ] Styliser avec Tailwind (responsive)
- [ ] Route: `{ path: '', component: LandingComponent }`

**Temps estimé**: 5-6h (structure de base avant maquettes)

---

### ✅ Étape 3.6 - Structure Dashboard Admin (structure)

**Description**:  
Créer la structure du dashboard admin avec navigation et layout.

**Livrables**:

- [ ] Créer le composant:

```bash
pnpm nx g @nx/angular:component admin/dashboard --project=frontend --standalone
```

- [ ] Créer la structure de base:
  - **Header**: logo Vera + nom de l'admin + bouton logout
  - **Sidebar** avec menu de navigation:
    - 📊 Statistiques globales
    - 📝 Sondages Instagram
    - ✅ Fact-checking (historique)
    - 📹 Contenus extraits (TikTok/Telegram)
  - **Zone de contenu** principal (router-outlet)
- [ ] Configurer les routes dans `app.routes.ts`:

```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard],
  children: [
    { path: '', redirectTo: 'stats', pathMatch: 'full' },
    { path: 'stats', component: StatsComponent },
    { path: 'polls', component: PollsComponent },
    { path: 'fact-check', component: FactCheckComponent },
    { path: 'contents', component: ContentsComponent },
  ]
}
```

- [ ] Styliser avec Tailwind (responsive, mobile-first)
- [ ] Maximiser l'utilisation de `<ng-content>` pour la réutilisabilité

**Temps estimé**: 3-4h

---

### ✅ Étape 3.7 - Intégration des maquettes (Landing + Dashboard)

**Description**:  
Affiner le design de tous les composants selon les maquettes reçues de l'équipe UX/UI.

**Livrables**:

- [ ] **Recevoir les maquettes** de l'équipe design:
  - Landing Page Vera Web
  - Page Login
  - Dashboard Admin (layout + toutes les pages)
- [ ] Analyser les maquettes et lister les composants nécessaires
- [ ] **Créer une bibliothèque de composants réutilisables**:
  - Buttons (primary, secondary, danger, ghost)
  - Cards (avec/sans image, avec actions)
  - Forms (inputs, textarea, select, checkbox, radio)
  - Modals (confirmation, formulaire)
  - Loaders/Spinners
  - Toasts/Notifications (success, error, info)
  - Tables (triable, paginable)
  - Charts/Graphiques (pour les stats)
- [ ] **Appliquer le design** sur tous les composants existants:
  - Couleurs, typographies, espacements
  - Icônes (choisir une lib: Heroicons, Lucide, etc.)
  - Animations/Transitions
- [ ] Configurer Tailwind avec les couleurs custom:
  - Palette de couleurs Vera
  - Breakpoints personnalisés si besoin
- [ ] Vérifier le responsive sur mobile/tablette/desktop
- [ ] Valider avec l'équipe design

**Temps estimé**: 8-10h (dépend de la complexité des maquettes)

---

### ✅ Étape 3.8 - Page Statistiques Dashboard

**Description**:  
Afficher un tableau de bord avec les statistiques globales du projet.

**Livrables**:

- [ ] Créer le composant `StatsComponent`
- [ ] Créer un service `StatsService`:
  - `getGlobalStats()`: agrégation de toutes les données
- [ ] Afficher les données avec des **cards/KPIs**:
  - 📊 Nombre total de fact-checks effectués
  - 📝 Nombre de sondages Instagram (actifs/terminés)
  - 📹 Nombre de contenus extraits (TikTok + Telegram)
  - ✅ Taux de vérification
  - 📈 Évolution dans le temps (graphique)
- [ ] **Graphiques** (utiliser une lib: `chart.js`, `ng2-charts`, ou `apexcharts`):
  - Répartition par plateforme (pie chart)
  - Évolution temporelle (line chart)
  - Top des requêtes fact-check
- [ ] Styliser selon les maquettes

**Temps estimé**: 4-5h

---

### ✅ Étape 3.9 - Page Gestion des Sondages Instagram

**Description**:  
Interface pour créer, publier, modifier et visualiser les sondages Instagram avec résultats temps réel.

**Livrables**:

- [ ] Créer le composant `PollsComponent`
- [ ] Créer un service `InstagramPollsService`:
  - `getPolls()`: liste des sondages
  - `getPoll(id)`: détail + statistiques
  - `createAndPublish(data)`: créer + publier sur Instagram
  - `syncResponses(id)`: synchroniser les réponses
  - `updatePoll(id, data)`: modifier
  - `deletePoll(id)`: supprimer
- [ ] **Liste des sondages** (tableau ou cards):
  - Question
  - Statut (brouillon/publié/terminé)
  - Date de création/publication
  - Nombre de réponses
  - Actions (voir, modifier, supprimer, synchroniser)
- [ ] **Bouton "Créer un sondage"** ouvrant un modal/formulaire:
  - Question (max 200 caractères)
  - Options (2-4 options dynamiques, ajout/suppression)
  - Bouton "Publier sur Instagram"
- [ ] **Page détail d'un sondage**:
  - Afficher les résultats en temps réel (polling ou WebSocket)
  - Statistiques: nombre total, % par option, graphique
  - Liste des réponses (anonymisées)
  - Bouton "Synchroniser" (actualiser depuis Instagram)
- [ ] Styliser selon les maquettes

**Temps estimé**: 5-6h

---

### ✅ Étape 3.10 - Page Fact-Checking (Historique + Nouveau)

**Description**:  
Interface pour utiliser le module de fact-checking Vera et consulter l'historique.

**Livrables**:

- [ ] Créer le composant `FactCheckComponent`
- [ ] Créer un service `FactCheckService`:
  - `verifyFact(query)`: appel streaming à l'API
  - `getHistory()`: historique des vérifications
  - `getFactCheck(id)`: détail d'une vérification
- [ ] **Formulaire de vérification** (en haut de page):
  - Champ texte multiligne pour la question/affirmation
  - Bouton "Vérifier avec Vera"
  - Afficher la réponse de Vera:
    - Gérer le streaming (affichage progressif, effet "typing")
    - Afficher le résultat final avec sources
    - Sauvegarder automatiquement dans l'historique
- [ ] **Historique des vérifications** (liste/tableau):
  - Date, requête, résumé de la réponse, statut
  - Clic pour voir le détail complet
  - Filtres: date, statut
  - Pagination
- [ ] Styliser selon les maquettes

**Temps estimé**: 4-5h

---

### ✅ Étape 3.11 - Page Contenus Extraits (TikTok/Telegram)

**Description**:  
Interface pour visualiser et vérifier les contenus extraits par les bots.

**Livrables**:

- [ ] Créer le composant `ContentsComponent`
- [ ] Créer un service `ContentsService`:
  - `getContents(filters)`: liste avec filtres
  - `getContent(id)`: détail d'un contenu
  - `verifyContent(id)`: envoyer à Vera pour vérification
- [ ] **Liste des contenus** (tableau ou cards):
  - Plateforme (icône TikTok/Telegram)
  - URL/Lien
  - Aperçu des métadonnées (auteur, date, texte)
  - Statut (non vérifié / en cours / vérifié)
  - Actions (voir détail, vérifier)
- [ ] **Filtres avancés**:
  - Par plateforme (TikTok, Telegram, tous)
  - Par statut (vérifié/non vérifié)
  - Par date d'extraction
  - Recherche par mot-clé
- [ ] **Page détail d'un contenu**:
  - Toutes les métadonnées complètes
  - Contenu (texte, images, vidéo si possible)
  - Bouton "Vérifier avec Vera" (si pas encore vérifié)
  - Résultat de vérification (si vérifié)
  - Lien vers le fact-check associé
- [ ] Styliser selon les maquettes

**Temps estimé**: 4-5h

---

### ✅ Étape 3.12 - Accessibilité (WCAG, ARIA, WAI)

**Description**:  
Rendre l'application accessible à tous les utilisateurs.

**Livrables**:

- [ ] Utiliser des balises sémantiques HTML5 (`<nav>`, `<main>`, `<section>`, etc.)
- [ ] Ajouter des attributs ARIA:
  - `aria-label` pour les boutons sans texte
  - `aria-labelledby` pour les modals
  - `aria-live` pour les notifications
  - `role` appropriés
- [ ] Garantir un contraste suffisant (WCAG AA minimum):
  - Utiliser un outil comme [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ ] Support complet au clavier:
  - Navigation au Tab
  - Fermeture des modals avec Escape
  - Focus visible
- [ ] Tester avec un lecteur d'écran (NVDA, VoiceOver)
- [ ] Valider avec [axe DevTools](https://www.deque.com/axe/devtools/)
- [ ] Corriger tous les problèmes identifiés

**Temps estimé**: 3-4h

---

### ✅ Étape 3.13 - Conformité RGPD & CNIL

**Description**:  
Mettre en place les mécanismes de conformité pour la protection des données.

**Livrables**:

- [ ] Créer une page "Politique de confidentialité"
- [ ] Créer une page "Mentions légales"
- [ ] Implémenter un bandeau de consentement cookies:
  - Choix explicite (accepter/refuser)
  - Stockage du consentement
- [ ] Permettre l'export des données utilisateur (si applicable)
- [ ] Permettre la suppression des données utilisateur (si applicable)
- [ ] Chiffrer les données sensibles en base de données
- [ ] Logger les accès aux données personnelles (si applicable)
- [ ] Documenter les traitements de données

**Temps estimé**: 4-5h

---

## PHASE 4 - Bots d'Extraction & Vérification Automatique

### 📌 Objectif

Créer des bots pour extraire automatiquement des contenus TikTok et Telegram, et les vérifier avec Vera.

---

### ✅ Étape 4.1 - Préparation : Choix de la plateforme secondaire + Comptes

**Description**:  
Analyser les options, créer les comptes nécessaires et justifier les choix.

**Livrables**:

- [ ] **Analyser** Telegram vs Signal:
  - **Telegram**: ✅ API riche, bots faciles, grande communauté, doc complète
  - **Signal**: ❌ Chiffrement E2E mais API limitée, complexe pour les bots
- [ ] **Choisir Telegram** (recommandé) et **documenter la justification**
- [ ] **Créer un compte TikTok** dédié au projet
- [ ] **Explorer l'API TikTok**:
  - Vérifier les limitations d'accès
  - Alternative: scrapers (yt-dlp, TikTok API non officielle)
  - Documenter la solution retenue
- [ ] **Créer le bot Telegram** via [@BotFather](https://t.me/botfather)
  - Récupérer le token
  - Ajouter dans `.env`: `TELEGRAM_BOT_TOKEN=xxx`

**Temps estimé**: 2-3h

---

### ✅ Étape 4.2 - Bot d'extraction TikTok (Backend)

**Description**:  
Développer un service capable d'extraire vidéos et métadonnées TikTok.

**Livrables**:

- [ ] Créer le module `tiktok-bot`:

```bash
pnpm nx g @nestjs/schematics:module tiktok-bot --project=backend
pnpm nx g @nestjs/schematics:service tiktok-bot --project=backend
```

- [ ] Installer les dépendances:

```bash
pnpm add tiktok-scraper
# Ou: pnpm add yt-dlp-wrap (si scraper indisponible)
```

- [ ] Implémenter `TikTokBotService`:
  - `extractFromUrl(url)`: extraire vidéo + métadonnées
  - `getMetadata(url)`: auteur, date, likes, commentaires, description, hashtags
  - `saveContent(data)`: créer un `Content` dans la DB (via `ContentsService`)
- [ ] Ajouter un endpoint dans `ContentsController`:
  - `POST /api/contents/extract-tiktok` (body: `{ url }`)
- [ ] Gérer les erreurs (vidéo privée, supprimée, URL invalide)
- [ ] Tester avec plusieurs vidéos TikTok

**Temps estimé**: 5-6h

---

### ✅ Étape 4.3 - Bot Telegram interactif (Backend)

**Description**:  
Créer un bot Telegram pour recevoir des messages/liens et vérifier automatiquement avec Vera.

**Livrables**:

- [ ] Créer le module `telegram-bot`:

```bash
pnpm nx g @nestjs/schematics:module telegram-bot --project=backend
pnpm nx g @nestjs/schematics:service telegram-bot --project=backend
```

- [ ] Installer les dépendances:

```bash
pnpm add telegraf
```

- [ ] Implémenter `TelegramBotService`:
  - **Écouter les messages** entrants
  - **Extraire** le texte, les médias (photos, vidéos)
  - **Détecter** les liens TikTok dans les messages
  - **Stocker** dans `contents` via `ContentsService`
  - **Vérifier automatiquement** avec `FactCheckService.autoVerify()`
  - **Répondre** à l'utilisateur avec le résultat de Vera
- [ ] **Commandes du bot**:
  - `/start`: message de bienvenue + présentation
  - `/verify <texte>`: vérifier une affirmation
  - `/help`: liste des commandes
  - Envoi d'un lien TikTok: extraction + vérification automatique
  - Envoi de texte libre: vérification directe
- [ ] Initialiser le bot au démarrage de l'app (dans `main.ts` ou module)
- [ ] Tester le bot en conditions réelles

**Temps estimé**: 6-7h

---

### ✅ Étape 4.4 - Vérification automatique avec Vera

**Description**:  
Automatiser complètement le flux d'extraction → vérification → stockage → réponse.

**Livrables**:

- [ ] Améliorer `FactCheckService.autoVerify(contentId)`:
  - Récupérer le contenu depuis la DB
  - Extraire le texte pertinent (description TikTok, message Telegram)
  - Appeler l'API Vera avec le texte
  - Stocker le résultat dans `fact_checks`
  - Mettre à jour `contents.verification_result` et `verified = true`
- [ ] **Flux TikTok**:
  - Extraction → Stockage → Auto-vérification → Affichage dans dashboard
- [ ] **Flux Telegram**:
  - Réception message → Extraction → Stockage → Auto-vérification → Réponse utilisateur
- [ ] Gérer les cas d'échec:
  - API Vera indisponible (retry + notification admin)
  - Rate limit dépassé (queue + throttling)
  - Erreur d'extraction (message utilisateur)
- [ ] Logger tous les événements (succès + échecs)

**Temps estimé**: 3-4h

---

### ✅ Étape 4.5 - Tests et validation complète des bots

**Description**:  
Valider le fonctionnement de bout en bout des deux bots.

**Livrables**:

- [ ] **Tests Bot TikTok**:
  - Extraire 5+ vidéos différentes
  - Vérifier les métadonnées complètes
  - Vérifier le stockage en DB
  - Vérifier la vérification automatique avec Vera
  - Vérifier l'affichage dans le dashboard
- [ ] **Tests Bot Telegram**:
  - Envoyer `/start`, `/help`, `/verify <texte>`
  - Envoyer un lien TikTok
  - Envoyer du texte libre
  - Vérifier les réponses du bot
  - Vérifier le stockage en DB
- [ ] **Tests de robustesse**:
  - Lien TikTok invalide
  - Vidéo TikTok supprimée/privée
  - API Vera indisponible (simuler)
  - Texte vide ou trop long
- [ ] Documenter le processus d'utilisation (README)
- [ ] Créer un REX si échecs/limitations

**Temps estimé**: 2-3h

---

## PHASE 5 - Tests & Déploiement

### 📌 Objectif

Finaliser le projet avec des tests complets et déployer en production.

---

### ✅ Étape 5.1 - Tests End-to-End (E2E)

**Description**:  
Tester l'application complète de bout en bout.

**Livrables**:

- [ ] Installer Cypress ou Playwright:

```bash
pnpm add -D cypress
```

- [ ] Créer des scénarios de test:
  - Connexion admin
  - Création d'un sondage
  - Vérification d'un fait
  - Visualisation des statistiques
  - Extraction TikTok + vérification
  - Utilisation du bot Telegram
- [ ] Lancer les tests E2E: `pnpm nx e2e frontend-e2e`
- [ ] Corriger les bugs identifiés
- [ ] Atteindre une couverture de 80%+ pour les flux critiques

**Temps estimé**: 4-5h

---

### ✅ Étape 5.2 - Tests de performance

**Description**:  
Vérifier que l'application est performante et optimisée.

**Livrables**:

- [ ] Tester avec Lighthouse (Google Chrome DevTools):
  - Performance
  - Accessibilité
  - SEO
  - Best Practices
- [ ] Viser des scores > 90 sur toutes les métriques
- [ ] Optimiser les images (compression, formats WebP)
- [ ] Activer le lazy loading pour les composants Angular
- [ ] Optimiser les requêtes API (pagination, cache)
- [ ] Tester la charge du backend (JMeter, k6)
- [ ] Corriger les problèmes identifiés

**Temps estimé**: 2-3h

---

### ✅ Étape 5.3 - Documentation complète

**Description**:  
Rédiger une documentation technique et utilisateur complète.

**Livrables**:

- [ ] Mettre à jour le `README.md`:
  - Description du projet
  - Installation
  - Configuration
  - Commandes disponibles
  - Architecture
- [ ] Créer un fichier `INSTALL.md` (guide d'installation détaillé)
- [ ] Créer un fichier `USER_GUIDE.md` (guide utilisateur):
  - Comment se connecter
  - Comment créer un sondage
  - Comment vérifier une information
  - Comment utiliser le bot Telegram
- [ ] Créer un fichier `API.md` (documentation API):
  - Tous les endpoints
  - Paramètres
  - Exemples de requêtes/réponses
  - (Ou utiliser Swagger)
- [ ] Documenter le code (JSDoc/TSDoc)
- [ ] Créer un `CHANGELOG.md` (historique des versions)

**Temps estimé**: 3-4h

---

### ✅ Étape 5.4 - Préparation au déploiement

**Description**:  
Configurer les environnements de production et préparer le déploiement.

**Livrables**:

- [ ] Choisir un hébergeur:
  - **Frontend**: Vercel, Netlify, ou VPS
  - **Backend**: Heroku, Railway, Render, ou VPS
- [ ] Créer les variables d'environnement de production:
  - URLs de production
  - Clés API de production
  - Secrets JWT (générés de manière sécurisée)
- [ ] Configurer les domaines:
  - `vera-factcheck.com` (exemple) pour le frontend
  - `api.vera-factcheck.com` (exemple) pour le backend
- [ ] Configurer HTTPS (certificats SSL)
- [ ] Configurer CORS pour les URLs de production
- [ ] Créer les scripts de déploiement:
  - `pnpm run deploy:frontend`
  - `pnpm run deploy:backend`
- [ ] Tester le déploiement en staging d'abord

**Temps estimé**: 3-4h

---

### ✅ Étape 5.5 - Déploiement Backend

**Description**:  
Déployer l'API NestJS en production.

**Livrables**:

- [ ] Build de production:

```bash
pnpm nx build backend --prod
```

- [ ] Créer un `Dockerfile` (si nécessaire):

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY dist/apps/backend .
RUN npm install --production
CMD ["node", "main.js"]
```

- [ ] Déployer sur l'hébergeur choisi
- [ ] Configurer les variables d'environnement
- [ ] Lancer les migrations de base de données
- [ ] Vérifier que l'API répond: `curl https://api.vera-factcheck.com/api/health`
- [ ] Configurer les logs (PM2, CloudWatch, etc.)
- [ ] Configurer les sauvegardes automatiques de la DB

**Temps estimé**: 2-3h

---

### ✅ Étape 5.6 - Déploiement Frontend

**Description**:  
Déployer l'application Angular en production.

**Livrables**:

- [ ] Build de production:

```bash
pnpm nx build frontend --prod
```

- [ ] Tester le build localement:

```bash
npx http-server dist/apps/frontend
```

- [ ] Déployer sur l'hébergeur choisi (Vercel recommandé)
- [ ] Configurer les variables d'environnement (URLs de prod)
- [ ] Vérifier que l'application fonctionne: `https://vera-factcheck.com`
- [ ] Configurer les redirections (toutes les routes vers `index.html`)
- [ ] Configurer le cache (service worker, PWA)
- [ ] Vérifier les performances avec Lighthouse

**Temps estimé**: 1-2h

---

### ✅ Étape 5.7 - Tests post-déploiement

**Description**:  
Valider que tout fonctionne correctement en production.

**Livrables**:

- [ ] Tester tous les flux utilisateur en production:
  - Connexion admin
  - Création d'un sondage
  - Vérification d'un fait
  - Utilisation du bot Telegram
  - Extraction TikTok
- [ ] Vérifier les logs (pas d'erreurs)
- [ ] Vérifier les performances (temps de réponse)
- [ ] Tester sur différents navigateurs (Chrome, Firefox, Safari, Edge)
- [ ] Tester sur mobile et tablette
- [ ] Tester l'accessibilité en production
- [ ] Corriger les bugs identifiés

**Temps estimé**: 2h

---

### ✅ Étape 5.8 - Monitoring et maintenance

**Description**:  
Mettre en place des outils de monitoring pour suivre la santé de l'application.

**Livrables**:

- [ ] Configurer un outil de monitoring:
  - **Backend**: Sentry, LogRocket, New Relic
  - **Frontend**: Google Analytics, Sentry
- [ ] Configurer les alertes:
  - Erreurs 500
  - API Vera indisponible
  - Taux d'erreur élevé
- [ ] Créer un dashboard de monitoring:
  - Nombre de requêtes
  - Temps de réponse moyen
  - Taux d'erreur
  - Utilisation des ressources
- [ ] Planifier les sauvegardes régulières de la DB
- [ ] Documenter les procédures de maintenance

**Temps estimé**: 2-3h

---

### ✅ Étape 5.9 - Présentation du projet

**Description**:  
Préparer une présentation pour démontrer le projet.

**Livrables**:

- [ ] Créer une présentation (slides):
  - Contexte et objectifs
  - Architecture technique
  - Fonctionnalités développées
  - Démonstration live
  - Difficultés rencontrées
  - Retour d'expérience
- [ ] Préparer une démo en live:
  - Parcours complet de l'application
  - Utilisation du bot Telegram
  - Extraction TikTok
  - Vérification avec Vera
- [ ] Créer une vidéo de démonstration (backup)
- [ ] Répéter la présentation

**Temps estimé**: 3-4h

---

## 📊 RÉCAPITULATIF DES PHASES

| Phase       | Description                                     | Temps estimé | Priorité    | Quand ?                           |
| ----------- | ----------------------------------------------- | ------------ | ----------- | --------------------------------- |
| **Phase 0** | Préparation & Organisation                      | ~5h          | 🔴 Critique | Semaine 1                         |
| **Phase 1** | Backend Fondations (Auth, DB, CORS)             | ~10h         | 🔴 Critique | Semaine 1                         |
| **Phase 2** | Backend Avancé (Fact-check, Sondages, Contents) | ~18h         | 🔴 Critique | Semaine 1-2                       |
| **Phase 3** | Frontend Vera Web (Landing + Dashboard Admin)   | ~50h         | 🟠 Haute    | Semaine 2-3 (après maquettes)     |
| **Phase 4** | Bots TikTok & Telegram + Vérification auto      | ~18h         | 🟡 Moyenne  | Semaine 3-4                       |
| **Phase 5** | Tests, Optimisation & Déploiement               | ~18h         | 🟠 Haute    | Semaine 4                         |
| **TOTAL**   |                                                 | **~119h**    |             | **4 semaines** (30h/sem pour 3+1) |

**Répartition optimale** (3 devs):

- **Dev 1** (Backend): Auth, Supabase, FactCheck, TelegramBot, Déploiement (~40h)
- **Dev 2** (Backend): Sondages Instagram (Backend complet), Contents, TikTokBot (~38h)
- **Dev 3** (Fullstack): Tout le frontend (Landing + Dashboard + 4 pages), Tests E2E (~41h)

**Ordre chronologique recommandé**:

1. ✅ **Phases 0-1-2 en priorité** (backend complet) → **~33h** → Objectif: backend fini avant réception maquettes
2. ⏳ **Attente maquettes** (en parallèle: Phase 4 - Bots)
3. 🎨 **Phase 3** (frontend complet avec les maquettes finales)
4. ✅ **Phase 5** (tests, optimisation, déploiement)

---

## 🎯 PROCHAINES ÉTAPES IMMÉDIATES

### Semaine 1 - Backend First 🚀

**Objectif**: Finir tout le backend avant de recevoir les maquettes

1. ✅ **Phase 0** - TERMINÉE
2. ✅ **Phase 1** - TERMINÉE
3. 🔄 **Phase 2 - EN COURS**:
   - Étape 2.1: Module Fact-Checking
   - Étape 2.2: Module Sondages Instagram (Backend complet)
   - Étape 2.3: Module Contenus TikTok/Telegram
   - Étape 2.4: Documentation Swagger
   - Étape 2.5: Tests unitaires Backend
4. ⏳ **Phase 4** (en parallèle si le backend est fini):
   - Bots TikTok et Telegram
   - Vérification automatique

### Semaine 2-3 - Frontend après réception maquettes 🎨

5. 🎨 **Phase 3** (dès réception des maquettes):
   - Landing Page Vera Web
   - Dashboard Admin complet
   - 4 pages (Stats, Sondages, Fact-check, Contenus)

### Semaine 4 - Finalisation 🏁

6. ✅ **Phase 5**:
   - Tests E2E, performance, accessibilité
   - Documentation complète
   - Déploiement production

---

## 📝 NOTES IMPORTANTES

- **Prioriser le backend d'abord**: Permet de travailler en parallèle pendant que les maquettes sont en cours
- **Tests**: Toujours tester avant de commit
