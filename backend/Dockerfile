# Dockerfile pour le Backend Symfony (PHP 8.3)
FROM php:8.3-cli

# Définir le répertoire de travail
WORKDIR /var/www/html

# Installer les dépendances système et extensions PHP nécessaires
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    unzip \
    postgresql-client \
    && docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd zip intl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Exposer le port 8000 pour le serveur intégré PHP
EXPOSE 8000

# Commande par défaut (sera surchargée par docker-compose)
CMD ["php", "-d", "memory_limit=512M", "-d", "max_execution_time=300", "bin/console", "server:run", "0.0.0.0:8000"]
