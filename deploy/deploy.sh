#!/bin/bash
# Script de deploy para el servidor Oracle Cloud
# Corre esto en el servidor: bash deploy.sh

set -e

echo "=== DEPLOY MIAN STORE ==="

# ── BACKEND ──────────────────────────────────────────────────
echo "[1/5] Configurando Laravel..."
cd /var/www/backend

composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

sudo chown -R www-data:www-data /var/www/backend/storage /var/www/backend/bootstrap/cache
sudo chmod -R 775 /var/www/backend/storage /var/www/backend/bootstrap/cache

echo "[2/5] Laravel OK"

# ── FRONTEND ─────────────────────────────────────────────────
echo "[3/5] Construyendo Next.js..."
cd /var/www/frontend

npm ci
npm run build

echo "[4/5] Next.js OK"

# ── PM2 ──────────────────────────────────────────────────────
echo "[5/5] Reiniciando servicios..."
pm2 delete mian-frontend 2>/dev/null || true
pm2 start npm --name "mian-frontend" -- start
pm2 save
pm2 startup | tail -1 | sudo bash

sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "=== DEPLOY COMPLETADO ==="
echo "App corriendo en http://$(curl -s ifconfig.me)"
