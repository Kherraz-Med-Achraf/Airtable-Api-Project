# Portfolio Web Ingénierie

Ce projet a été réalisé dans le cadre de l'exercice ESGI 5IW3.  
Il s'agit d'un **portfolio web** pour présenter les projets étudiants de la filière Ingénierie Web, avec :

- **Front public** (Vue 3 + Vite)  
    - Liste des projets publiés  
    - Détail d'un projet  
    - Bouton "like"  
    - Recherche par mot-clé (à implémenter)  
- **Front admin** (Vue 3)  
    - Authentification (email / mot de passe)  
    - Liste complète des projets (publiés & non-publiés)  
    - Création / suppression de projet  
    - (Dé)publication en un clic  
- **Back-end** (Node.js / Express)  
    - Stockage dans Airtable (tables Projects, Users, Étudiants, Technologies)  
    - Auth JWT (+ bcrypt pour le hash des mots de passe)  
    - Routes publiques et protégées  

---

## 🛠 Stack technique

- **Frontend** : Vue 3, Vite, SCSS  
- **Backend** : Node.js, Express, Airtable SDK, bcryptjs, jsonwebtoken  
- **DB** : Airtable  
- **Auth** : JWT (1 h), mots de passe hashés (bcryptjs)  
- **Containerisation** : Docker & docker-compose  

---

## 🚀 Démarrage

1. **Cloner le dépôt**  
     ```bash
     git clone https://github.com/ton-org/portfolio-web-ingenierie.git
     cd portfolio-web-ingenierie
     ```

2. **.env déjà présent**  
     Le fichier `backend/.env` est versionné :

     ```ini
     AIRTABLE_API_KEY=ta_cle_api_airtable
     AIRTABLE_BASE_ID=ta_base_id_airtable
     JWT_SECRET=ton_secret_jwt
     ```

3. **Lancer tous les services**  
     ```bash
     docker-compose up --build
     ```

4. **Accéder à l'application**  
     - Front public : http://localhost:5173
     - Back-admin (via l'icône compte) : http://localhost:5173 → /login
     - Email / mot de passe définis dans la table Users d'Airtable
    > ℹ️ **Pour tester rapidement :**
    > - **Email** : `admin@gg.fr`
    > - **Mot de passe** : `AirtableEsgi`
    > *(Ce couple est déjà présent dans la table Users d'Airtable pour vos essais.)*

---

## 📋 Endpoints

### Public
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/projects` | Liste des projets publiés |
| GET | `/projects/:id` | Détail d'un projet |
| POST | `/projects/:id/like` | Ajouter un like |

### Auth
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/auth/login` | Retourne un JWT (1 h) |

### Admin (JWT ↔ Authorization: Bearer \<token\>)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/admin/projects` | Liste tous les projets |
| POST | `/admin/projects` | Créer un projet (envoi d'une URL image) |
| PATCH | `/admin/projects/:id/publish` | (Dé)publier un projet |
| DELETE | `/admin/projects/:id` | Supprimer un projet |

---

## ⚙️ Commandes Docker utiles

**Démarrer (attaché) :**
```bash
docker-compose up --build
```

**Démarrer (détaché) :**
```bash
docker-compose up -d --build
```

**Arrêter et supprimer :**
```bash
docker-compose down
```

© 2025 – Projet étudiant ESGI 5IW3