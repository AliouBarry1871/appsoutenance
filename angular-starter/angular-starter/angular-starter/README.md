# Starter Angular pédagogique

Application Angular 22 pour apprendre une architecture frontend maintenable : composants standalone, organisation par fonctionnalité, lazy loading, `OnPush`, signals, injection, HTTP et erreurs centralisées.

## Prérequis

- Node.js compatible avec Angular 22 (consultez la matrice officielle Angular)
- npm récent

## Installer et démarrer

```bash
npm install
npm start
```

Ouvrez `http://localhost:4200`. Le proxy redirige `/api` vers `http://localhost:8080`; la page **Tâches** fonctionne directement avec le projet voisin `springboot-starter`.

## Commandes

```bash
npm start
npm run build
npm test
```

`ErrorNotificationService` possède un test unitaire simple, sans `TestBed`, pour montrer qu'il faut éviter de démarrer un environnement plus lourd lorsque la classe peut être testée directement.
Les fichiers de test sont compilés avec `tsconfig.spec.json` et exécutés par Vitest dans `jsdom`.

## Structure

```text
app.config.ts                   composition root et providers
app.routes.ts                   routes chargées à la demande
core/config/                    InjectionToken de configuration
core/errors/                    contrat ApiError et état global d'erreur
core/interceptors/              traitement transversal des erreurs HTTP
shared/components/              composants visuels réutilisables
features/home/pages/            page d'accueil
features/tasks/models/          modèle frontend immuable
features/tasks/data-access/     seul accès HTTP de la fonctionnalité
features/tasks/pages/           container et état de la page
```

Chaque dossier contient un exemple commenté. Le flux principal est :

```text
TaskListPage -> TaskApiService -> HttpClient
             -> apiErrorInterceptor -> ErrorNotificationService
             -> ErrorBanner
```

## Principes appliqués

- **SRP** : la page orchestre, le service charge, l'interceptor traite les erreurs et le banner affiche.
- **DIP** : `TaskApiService` dépend de l'`InjectionToken API_URL`, pas d'une URL écrite en dur.
- **OCP** : un nouvel interceptor ou une nouvelle implémentation de configuration s'ajoute dans `app.config.ts`.
- modèles et contrats immuables avec `readonly` ;
- composants `OnPush` et état local avec signals ;
- aucun `subscribe` dans un service data-access ;
- aucune erreur technique affichée directement à l'utilisateur ;
- lazy loading pour ne pas charger toutes les fonctionnalités au démarrage.

Adaptez l'URL d'API pour la production via votre reverse proxy ou une configuration runtime. Ajoutez authentification, gestion d'état et bibliothèque UI selon les besoins du produit.

## Exercices étudiants

1. Ajouter un formulaire de création avec Reactive Forms.
2. Extraire un composant de présentation `TaskItem`.
3. Ajouter un interceptor d'authentification sans modifier `TaskApiService`.
4. Tester `TaskApiService` avec le backend HTTP de test Angular.
5. Afficher `validationErrors` renvoyé par Spring dans le formulaire.
