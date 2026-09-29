#!/usr/bin/env bash
# ==============================================================================
# DragonBound / GunBound Auto-Installer & Setup Script
# Designed for Ubuntu 20.04/22.04/24.04 and Debian 11/12
# ==============================================================================

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}${BOLD}"
echo "  ____                                ____                             _ "
echo " |  _ \  _ __  __ _   __ _   ___   _ | __ )   ___   _   _  _ __    __| |"
echo " | | | || '__|/ _\` | / _\` | / _ \ | ||  _ \  / _ \ | | | || '_ \  / _\` |"
echo " | |_| || |  | (_| || (_| || (_) || || |_) || (_) || |_| || | | || (_| |"
echo " |____/ |_|   \__,_| \__, | \___/ |_||____/  \___/  \__,_||_| |_| \__,_|"
echo "                     |___/                                               "
echo -e "${NC}"
echo -e "${BOLD}Instalador Automático para DragonBound / GunBound Monorepo${NC}"
echo -e "${CYAN}===================================================================${NC}"
echo ""

# 1. Check Root Privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Este script debe ejecutarse como root (usa sudo bash install.sh)${NC}"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${GREEN}[INFO] Directorio del proyecto detectado: ${PROJECT_DIR}${NC}"
echo ""

# 2. Interactive Prompts
echo -e "${YELLOW}${BOLD}--- [1/6] Configuración de Dominios y SSL ---${NC}"
read -rp "Ingresa el dominio principal del juego (ej: gunbound.tudominio.com o tudominio.com): " GAME_DOMAIN
while [ -z "$GAME_DOMAIN" ]; do
  echo -e "${RED}El dominio principal no puede estar vacío.${NC}"
  read -rp "Ingresa el dominio principal del juego: " GAME_DOMAIN
done

DEFAULT_ADMIN_DOMAIN="admin.${GAME_DOMAIN}"
read -rp "Ingresa el dominio del Panel Administrativo [Por defecto: ${DEFAULT_ADMIN_DOMAIN}]: " ADMIN_DOMAIN
ADMIN_DOMAIN="${ADMIN_DOMAIN:-$DEFAULT_ADMIN_DOMAIN}"

read -rp "¿Deseas instalar certificados SSL gratuitos (HTTPS / WSS) con Let's Encrypt? (s/n) [s]: " WANT_SSL
WANT_SSL="${WANT_SSL:-s}"

SSL_EMAIL=""
if [[ "$WANT_SSL" =~ ^[sSyY]$ ]]; then
  read -rp "Ingresa tu correo para las notificaciones del certificado SSL: " SSL_EMAIL
  while [ -z "$SSL_EMAIL" ]; do
    echo -e "${RED}El correo es requerido para registrar el certificado Let's Encrypt.${NC}"
    read -rp "Ingresa tu correo para el certificado SSL: " SSL_EMAIL
  done
fi

echo ""
echo -e "${YELLOW}${BOLD}--- [2/6] Configuración de Base de Datos ---${NC}"
DEFAULT_DB_PASS=$(openssl rand -hex 16)
read -rp "Ingresa la contraseña para el usuario 'dragonbound' de MySQL [Enter para auto-generar]: " DB_PASS
DB_PASS="${DB_PASS:-$DEFAULT_DB_PASS}"

echo ""
echo -e "${CYAN}===================================================================${NC}"
echo -e "${BOLD}Resumen de Configuración:${NC}"
echo -e " - Dominio del Juego:   ${GREEN}${GAME_DOMAIN}${NC}"
echo -e " - Dominio del Admin:   ${GREEN}${ADMIN_DOMAIN}${NC}"
echo -e " - Certificados SSL:    ${GREEN}$([[ "$WANT_SSL" =~ ^[sSyY]$ ]] && echo "Activado ($SSL_EMAIL)" || echo "Desactivado")${NC}"
echo -e " - Base de datos:       ${GREEN}dragonbound (Usuario: dragonbound)${NC}"
echo -e "${CYAN}===================================================================${NC}"
echo ""
read -rp "¿Deseas continuar con la instalación? (s/n) [s]: " CONFIRM
CONFIRM="${CONFIRM:-s}"
if [[ ! "$CONFIRM" =~ ^[sSyY]$ ]]; then
  echo -e "${RED}Instalación cancelada por el usuario.${NC}"
  exit 0
