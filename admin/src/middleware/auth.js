/**
 * Authentication and authorization middleware
 */

function requireAuth(req, res, next) {
    if (!req.session || !req.session.admin) {
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(401).json({ error: 'No autenticado. Por favor inicia sesión.' });
        }
        return res.redirect('/login');
    }

    // Expose admin and permission helper to templates
    res.locals.admin = req.session.admin;
    res.locals.hasPermission = (permissionKey) => {
        if (!req.session.admin) return false;
        if (req.session.admin.roleName === 'OWNER') return true;
        return Array.isArray(req.session.admin.permissions) && req.session.admin.permissions.includes(permissionKey);
    };

    next();
}

function requireGuest(req, res, next) {
    if (req.session && req.session.admin) {
        return res.redirect('/');
    }
    next();
}

function requirePermission(permissionKey) {
    return (req, res, next) => {
        if (!req.session || !req.session.admin) {
            return res.redirect('/login');
        }

        const admin = req.session.admin;
        const isOwner = admin.roleName === 'OWNER';
        const hasPerm = Array.isArray(admin.permissions) && admin.permissions.includes(permissionKey);

        if (!isOwner && !hasPerm) {
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(403).json({ error: 'No cuentas con los permisos requeridos.' });
            }
            return res.status(403).render('error', {
                statusCode: 403,
                title: 'Permiso Denegado',
                message: `Tu rol (${admin.roleName}) no cuenta con el permiso requerido: ${permissionKey}`
            });
        }

        next();
    };
}

module.exports = {
    requireAuth,
    requireGuest,
    requirePermission
};
