# 🐳 Guide de Démarrage avec Docker sur Windows

Ce guide vous explique comment lancer l'application complète (Backend Symfony + Frontend Angular + PostgreSQL) en utilisant Docker Desktop sur Windows.

## 📋 Prérequis

1. **Docker Desktop pour Windows** installé et en cours d'exécution
   - Téléchargez-le ici : https://www.docker.com/products/docker-desktop/
   - Assurez-vous que Docker Desktop est bien démarré (icône dans la barre des tâches)

2. **WSL 2** (Windows Subsystem for Linux) recommandé
   - Ouvrez PowerShell en administrateur et exécutez :
     ```powershell
     wsl --install
     ```
   - Redémarrez votre PC si demandé

3. **Git pour Windows** (optionnel mais recommandé)
   - https://git-scm.com/download/win

## 🚀 Démarrage Rapide

### Étape 1 : Configurer les variables d'environnement

Copiez le fichier d'exemple et personnalisez-le si nécessaire :

```bash
cp .env.example .env
```

Ou manuellement dans PowerShell :
```powershell
Copy-Item .env.example .env
```

> ⚠️ **Important** : Modifiez les mots de passe dans `.env` pour la production !

### Étape 2 : Lancer l'application

Ouvrez un terminal (PowerShell, Git Bash ou WSL) à la racine du projet et exécutez :

```bash
docker-compose up --build
```

Ou en mode détaché (recommandé) :
```bash
docker-compose up -d --build
```

### Étape 3 : Accéder à l'application

Une fois les conteneurs démarrés (comptez 1-2 minutes pour le premier build) :

- **Frontend Angular** : http://localhost:4200
- **Backend API** : http://localhost:8000
- **Base de données** : localhost:5432

## 🔧 Commandes Utiles

| Commande | Description |
|----------|-------------|
| `docker-compose up -d` | Démarrer en arrière-plan |
| `docker-compose down` | Arrêter et supprimer les conteneurs |
| `docker-compose ps` | Voir l'état des conteneurs |
| `docker-compose logs -f` | Voir les logs en temps réel |
| `docker-compose logs -f backend` | Logs du backend uniquement |
| `docker-compose logs -f frontend` | Logs du frontend uniquement |
| `docker-compose restart` | Redémarrer les conteneurs |
| `docker-compose exec backend bash` | Ouvrir un shell dans le backend |
| `docker-compose exec frontend sh` | Ouvrir un shell dans le frontend |

## 🛠️ Résolution de Problèmes Courants

### Problème : Docker ne démarre pas
- Vérifiez que Docker Desktop est bien lancé
- Assurez-vous que la virtualisation est activée dans le BIOS
- Redémarrez Docker Desktop

### Problème : Port déjà utilisé
Si les ports 4200, 8000 ou 5432 sont déjà utilisés :
1. Arrêtez les autres applications utilisant ces ports
2. Ou modifiez les ports dans `docker-compose.yml`

### Problème : Erreur de permission sur Windows
Exécutez Docker Desktop en tant qu'administrateur ou utilisez WSL 2.

### Problème : Backend ne peut pas se connecter à la base de données
Attendez quelques secondes que PostgreSQL soit complètement démarré avant que Symfony ne tente la connexion. Le `depends_on` gère cela, mais un redémarrage peut être nécessaire :
```bash
docker-compose restart backend
```

### Problème : Clés JWT manquantes
Les clés JWT sont générées automatiquement au premier démarrage. Si elles manquent :
```bash
docker-compose exec backend php bin/console lexik:jwt:generate-keypair
docker-compose restart backend
```

## 📁 Structure des Volumes

- **db_data** : Données persistantes de PostgreSQL (ne sont pas supprimées lors du `down`)
- **backend** : Code source monté en volume pour le développement à chaud
- **frontend** : Code source monté en volume pour le développement à chaud
- **config/jwt** : Clés JWT persistantes

Pour tout réinitialiser (y compris la base de données) :
```bash
docker-compose down -v
```

## 🔐 Sécurité

- Les cookies sont configurés en **HTTP-Only** et **Secure** (en production HTTPS requise)
- Les tokens JWT sont stockés dans des cookies, pas dans le localStorage
- Refresh token automatique toutes les 15 minutes
- Changez les mots de passe dans `.env` avant toute mise en production !

## 📝 Prochaines Étapes

1. Accédez à http://localhost:4200
2. Créez un compte via le formulaire d'inscription
3. Connectez-vous et testez les fonctionnalités
4. Consultez la documentation API sur http://localhost:8000/api

---

**Besoin d'aide ?** Consultez les logs avec `docker-compose logs -f` pour diagnostiquer les problèmes.