fi

# 3. System Dependencies
echo ""
echo -e "${YELLOW}${BOLD}--- [3/6] Instalando dependencias del sistema ---${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl wget git openssl build-essential nginx mariadb-server mariadb-client

# Check or install Node.js (Require Node 20 LTS)
NODE_INSTALLED=false
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
  if [ "$NODE_MAJOR" -ge 18 ]; then
    NODE_INSTALLED=true
    echo -e "${GREEN}[OK] Node.js detectado (versión $(node -v))${NC}"
  fi
fi

if [ "$NODE_INSTALLED" = false ]; then
  echo -e "${BLUE}[INFO] Instalando Node.js v20 LTS...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Install PM2 globally
if ! command -v pm2 >/dev/null 2>&1; then
  echo -e "${BLUE}[INFO] Instalando PM2 globalmente...${NC}"
  npm install -g pm2
fi

# Install Certbot if SSL is required
if [[ "$WANT_SSL" =~ ^[sSyY]$ ]]; then
  echo -e "${BLUE}[INFO] Instalando Certbot para Nginx...${NC}"
  apt-get install -y certbot python3-certbot-nginx
fi

# 4. MariaDB Database Setup
echo ""
echo -e "${YELLOW}${BOLD}--- [4/6] Configurando Base de Datos MariaDB ---${NC}"
systemctl enable mariadb
systemctl start mariadb

echo -e "${BLUE}[INFO] Creando base de datos y usuario dedicado...${NC}"
mariadb -u root <<EOF
CREATE DATABASE IF NOT EXISTS dragonbound CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'dragonbound'@'localhost' IDENTIFIED BY '${DB_PASS}';
CREATE USER IF NOT EXISTS 'dragonbound'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
ALTER USER 'dragonbound'@'localhost' IDENTIFIED BY '${DB_PASS}';
ALTER USER 'dragonbound'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON dragonbound.* TO 'dragonbound'@'localhost';
GRANT ALL PRIVILEGES ON dragonbound.* TO 'dragonbound'@'127.0.0.1';
FLUSH PRIVILEGES;
EOF

