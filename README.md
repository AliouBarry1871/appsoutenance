# 🏠 SamaKeur - Plateforme Immobilière Certifiée au Sénégal
> **Projet de Fin de Cycle / Soutenance**  
> **Auteur :** Mamadou Aliou Barry ([@AliouBarry1871](https://github.com/AliouBarry1871))

---

## 📌 Présentation du Projet

**SamaKeur** est une application web moderne dédiée à la gestion, la recherche et la mise en relation immobilière au Sénégal. Elle connecte directement les clients (locataires, acheteurs) avec des agences immobilières certifiées à travers tout le Sénégal (Dakar, Thiès, Saly, Saint-Louis, etc.), tout en offrant un guidage géographique précis et une sécurité applicative de haut niveau.

---

## 🏗️ Architecture & Technologies Utilisées

Le projet repose sur une **architecture découplée Client-Serveur (RESTful)** :

### 🌐 Frontend (Client)
* **Framework :** [Angular](https://angular.dev/) (Standalone Components, modern reactive architecture)
* **Langage :** TypeScript
* **Style & UI :** [Tailwind CSS v4](https://tailwindcss.com/) & PostCSS (Responsive, Mobile-first)
* **Flux réactifs :** RxJS (Observables, State Management)
* **Cartographie & Services Tiers :**
  * Google Maps Embed API & Calcul d'Itinéraire GPS pas-à-pas
  * Intégration WhatsApp Business Click-to-Chat pour contact direct instantané

### ⚙️ Backend (API REST)
* **Framework :** [Spring Boot 3](https://spring.io/projects/spring-boot) (v3.2.5)
* **Langage :** Java 21 (LTS)
* **Sécurité & Authentification :** Spring Security 6 & JWT (JSON Web Token - JJWT 0.11.5)
  * Authentification sans état (*Stateless*)
  * Chiffrement des mots de passe avec **BCrypt**
  * Contrôle d'accès basé sur les rôles (**RBAC** : `ROLE_ADMIN`, `ROLE_AGENCY`, `ROLE_CLIENT`)
* **Persistance & Données :** Spring Data JPA & Hibernate ORM
* **Base de Données :** MySQL 8 (`samakeur_db`)
* **Notifications :** Spring Boot Starter Mail (JavaMailSender via SMTP Gmail)
* **Productivité :** Project Lombok

---

## 📂 Structure du Répertoire

```text
appsoutenance/
├── angular-starter/        # Code source du Frontend Angular (Standalone)
├── springboot-starter/     # Code source du Backend Spring Boot 3 API REST
├── captures_securite/      # Captures d'écran des tests de sécurité terminal IntelliJ
├── .gitignore              # Fichiers et dossiers exclus du versionnement
└── README.md               # Documentation générale du projet
```

---

## 🚀 Installation & Démarrage

### 1. Prérequis
* **Node.js** (v18+) et **npm**
* **Java Development Kit (JDK 21)**
* **Maven** (3.8+)
* **MySQL Server** (8.0+)

### 2. Configuration de la Base de Données
Créez la base de données MySQL :
```sql
CREATE DATABASE samakeur_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Lancement du Backend (Spring Boot)
Naviguez dans le dossier du backend et lancez l'application :
```bash
cd springboot-starter/springboot-starter/springboot-starter
mvn spring-boot:run
```
L'API REST démarre sur : `http://localhost:8080`

### 4. Lancement du Frontend (Angular)
Naviguez dans le dossier du frontend, installez les dépendances et démarrez le serveur :
```bash
cd angular-starter/angular-starter/angular-starter
npm install
npm start
```
L'application client est accessible sur : `http://localhost:4000` (ou `http://localhost:4200`)

---

## 🛡️ Tests de Sécurité & Validation

Des tests exhaustifs ont été réalisés sur le terminal IntelliJ pour valider la robustesse de la couche sécurité :
1. **Accès Public sans Token (200 OK) :** `GET /api/properties`
2. **Protection contre l'Accès Anonyme (401 Unauthorized) :** `GET /api/admin/agencies`
3. **Rejet de Jeton Falsifié (401 Unauthorized) :** Validation cryptographique HMAC-SHA256
4. **Authentification & Génération JWT (200 OK) :** `POST /api/auth/login`
5. **Contrôle d'Accès RBAC (403 Forbidden) :** Bloque un client tentant d'accéder aux routes d'administration
6. **Accès Autorisé Administrateur (200 OK) :** `GET /api/admin/agencies` avec token `ROLE_ADMIN`
7. **Protection contre Mauvais Identifiants (401 Bad Credentials)**

*Les captures d'écran illustrant ces tests sont consultables dans le dossier `captures_securite/`.*

---

## 👨‍💻 Auteur
* **Mamadou Aliou Barry** - Développeur Fullstack ([GitHub](https://github.com/AliouBarry1871))
