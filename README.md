# Application Full-Stack Sécurisée - Symfony 7.4 + Angular 22

Application web moderne avec authentification par **cookies HTTP-Only** pour une sécurité maximale contre les attaques XSS.

## 🏗️ Architecture

- **Backend** : Symfony 7.4 + API Platform 4 + LexikJWTAuthenticationBundle
- **Frontend** : Angular 22 (standalone components)
- **Sécurité** : Cookies HTTP-Only, SameSite=Lax, Secure en production
- **CI/CD** : GitHub Actions pour tests automatisés

## 🚀 Démarrage Rapide

### Prérequis
- PHP 8.3+
- Node.js 20+
- Composer
- PostgreSQL ou MySQL

### Backend (Symfony)

```bash
cd backend
composer install
cp .env .env.local
# Modifier DATABASE_URL et JWT_SECRET_KEY dans .env.local
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console lexik:jwt:generate-keypair
symfony server:start
```

### Frontend (Angular)

```bash
cd frontend
npm install
ng serve
```

## 🔐 Flux d'Authentification

1. Login → POST `/api/login` avec credentials
2. Backend génère JWT et le place dans cookie HTTP-Only
3. Toutes les requêtes suivantes incluent automatiquement le cookie
4. Logout → Invalidation du cookie

## 📁 Structure du Projet

```
/
├── backend/          # API Symfony
├── frontend/         # Application Angular
├── .github/workflows/ # CI/CD GitHub Actions
└── README.md
```

## 🛡️ Sécurité

- ✅ Tokens JWT dans cookies HTTP-Only (inaccessibles via JavaScript)
- ✅ Protection CSRF avec SameSite=Lax
- ✅ HTTPS requis en production (cookie Secure)
- ✅ CORS configuré strictement
- ✅ Validation des entrées côté serveur

## 🧪 Tests

```bash
# Backend
cd backend
php bin/phpunit

# Frontend
cd frontend
npm test
```

## 📄 Licence

MIT