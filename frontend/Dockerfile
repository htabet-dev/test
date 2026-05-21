# Dockerfile pour le Frontend Angular (Node 20)
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier package.json et package-lock.json pour optimiser le cache
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Exposer le port 4200 pour Angular
EXPOSE 4200

# Commande par défaut (sera surchargée par docker-compose pour le dev)
CMD ["ng", "serve", "--host", "0.0.0.0"]
