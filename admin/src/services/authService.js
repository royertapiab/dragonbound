const db = require('../config/database');

class AuthService {
    /**
     * Authenticate an admin user using game account credentials
     * and check admin role & permissions.
     */
    async authenticate(username, password) {
        if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
            return {
                success: false,
                reason: 'INVALID_INPUT',
                message: 'Usuario y contraseña requeridos.'
            };
        }

        const trimmedUser = username.trim();

        // 1. Search account in accounts table
        const [accountRows] = await db.query(
            'SELECT Id, Username, Password, Session, IsOnline FROM accounts WHERE Username = ? LIMIT 1',
            [trimmedUser]
        );

        if (accountRows.length === 0) {
            return {
                success: false,
                reason: 'INVALID_CREDENTIALS',
                message: 'Usuario o contraseña incorrectos.'
            };
        }

        const account = accountRows[0];

        // 2. Verify password (matches game password mechanism)
        if (account.Password !== password) {
            return {
                success: false,
                reason: 'INVALID_CREDENTIALS',
                message: 'Usuario o contraseña incorrectos.'
            };
        }

        // 3. Find user in users table by IdAcc
        const [userRows] = await db.query(
            'SELECT Id, IdAcc, game_id, gm, rank, banned FROM users WHERE IdAcc = ? LIMIT 1',
            [account.Id]
        );

        if (userRows.length === 0) {
            return {
                success: false,
                reason: 'NO_GAME_USER',
                message: 'No tienes permisos para acceder al panel administrativo.'
            };
        }

        const gameUser = userRows[0];

        // 4. Verify admin_users table and active status
        const [adminRows] = await db.query(
            `SELECT au.id AS admin_user_id, au.user_id, au.role_id, au.is_active,
                    ar.name AS role_name, ar.description AS role_description
             FROM admin_users au
             JOIN admin_roles ar ON au.role_id = ar.id
             WHERE au.user_id = ? LIMIT 1`,
            [account.Id]
        );

        if (adminRows.length === 0 || adminRows[0].is_active !== 1) {
            return {
                success: false,
                reason: 'UNAUTHORIZED',
                message: 'No tienes permisos para acceder al panel administrativo.'
            };
        }

        const adminData = adminRows[0];

        // 5. Load role permissions
        const [permRows] = await db.query(
            `SELECT ap.permission_key
             FROM admin_role_permissions arp
             JOIN admin_permissions ap ON arp.permission_id = ap.id
             WHERE arp.role_id = ?`,
            [adminData.role_id]
        );

        const permissions = permRows.map(p => p.permission_key);

        return {
            success: true,
            admin: {
                adminUserId: adminData.admin_user_id,
                userId: adminData.user_id,
                gameUserId: gameUser.Id,
                username: account.Username,
                gameId: gameUser.game_id,
                roleId: adminData.role_id,
                roleName: adminData.role_name,
                roleDescription: adminData.role_description,
                permissions: permissions
            }
        };
    }
}

module.exports = new AuthService();
