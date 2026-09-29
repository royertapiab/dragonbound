const db = require('../config/database');

class AuditService {
    /**
     * Log an administrative action
     */
    async logAction({
        adminUserId,
        adminGameId,
        action,
        targetType = null,
        targetId = null,
        targetGameId = null,
        oldValue = null,
        newValue = null,
        ipAddress = null,
        userAgent = null
    }) {
        try {
            await db.query(
                `INSERT INTO admin_audit_log 
                 (admin_user_id, admin_game_id, action, target_type, target_id, target_game_id, old_value, new_value, ip_address, user_agent)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    adminUserId,
                    adminGameId,
                    action,
                    targetType,
                    targetId,
                    targetGameId,
                    typeof oldValue === 'object' && oldValue !== null ? JSON.stringify(oldValue) : oldValue,
                    typeof newValue === 'object' && newValue !== null ? JSON.stringify(newValue) : newValue,
                    ipAddress ? ipAddress.substring(0, 45) : null,
                    userAgent ? userAgent.substring(0, 255) : null
                ]
            );
        } catch (error) {
            console.error('[AuditService] Failed to record audit log:', error.message);
        }
    }

    /**
     * Query audit logs with pagination and filters
     */
    async getAuditLogs({ search = '', action = '', page = 1, limit = 25 }) {
        const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
        const params = [];
        let where = '1=1';

        if (search && search.trim()) {
            const term = `%${search.trim()}%`;
            where += ' AND (admin_game_id LIKE ? OR target_game_id LIKE ? OR action LIKE ? OR ip_address LIKE ?)';
            params.push(term, term, term, term);
        }

        if (action && action.trim()) {
            where += ' AND action = ?';
            params.push(action.trim());
        }

        const [countRows] = await db.query(
            `SELECT COUNT(*) AS total FROM admin_audit_log WHERE ${where}`,
            params
        );
        const total = countRows[0].total || 0;

        params.push(parseInt(limit, 10), offset);
        const [logs] = await db.query(
            `SELECT * FROM admin_audit_log WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
            params
        );

        return {
            logs,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit) || 1
        };
    }
}

module.exports = new AuditService();
