const crypto = require('crypto');

/**
 * Session-based CSRF protection middleware.
 * Generates and validates CSRF tokens without deprecated dependencies.
 */
function csrfProtection(req, res, next) {
    if (!req.session) {
        return next(new Error('Session middleware must be initialized before CSRF protection'));
    }

    // Ensure session has a CSRF token
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }

    // Expose csrfToken to all views via res.locals
    res.locals.csrfToken = req.session.csrfToken;

    // Check method
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
        return next();
    }

    // Check token from body or headers
    const submittedToken = req.body?._csrf || req.headers['x-csrf-token'] || req.headers['csrf-token'];

    if (!submittedToken || submittedToken !== req.session.csrfToken) {
        console.warn(`[CSRF] Invalid or missing token from IP: ${req.ip} for path: ${req.originalUrl}`);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(403).json({ error: 'Token de seguridad inválido o expirado. Recarga la página.' });
        }
        return res.status(403).render('error', {
            statusCode: 403,
            title: 'Acceso Denegado (CSRF)',
            message: 'Tu sesión o token de seguridad expiró. Por favor recarga la página e intenta nuevamente.'
        });
    }

    next();
}

module.exports = csrfProtection;
