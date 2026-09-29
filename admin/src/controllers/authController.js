const authService = require('../services/authService');
const auditService = require('../services/auditService');

class AuthController {
    /**
     * Show login page
     */
    showLogin(req, res) {
        res.render('auth/login', {
            error: null,
            username: ''
        });
    }

    /**
     * Process login form
     */
    async processLogin(req, res) {
        const { username, password } = req.body;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'];

        try {
            const authResult = await authService.authenticate(username, password);

            if (!authResult.success) {
                return res.status(401).render('auth/login', {
                    error: authResult.message,
                    username: username || ''
                });
            }

            // Save admin in session
            req.session.admin = authResult.admin;

            // Log successful login
            await auditService.logAction({
                adminUserId: authResult.admin.adminUserId,
                adminGameId: authResult.admin.gameId,
                action: 'AUTH_LOGIN',
                newValue: { role: authResult.admin.roleName, username: authResult.admin.username },
                ipAddress,
                userAgent
            });

            // Regenerate session ID for security against session fixation
            req.session.save((err) => {
                if (err) {
                    console.error('[Session] Error saving session:', err);
                }
                res.redirect('/');
            });
        } catch (error) {
            console.error('[AuthController] Login error:', error);
            res.status(500).render('auth/login', {
                error: 'Ocurrió un error inesperado al procesar la solicitud.',
                username: username || ''
            });
        }
    }

    /**
     * Logout
     */
    async logout(req, res) {
        if (req.session && req.session.admin) {
            const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
            const userAgent = req.headers['user-agent'];

            await auditService.logAction({
                adminUserId: req.session.admin.adminUserId,
                adminGameId: req.session.admin.gameId,
                action: 'AUTH_LOGOUT',
                ipAddress,
                userAgent
            });

            req.session.destroy((err) => {
                if (err) {
                    console.error('[Session] Logout destroy error:', err);
                }
                res.clearCookie('dragonbound_admin_sid');
                res.redirect('/login');
            });
        } else {
            res.redirect('/login');
        }
    }
}

module.exports = new AuthController();
