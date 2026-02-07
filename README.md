# Bidaya

## 1) Architecture

- **Frontend** : HTML/CSS/JavaScript simple, communication via `fetch`.
- **Backend** : API REST sécurisée (Express + JWT + bcrypt).
- **Base de données** : SQLite (schéma fourni dans `schema.sql`).
- **Sécurité** : JWT, hashage bcrypt, contrôle des rôles (`ADMIN`, `STUDENT`).
- **Paiements** : passerelle configurable avec URL sécurisée côté serveur (callback backend).

## 2) Structure des fichiers

```
/ (racine)
├── backend/
│   ├── package.json
│   └── src/
│       ├── db.js
│       ├── server.js
│       ├── middleware/
│       │   └── auth.js
│       └── routes/
│           ├── admin.js
│           ├── auth.js
│           ├── payments.js
│           ├── public.js
│           └── student.js
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── courses.html
│   ├── admin.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── admin.js
│       └── student.js
├── schema.sql
└── README.md
```

## 3) Backend API (implémentation complète)

### Installation

```bash
cd backend
npm install
npm start
```

Le serveur démarre sur `http://localhost:4000`.

### Variables d’environnement

Créez un fichier `.env` dans `backend/` si besoin :

```
PORT=4000
JWT_SECRET=super-secret
PAYMENT_PROVIDER_URL=https://pay.local
DB_PATH=./data.sqlite
```

### Documentation des routes API

#### Auth
- `POST /api/auth/register` : inscription étudiant.
- `POST /api/auth/register-admin` : création admin (nécessite JWT admin).
- `POST /api/auth/login` : connexion.

#### Public
- `GET /api/courses` : liste des cours.

#### Admin (JWT + rôle ADMIN)
- `POST /api/admin/courses`
- `PUT /api/admin/courses/:id`
- `DELETE /api/admin/courses/:id`
- `POST /api/admin/courses/:id/levels`
- `POST /api/admin/levels/:id/contents`
- `POST /api/admin/levels/:id/quizzes`
- `POST /api/admin/quizzes/:id/questions`
- `GET /api/admin/students`
- `GET /api/admin/students/:id/progress`
- `GET /api/admin/payments`

#### Étudiant (JWT + rôle STUDENT)
- `GET /api/student/courses`
- `GET /api/student/courses/:id/levels` (inclut le champ `unlocked` par niveau)
- `GET /api/student/levels/:id/contents`
- `GET /api/student/quizzes/:id`
- `POST /api/student/quizzes/:id/submit`
- `GET /api/student/progress`
- `POST /api/student/progress`

#### Paiements
- `POST /api/payments/initiate` : crée un paiement et renvoie une URL sécurisée.
- `POST /api/payments/callback` : callback serveur pour confirmer le paiement.
- `GET /api/payments/history` : historique des paiements étudiant.

### Exemples de requêtes (fetch)

```js
// Login
fetch("http://localhost:4000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "a@b.com", password: "secret" })
});
```

```js
// Créer un cours (ADMIN)
fetch("http://localhost:4000/api/admin/courses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "Bidaya Débutant",
    description: "Comprendre les bases",
    isPaid: true,
    price: 59
  })
});
```

```js
// Initier un paiement (STUDENT)
fetch("http://localhost:4000/api/payments/initiate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ courseId: 1, currency: "GNF" })
});
```

## 4) Frontend HTML/CSS/JS

### Utilisation

Ouvrez `frontend/index.html` dans un navigateur. Les pages principales :
- `index.html` : login/inscription
- `dashboard.html` : tableau de bord étudiant
- `courses.html` : liste des cours
- `admin.html` : espace administrateur

### Notes sécurité

Toute la logique sensible (auth, paiement, accès aux cours payants) est gérée côté serveur.
Les niveaux sont verrouillés automatiquement si le quiz du niveau précédent n'est pas validé.
Le tableau de bord étudiant affiche l'historique des résultats de quiz.
Le tableau de bord admin permet de consulter la progression et les résultats par étudiant.

## 5) Base de données

Le schéma complet est dans `schema.sql`.

## 6) Instructions de test local

1. Lancer le backend :
   ```bash
   cd backend
   npm install
   npm start
   ```
2. Ouvrir `frontend/index.html` dans un navigateur.

## 7) Pistes d’évolution

- Ajout d’e-mails transactionnels.
- Stockage de contenus sur un CDN.
- Reporting avancé côté admin.
