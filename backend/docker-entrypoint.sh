#!/usr/bin/env sh
set -e
if [ ! -f /var/www/html/.env ]; then
  cp /var/www/html/.env.example /var/www/html/.env
fi
php artisan key:generate --ansi
php artisan jwt:secret --force
php artisan config:clear
php artisan config:cache
php artisan migrate --force
exec "$@"
