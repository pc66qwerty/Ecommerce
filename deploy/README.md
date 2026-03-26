# Deploy en Oracle Cloud

## Primera vez (setup inicial en el servidor)

```bash
# 1. Clonar o subir el proyecto
sudo mkdir -p /var/www
cd /var/www
git clone TU_REPO_URL .
# O subir con scp desde tu PC:
# scp -r ./backend ubuntu@TU_IP:/var/www/backend
# scp -r ./frontend ubuntu@TU_IP:/var/www/frontend

# 2. Crear .env del backend
cp /var/www/backend/.env.production.example /var/www/backend/.env
nano /var/www/backend/.env   # editar con los datos reales

# 3. Crear .env.local del frontend
nano /var/www/frontend/.env.local
# Contenido:
# NEXT_PUBLIC_API_URL=http://TU_IP/api
# NEXT_PUBLIC_WHATSAPP_NUMBER=50254922665

# 4. Copiar config de Nginx
sudo cp /var/www/deploy/nginx.conf /etc/nginx/sites-available/mian
# Editar TU_IP_O_DOMINIO en el archivo
sudo nano /etc/nginx/sites-available/mian
sudo ln -s /etc/nginx/sites-available/mian /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 5. Correr deploy
bash /var/www/deploy/deploy.sh
```

## Actualizaciones futuras

```bash
cd /var/www
git pull
bash /var/www/deploy/deploy.sh
```

## SSL gratuito (después de tener dominio)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```
