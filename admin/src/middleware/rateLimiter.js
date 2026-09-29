const rateLimit = require('express-rate-limit');

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Por favor espera 15 minutos antes de volver a intentarlo.'
    },
    handler: (req, res, next, options) => {
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(429).json(options.message);
        }
        res.status(429).render('auth/login', {
            error: 'Demasiados intentos de inicio de sesión fallidos. Por razones de seguridad, tu acceso ha sido bloqueado temporalmente por 15 minutos.',
            username: req.body.username || '',
            csrfToken: req.session ? req.session.csrfToken : ''
        });
    }
});

module.exports = {
    loginRateLimiter
};
