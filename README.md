# 🚀 DragonBound / GunBound Monorepo & Auto-Deploy

DragonBound es un remake completo del clásico GunBound en HTML5 / WebSockets con servidor Node.js, panel de administración integrado y despliegue automatizado.

---

## 📦 Estructura del Proyecto

```text
├── admin/                     # Panel de Administración oficial (Express + EJS)
├── database/
│   └── dragonbound.sql        # Volcado SQL de base de datos base
├── nginx/
│   └── templates/             # Plantillas de Nginx para Juego y Admin
├── scripts/                   # Scripts auxiliares y herramientas
├── src/
│   ├── game/                  # Lógica del servidor de juego y físicas
│   ├── infra/                 # Conexión a Base de Datos MariaDB
│   ├── ranking/               # Servicio de actualización de ranking
│   ├── shared/                # Utilidades compartidas
│   └── web/                   # Frontend web, vistas Handlebars y API
├── .env.example               # Plantilla de variables de entorno
├── ecosystem.config.js        # Orquestación de procesos con PM2
├── install.sh                 # Instalador interactivo 1-Click
├── package.json
└── README.md
```

---

## ⚡ Instalación Rápida en VPS (1-Click Installer)

El proyecto incluye un instalador interactivo (`install.sh`) diseñado para **Ubuntu 20.04 / 22.04 / 24.04** o **Debian 11 / 12**.

### 1. Clonar el repositorio
```bash
git clone <URL_DE_TU_REPOSITORIO>.git dragonbound
cd dragonbound
```

### 2. Ejecutar el instalador
```bash
sudo bash install.sh
```

El asistente te solicitará:
1. **Dominio del juego** (ej: `gunbound.tudominio.com` o `tudominio.com`)
2. **Dominio del admin** (ej: `admin.gunbound.tudominio.com`)
3. **Certificados SSL** (Sí/No y tu correo para Let's Encrypt)
4. **Contraseña de MySQL** (puedes presionar `Enter` para generar una segura aleatoria)

El script automáticamente:
- Instala Node.js 20, MariaDB, Nginx, Certbot y PM2.
- Configura e importa la base de datos MariaDB (`database/dragonbound.sql`).
- Genera los archivos `.env` con claves criptográficas únicas.
- Instala todas las dependencias NPM (`src/` y `admin/`).
- Configura Nginx con WebSocket proxy (`/ws/` -> 9001) y Web (`/` -> 3000) y tramita SSL.
- Inicia los servicios con PM2 y los configura para inicio automático en el arranque del servidor.

---

## 🛠️ Servicios Administrados por PM2

Todos los servicios se gestionan mediante `ecosystem.config.js`:

| Servicio | Puerto Interno | Función |
| :--- | :--- | :--- |
| **dragonbound-web** | `3000` | Servidor web principal y API |
| **dragonbound-game** | `9001` | Servidor de sockets y físicas en tiempo real |
| **dragonbound-scheduler** | - | Programador de actualización de rankings |
| **dragonbound-admin** | `3100` | Panel de control administrativo |

### Comandos útiles:
```bash
# Ver estado de los procesos
pm2 status

# Ver logs en vivo
pm2 logs

# Ver logs de un servicio específico
pm2 logs dragonbound-game

# Reiniciar todos los servicios
pm2 restart all

# Detener o iniciar
pm2 stop all
pm2 start ecosystem.config.js
```

---

## 🔐 Cuentas de Administrador por Defecto

En la base de datos inicial ya están creadas las cuentas maestras:
- **Owner**: `Destroyer` (Contraseña: `Abcd#1234`)
- **Admin**: `1nsane` (Contraseña: `Abcd#1234`)

---

## 🌐 Configuración Manual de Nginx (Referencia)

Si configuras el proxy manualmente:
- El tráfico web va a `http://127.0.0.1:3000`.
- El tráfico WebSocket (`/ws/`) va a `http://127.0.0.1:9001/` con headers `Upgrade` y `Connection "upgrade"`.
- El panel administrativo va a `http://127.0.0.1:3100`.

---

## 👨‍💻 Autoría y Créditos

- **Creado por:** Roger Tapia
- **Sitio Web:** [www.aljania.com](https://www.aljania.com)
- **Teléfono / WhatsApp:** 998489530