# Import SQL Dump if tables don't exist yet
TABLES_COUNT=$(mariadb -u root -N -s -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='dragonbound';")
if [ "$TABLES_COUNT" -eq 0 ]; then
  echo -e "${BLUE}[INFO] Importando base de datos inicial desde database/dragonbound.sql...${NC}"
  mariadb -u root dragonbound < "${PROJECT_DIR}/database/dragonbound.sql"
  echo -e "${GREEN}[OK] Base de datos importada exitosamente.${NC}"
else
  echo -e "${GREEN}[OK] La base de datos ya contiene ${TABLES_COUNT} tablas. Se mantiene la información existente.${NC}"
fi

# 5. Environment Files and NPM Packages
echo ""
echo -e "${YELLOW}${BOLD}--- [5/6] Configurando variables de entorno y paquetes NPM ---${NC}"
COOKIE_SECRET=$(openssl rand -hex 24)
SESSION_SECRET=$(openssl rand -hex 24)
ADMIN_SESSION_SECRET=$(openssl rand -hex 24)

# Create Root .env
cat > "${PROJECT_DIR}/.env" <<EOF
WEB_PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=dragonbound
DB_PASSWORD=${DB_PASS}
DB_DATABASE=dragonbound
COOKIE_SECRET=${COOKIE_SECRET}
SESSION_SECRET=${SESSION_SECRET}
vps=1
EOF
chmod 600 "${PROJECT_DIR}/.env"

# Create Admin .env
cat > "${PROJECT_DIR}/admin/.env" <<EOF
PORT=3100
NODE_ENV=production
SESSION_SECRET=${ADMIN_SESSION_SECRET}
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=dragonbound
DB_PASS=${DB_PASS}
DB_NAME=dragonbound
EOF
chmod 600 "${PROJECT_DIR}/admin/.env"

echo -e "${BLUE}[INFO] Instalando dependencias de Node.js en el proyecto principal...${NC}"
cd "${PROJECT_DIR}"
npm install --silent

echo -e "${BLUE}[INFO] Instalando dependencias de Node.js en el panel administrativo...${NC}"
cd "${PROJECT_DIR}/admin"
npm install --silent
cd "${PROJECT_DIR}"

# 6. Nginx & SSL Configuration
echo ""
echo -e "${YELLOW}${BOLD}--- [6/6] Configurando Servidor Web Nginx y PM2 ---${NC}"

# Generate Game Nginx config
GAME_CONF="/etc/nginx/sites-available/${GAME_DOMAIN}"
sed "s/{{GAME_DOMAIN}}/${GAME_DOMAIN}/g" "${PROJECT_DIR}/nginx/templates/game.conf.template" > "$GAME_CONF"
ln -sf "$GAME_CONF" "/etc/nginx/sites-enabled/${GAME_DOMAIN}"

# Generate Admin Nginx config
ADMIN_CONF="/etc/nginx/sites-available/${ADMIN_DOMAIN}"
sed "s/{{ADMIN_DOMAIN}}/${ADMIN_DOMAIN}/g" "${PROJECT_DIR}/nginx/templates/admin.conf.template" > "$ADMIN_CONF"
ln -sf "$ADMIN_CONF" "/etc/nginx/sites-enabled/${ADMIN_DOMAIN}"

# Remove default nginx site if exists
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl reload nginx

# Request Let's Encrypt SSL if enabled
if [[ "$WANT_SSL" =~ ^[sSyY]$ ]]; then
  echo -e "${BLUE}[INFO] Tramitando certificados SSL con Let's Encrypt...${NC}"
  certbot --nginx \
    -d "${GAME_DOMAIN}" \
    -d "${ADMIN_DOMAIN}" \
    --non-interactive \
    --agree-tos \
    -m "${SSL_EMAIL}" \
    --redirect || echo -e "${YELLOW}[ADVERTENCIA] No se pudo obtener el certificado SSL automáticamente. Asegúrate de que los dominios apunten a la IP pública de este servidor.${NC}"
fi

# PM2 Process Manager
echo -e "${BLUE}[INFO] Iniciando servicios con PM2...${NC}"
# Delete old PM2 processes if they exist
pm2 delete dragonbound-web 2>/dev/null || true
pm2 delete dragonbound-game 2>/dev/null || true
pm2 delete dragonbound-scheduler 2>/dev/null || true
pm2 delete dragonbound-admin 2>/dev/null || true

# Start with ecosystem config
cd "${PROJECT_DIR}"
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 Startup script
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo ""
echo -e "${GREEN}${BOLD}===================================================================${NC}"
echo -e "${GREEN}${BOLD}  ¡INSTALACIÓN COMPLETADA CON ÉXITO!                              ${NC}"
echo -e "${GREEN}${BOLD}===================================================================${NC}"
echo ""
echo -e "${BOLD}Acceso Web:${NC}"
PROTOCOL="http"
[[ "$WANT_SSL" =~ ^[sSyY]$ ]] && PROTOCOL="https"
echo -e "  🎮 Juego Web:          ${CYAN}${PROTOCOL}://${GAME_DOMAIN}${NC}"
echo -e "  ⚙️  Panel Administrativo: ${CYAN}${PROTOCOL}://${ADMIN_DOMAIN}${NC}"
echo ""
echo -e "${BOLD}Credenciales de Base de Datos:${NC}"
echo -e "  Host:     127.0.0.1:3306"
echo -e "  Usuario:  dragonbound"
echo -e "  Password: ${YELLOW}${DB_PASS}${NC}"
echo -e "  Database: dragonbound"
echo ""
echo -e "${BOLD}Cuentas Administrativas Iniciales (en la BD):${NC}"
echo -e "  👑 Owner:  Destroyer"
echo -e "  🛡️ Admin:  1nsane"
echo ""
echo -e "${BOLD}Comandos Útiles de Mantenimiento:${NC}"
echo -e "  Ver estado de los servicios:   ${YELLOW}pm2 status${NC}"
echo -e "  Ver logs en tiempo real:       ${YELLOW}pm2 logs${NC}"
echo -e "  Reiniciar todos los servicios: ${YELLOW}pm2 restart all${NC}"
echo -e "  Recargar Nginx:                ${YELLOW}systemctl reload nginx${NC}"
echo -e "${GREEN}===================================================================${NC}"
echo ""
