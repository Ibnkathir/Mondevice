# Bidaya – Plateforme de cours en ligne

Bidaya est une plateforme e-learning moderne avec un backend API REST sécurisé et un frontend responsive pour les espaces Admin et Étudiant.

## Structure du projet

```
backend/   # API REST (JWT, rôles, paiements LengoPay)
frontend/  # Interface web moderne et responsive
```

## Backend

### Prérequis
- Node.js 18+
- SQLite (par défaut via Sequelize)

### Démarrage rapide
```bash
cd backend
npm install
npm run dev
```

L’API démarre sur `http://localhost:4000`.

### Fonctionnalités principales
- Authentification JWT (ADMIN/ETUDIANT)
- Gestion des cours, niveaux, contenus, quiz et résultats
- Suivi des étudiants et progression
- Intégration LengoPay (génération d’URL, vérification, gestion d’erreurs)

## Frontend

### Démarrage rapide
```bash
cd frontend
python -m http.server 5173
```

Ouvrez `http://localhost:5173`.

### Vues disponibles
- Tableau de bord Administrateur
- Tableau de bord Étudiant

## Notes
- Le backend expose une API REST prête à être connectée à un client moderne.
- L’intégration LengoPay est centralisée dans `backend/src/services/lengoPayService.js`.
