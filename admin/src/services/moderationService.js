const db = require('../config/database');

class ModerationService {
    /**
     * Get banned accounts list with pagination
     */
    async getBans({ page = 1, limit = 20, search = '' }) {
        const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
        const params = [];
        let where = '1=1';

        if (search && search.trim()) {
            const term = `%${search.trim()}%`;
            where += ' AND (b.razon LIKE ? OR b.gm LIKE ? OR a.Username LIKE ? OR u.game_id LIKE ?)';
            params.push(term, term, term, term);
        }

        const [countRows] = await db.query(
            `SELECT COUNT(*) AS total
             FROM banned b
             LEFT JOIN accounts a ON b.UserId = a.Id
             LEFT JOIN users u ON u.IdAcc = a.Id
             WHERE ${where}`,
            params
        );
        const total = countRows[0].total || 0;

        params.push(parseInt(limit, 10), offset);
        const [bans] = await db.query(
            `SELECT b.*, a.Username, a.IP as last_ip, u.Id as game_user_id, u.game_id, u.rank
             FROM banned b
             LEFT JOIN accounts a ON b.UserId = a.Id
             LEFT JOIN users u ON u.IdAcc = a.Id
             WHERE ${where}
             ORDER BY b.Id DESC
             LIMIT ? OFFSET ?`,
            params
        );

        return {
            bans,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit) || 1
        };
    }

    /**
     * Ban a player account
     */
    async banPlayer({ userId, reason = 'Violación de términos', duration = 'Forever', gmName = 'Admin', gmId = 0 }) {
        // Resolve account ID
        const [players] = await db.query(
            `SELECT u.Id as game_user_id, u.IdAcc, u.game_id, a.Username 
             FROM users u 
             JOIN accounts a ON u.IdAcc = a.Id 
             WHERE u.Id = ? OR a.Id = ? OR u.game_id = ? OR a.Username = ?
             LIMIT 1`,
            [userId, userId, userId, userId]
        );

        if (players.length === 0) throw new Error('Jugador no encontrado');
        const player = players[0];

        // Format duration
        let dateValue = 'Forever';
        if (duration !== 'Forever') {
            const days = parseInt(duration, 10);
            if (!isNaN(days) && days > 0) {
                dateValue = String(Date.now() + (days * 86400000));
            }
        }

        // Insert into banned table
        await db.query(
            `INSERT INTO banned (UserId, razon, date, gm, gm_id)
             VALUES (?, ?, ?, ?, ?)`,
            [player.IdAcc, reason, dateValue, gmName, gmId]
        );

        // Update user banned flag & kick session
        await db.query('UPDATE users SET banned = 1 WHERE IdAcc = ?', [player.IdAcc]);
        await db.query('UPDATE accounts SET IsOnline = 0, Session = NULL WHERE Id = ?', [player.IdAcc]);

        return {
            player,
            reason,
            duration: dateValue
        };
    }

    /**
     * Unban player account
     */
    async unbanPlayer(userId) {
        // Resolve account ID
        const [players] = await db.query(
            `SELECT u.Id as game_user_id, u.IdAcc, u.game_id, a.Username 
             FROM users u 
             JOIN accounts a ON u.IdAcc = a.Id 
             WHERE u.Id = ? OR a.Id = ? OR u.game_id = ?
             LIMIT 1`,
            [userId, userId, userId]
        );

        if (players.length === 0) throw new Error('Jugador no encontrado');
        const player = players[0];

        await db.query('DELETE FROM banned WHERE UserId = ?', [player.IdAcc]);
        await db.query('UPDATE users SET banned = 0 WHERE IdAcc = ?', [player.IdAcc]);

        return player;
    }

    /**
     * List IP bans
     */
    async getIpBans({ page = 1, limit = 20 }) {
        const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

        const [countRows] = await db.query('SELECT COUNT(*) AS total FROM ip_user_banned');
        const total = countRows[0].total || 0;

        const [ipBans] = await db.query(
            `SELECT * FROM ip_user_banned ORDER BY Id DESC LIMIT ? OFFSET ?`,
            [parseInt(limit, 10), offset]
        );

        return {
            ipBans,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit) || 1
        };
    }

    /**
     * Add IP ban
     */
    async banIp({ ip, reason = 'Bloqueo administrativo', gm = 'Admin', gmId = 0 }) {
        const cleanIp = (ip || '').trim();
        if (!cleanIp) throw new Error('Dirección IP requerida');

        const [result] = await db.query(
            `INSERT INTO ip_user_banned (ip, razon, gm, IdGM) VALUES (?, ?, ?, ?)`,
            [cleanIp, reason, gm, gmId]
        );

        return {
            id: result.insertId,
            ip: cleanIp,
            reason
        };
    }

    /**
     * Unban IP
     */
    async unbanIp(id) {
        await db.query('DELETE FROM ip_user_banned WHERE Id = ?', [id]);
        return true;
    }

    /**
     * Get muted players
     */
    async getMutedPlayers() {
        const [rows] = await db.query(
            `SELECT u.Id, u.IdAcc, u.game_id, u.rank, u.is_muted, a.Username, a.IsOnline
             FROM users u
             JOIN accounts a ON u.IdAcc = a.Id
             WHERE u.is_muted != '0'`
        );
        return rows;
    }

    /**
     * Unmute player
     */
    async unmutePlayer(userId) {
        await db.query('UPDATE users SET is_muted = "0" WHERE Id = ? OR IdAcc = ?', [userId, userId]);
        return true;
    }

    /**
     * Get active online sessions
     */
    async getOnlineSessions() {
        const [rows] = await db.query(
            `SELECT a.Id as account_id, a.Username, a.IP, a.Session,
                    u.Id as game_user_id, u.game_id, u.rank, u.gm, u.gold, u.cash
             FROM accounts a
             JOIN users u ON u.IdAcc = a.Id
             WHERE a.IsOnline = 1
             ORDER BY u.Id DESC`
        );
        return rows;
    }

    /**
     * Kick session
     */
    async kickSession(accountId) {
        await db.query('UPDATE accounts SET IsOnline = 0, Session = NULL WHERE Id = ?', [accountId]);
        return true;
    }
}

module.exports = new ModerationService();
