const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const pool = require('./config/database');
const csrfProtection = require('./middleware/csrf');
const routes = require('./routes');

const app = express();

// Trust reverse proxy (Nginx)
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Body parsing
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Static assets
app.use('/static', express.static(path.join(__dirname, 'public')));

// Session Store
const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 mins
    expiration: 24 * 60 * 60 * 1000, // 24 hours
    createDatabaseTable: true,
    schema: {
        tableName: 'admin_sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, pool);

// Session configuration
app.use(session({
    key: 'dragonbound_admin_sid',
    secret: process.env.SESSION_SECRET || 'strong-default-secret-key-dragonbound-2026',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// CSRF Protection
app.use(csrfProtection);

// Flash message middleware & view helpers
app.use((req, res, next) => {
    res.locals.flash = req.session.flash || {};
    delete req.session.flash;
    req.flash = (type, message) => {
        if (!req.session.flash) req.session.flash = {};
        req.session.flash[type] = message;
    };
    res.locals.currentPath = req.path;
    next();
});

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/', routes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('error', {
        statusCode: 404,
        title: 'Página No Encontrada',
        message: `La ruta solicitada (${req.originalUrl}) no existe en el panel administrativo.`
    });
});

// 500 Global Error Handler
app.use((err, req, res, next) => {
    console.error('[App Error]', err);
    res.status(500).render('error', {
        statusCode: 500,
        title: 'Error Interno del Servidor',
        message: 'Ocurrió un error inesperado al procesar la solicitud.'
    });
});

module.exports = app;
