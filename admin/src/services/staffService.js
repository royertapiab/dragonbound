const db = require('../config/database');

class StaffService {
    /**
     * List all staff members
     */
    async listStaff() {
        const [staff] = await db.query(
            `SELECT au.id AS admin_user_id, au.user_id, au.role_id, au.is_active,
                    au.created_at, au.updated_at,
                    ar.name AS role_name, ar.description AS role_description,
                    a.Username, a.Email, a.IP, a.IsOnline,
                    u.Id AS game_user_id, u.game_id, u.rank, u.gm
             FROM admin_users au
             JOIN admin_roles ar ON au.role_id = ar.id
             JOIN accounts a ON au.user_id = a.Id
             LEFT JOIN users u ON u.IdAcc = a.Id
             ORDER BY au.role_id ASC, au.id ASC`
        );

        const [roles] = await db.query('SELECT * FROM admin_roles ORDER BY id ASC');

        return {
            staff,
            roles
        };
    }

    /**
     * Get roles with their full permissions matrix
     */
    async getRolesAndPermissions() {
        const [roles] = await db.query('SELECT * FROM admin_roles ORDER BY id ASC');
        const [permissions] = await db.query('SELECT * FROM admin_permissions ORDER BY id ASC');
        const [rolePerms] = await db.query('SELECT role_id, permission_id FROM admin_role_permissions');

        const matrix = {};
        for (const r of roles) {
            matrix[r.id] = new Set();
        }
        for (const rp of rolePerms) {
            if (matrix[rp.role_id]) {
                matrix[rp.role_id].add(rp.permission_id);
            }
        }

        return {
            roles,
            permissions,
            matrix
        };
    }

    /**
     * Add new staff member
     */
    async addStaff({ username, roleId, createdBy }) {
        const [accRows] = await db.query(
            'SELECT Id, Username FROM accounts WHERE Username = ? LIMIT 1',
            [username.trim()]
        );

        if (accRows.length === 0) throw new Error(`El usuario '${username}' no existe en el juego`);
        const account = accRows[0];

        // Check if already in admin_users
        const [existing] = await db.query(
            'SELECT id FROM admin_users WHERE user_id = ? LIMIT 1',
            [account.Id]
        );

        if (existing.length > 0) throw new Error(`El usuario '${username}' ya forma parte del personal administrativo`);

        const parsedRoleId = parseInt(roleId, 10);
        await db.query(
            `INSERT INTO admin_users (user_id, role_id, is_active, created_by)
             VALUES (?, ?, 1, ?)`,
            [account.Id, parsedRoleId, createdBy]
        );

        // If role is OWNER, ADMIN or GM, set game GM flag as well
        if ([1, 2, 3].includes(parsedRoleId)) {
            await db.query('UPDATE users SET gm = 1 WHERE IdAcc = ?', [account.Id]);
        }

        return account;
    }

    /**
     * Update staff member's role
     */
    async updateStaffRole(adminUserId, roleId) {
        const parsedRoleId = parseInt(roleId, 10);
        await db.query('UPDATE admin_users SET role_id = ? WHERE id = ?', [parsedRoleId, adminUserId]);
        return true;
    }

    /**
     * Toggle staff member active status
     */
    async toggleStaffStatus(adminUserId, isActive) {
        const val = isActive ? 1 : 0;
        await db.query('UPDATE admin_users SET is_active = ? WHERE id = ?', [val, adminUserId]);
        return true;
    }

    /**
     * Remove staff member
     */
    async removeStaff(adminUserId) {
        const [staff] = await db.query('SELECT role_id FROM admin_users WHERE id = ? LIMIT 1', [adminUserId]);
        if (staff.length === 0) throw new Error('Staff no encontrado');

        if (staff[0].role_id === 1) {
            throw new Error('No es posible eliminar al OWNER principal del sistema');
        }

        await db.query('DELETE FROM admin_users WHERE id = ?', [adminUserId]);
        return true;
    }
}

module.exports = new StaffService();
