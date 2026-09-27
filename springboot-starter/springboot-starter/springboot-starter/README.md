# Starter Spring Boot pédagogique

API REST conçue pour apprendre rapidement Java 21, Spring Boot 4.1, les couches, SOLID, la validation, les exceptions, JPA et les tests.

## Parcours conseillé

Lisez un appel dans cet ordre :

```text
HTTP
  -> controller/TaskController
  -> service/TaskService (contrat)
  -> service/TaskServiceImpl (cas d'utilisation + transaction)
  -> repository/TaskRepository
  -> H2
```

Puis suivez le retour : `Task -> TaskMapper -> TaskResponse -> JSON`.

## Rôle de chaque package

```text
config/      configuration technique, ici l'audit JPA
controller/  endpoints HTTP, validation et codes de statut
domain/      entités et invariants métier
dto/         contrats JSON d'entrée et de sortie
exception/   exceptions métier, format ApiError et handler global
mapper/      conversions entre domaine et DTO
repository/  accès aux données avec Spring Data JPA
service/     interfaces des cas d'utilisation et implémentations
```

Chaque package contient au moins une classe commentée qui sert d'exemple.

## SOLID visible dans le code

- **S — responsabilité unique** : contrôleur, mapper, service et repository ont chacun un seul rôle.
- **O — ouvert/fermé** : une autre implémentation de `TaskService` peut être ajoutée sans changer le contrôleur.
- **L — substitution de Liskov** : toute implémentation respectant `TaskService` peut remplacer l'actuelle.
- **I — ségrégation des interfaces** : `TaskService` expose uniquement les opérations utiles au contrôleur.
- **D — inversion des dépendances** : `TaskController` dépend de `TaskService`, pas de `TaskServiceImpl`.

## Gestion des erreurs

`ResourceNotFoundException` reste indépendante de HTTP. `GlobalExceptionHandler` la transforme en réponse uniforme :

```json
{
  "timestamp": "2026-07-30T10:00:00Z",
  "status": 404,
  "code": "RESOURCE_NOT_FOUND",
  "message": "Tâche 99 introuvable",
  "path": "/api/tasks/99",
  "validationErrors": {}
}
```

Les erreurs de validation utilisent `code: VALIDATION_ERROR` et détaillent les champs dans `validationErrors`. Les exceptions inattendues sont journalisées côté serveur, sans exposer leur stack trace.

## Prérequis

- JDK 21+
- Maven 3.9+

## Démarrer

```bash
mvn spring-boot:run
```

API : `http://localhost:8080/api/tasks` — console H2 : `http://localhost:8080/h2-console` (URL JDBC `jdbc:h2:mem:starter`, utilisateur `sa`, mot de passe vide).

## Exemples

```bash
curl -X POST http://localhost:8080/api/tasks -H "Content-Type: application/json" -d '{"title":"Première tâche","completed":false}'
curl http://localhost:8080/api/tasks
```

Routes : `GET /api/tasks`, `GET /api/tasks/{id}`, `POST`, `PUT /api/tasks/{id}`, `DELETE /api/tasks/{id}`.

## Tester et produire le JAR

```bash
mvn test
mvn clean package
java -jar target/springboot-starter-0.0.1-SNAPSHOT.jar
```

`TaskServiceImplTest` est un test unitaire avec Mockito : il ne démarre ni Spring ni une base. `StarterApplicationTests` vérifie l'assemblage du contexte.

## Bonnes pratiques à conserver

- injection par constructeur, jamais par champ ;
- entités JPA non exposées par l'API ;
- transactions dans les services ;
- validation à la frontière et invariants dans le domaine ;
- aucune stack trace renvoyée au client ;
- `open-in-view: false` pour éviter les accès implicites à la base depuis le contrôleur.

Pour la production, remplacez H2 par PostgreSQL, utilisez Flyway/Liquibase, ajoutez Spring Security et placez les secrets dans des variables d'environnement.

## Exercices étudiants

1. Ajouter une priorité à `Task` de la migration jusqu'à l'écran.
2. Ajouter une recherche par statut sans mettre de logique dans le contrôleur.
3. Écrire le test du cas `ResourceNotFoundException`.
4. Ajouter un test `MockMvc` qui vérifie le format `ApiError`.
