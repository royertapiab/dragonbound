const db = require('../config/database');

class PlayerService {
    /**
     * List players with filters, search, and pagination
     */
    async listPlayers({ search = '', rank = '', gm = '', banned = '', isOnline = '', page = 1, limit = 20 }) {
        const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
        const params = [];
        const countParams = [];
        let whereClauses = ['1=1'];

        if (search && search.trim() !== '') {
            const term = `%${search.trim()}%`;
            whereClauses.push('(u.game_id LIKE ? OR a.Username LIKE ? OR a.Email LIKE ? OR a.IP LIKE ? OR u.Id = ? OR a.Id = ?)');
            params.push(term, term, term, term, search.trim(), search.trim());
            countParams.push(term, term, term, term, search.trim(), search.trim());
        }

        if (rank !== '' && rank !== undefined) {
            whereClauses.push('u.rank = ?');
            params.push(parseInt(rank, 10));
            countParams.push(parseInt(rank, 10));
        }

        if (gm !== '' && gm !== undefined) {
            whereClauses.push('u.gm = ?');
            params.push(parseInt(gm, 10));
            countParams.push(parseInt(gm, 10));
        }

        if (banned !== '' && banned !== undefined) {
            whereClauses.push('u.banned = ?');
            params.push(parseInt(banned, 10));
            countParams.push(parseInt(banned, 10));
        }

        if (isOnline !== '' && isOnline !== undefined) {
            whereClauses.push('a.IsOnline = ?');
            params.push(parseInt(isOnline, 10));
            countParams.push(parseInt(isOnline, 10));
        }

        const whereSql = whereClauses.join(' AND ');

        // Count query
        const [countRows] = await db.query(
            `SELECT COUNT(*) AS total
             FROM users u
             JOIN accounts a ON u.IdAcc = a.Id
             WHERE ${whereSql}`,
            countParams
        );
        const total = countRows[0].total || 0;

        // Data query
        params.push(parseInt(limit, 10), offset);
        const [players] = await db.query(
            `SELECT u.Id, u.IdAcc, u.game_id, u.rank, u.gp, u.gold, u.cash, u.gender,
                    u.gm, u.banned, u.is_muted, u.power_user, u.country, u.win, u.loss,
                    a.Username, a.Email, a.IP, a.IsOnline, a.Birthday
             FROM users u
             JOIN accounts a ON u.IdAcc = a.Id
             WHERE ${whereSql}
             ORDER BY u.Id DESC
             LIMIT ? OFFSET ?`,
            params
        );

        return {
            players,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit) || 1
        };
    }

    /**
     * Get player details by Game User ID or Account ID
     */
    async getPlayer(id) {
        const [rows] = await db.query(
            `SELECT u.*, a.Username, a.Email, a.IP, a.IsOnline, a.PinUser, a.Birthday, a.views
             FROM users u
             JOIN accounts a ON u.IdAcc = a.Id
             WHERE u.Id = ? OR a.Id = ?
             LIMIT 1`,
            [id, id]
        );

        if (rows.length === 0) return null;
        const player = rows[0];

        // Sanctions / Ban history
        const [bans] = await db.query(
            `SELECT * FROM banned WHERE UserId = ? ORDER BY Id DESC`,
            [player.IdAcc]
        );

        // Guild membership
        const [guildMember] = await db.query(
            `SELECT gm.Job, g.Id as guild_id, g.Name as guild_name, g.rank as guild_rank, g.img as guild_img
             FROM guild_member gm
             JOIN guild g ON gm.Id = g.Id
             WHERE gm.UserId = ?
             LIMIT 1`,
            [player.Id]
        );

        // Equipped Avatars
        const [equipped] = await db.query(
            `SELECT * FROM user_avatar_equiped WHERE Id = ? LIMIT 1`,
            [player.Id]
        );

        // Total Avatars in Inventory
        const [avatarStats] = await db.query(
            `SELECT 
                COUNT(*) AS total_avatars,
                SUM(CASE WHEN remove_ava = 0 THEN 1 ELSE 0 END) AS active_avatars
             FROM user_avatars 
             WHERE UserId = ?`,
            [player.IdAcc]
        );

        return {
            ...player,
            bans: bans || [],
            guild: guildMember[0] || null,
            equipped: equipped[0] || null,
            inventoryStats: {
                total: avatarStats[0]?.total_avatars || 0,
                active: avatarStats[0]?.active_avatars || 0
            }
        };
    }

    /**
     * Update player profile data
     */
    async updatePlayer(id, { game_id, email, gender, country, power_user }) {
        const player = await this.getPlayer(id);
        if (!player) throw new Error('Jugador no encontrado');

        if (game_id && game_id !== player.game_id) {
            await db.query('UPDATE users SET game_id = ? WHERE Id = ?', [game_id, player.Id]);
        }
        if (gender !== undefined) {
            await db.query('UPDATE users SET gender = ? WHERE Id = ?', [gender, player.Id]);
        }
        if (country !== undefined) {
            await db.query('UPDATE users SET country = ? WHERE Id = ?', [country, player.Id]);
        }
        if (power_user !== undefined) {
            await db.query('UPDATE users SET power_user = ? WHERE Id = ?', [parseInt(power_user, 10), player.Id]);
        }
        if (email !== undefined) {
            await db.query('UPDATE accounts SET Email = ? WHERE Id = ?', [email, player.IdAcc]);
        }

        return true;
    }

    /**
     * Update player rank
     */
    async updateRank(id, rank) {
        const rankNum = parseInt(rank, 10);
        await db.query('UPDATE users SET rank = ? WHERE Id = ? OR IdAcc = ?', [rankNum, id, id]);
        return true;
    }

    /**
     * Toggle GM flag
     */
    async toggleGM(id, gm) {
        const gmVal = parseInt(gm, 10) === 1 ? 1 : 0;
        await db.query('UPDATE users SET gm = ? WHERE Id = ? OR IdAcc = ?', [gmVal, id, id]);
        return true;
    }

    /**
     * Reset account password
     */
    async resetPassword(id, newPassword) {
        if (!newPassword || newPassword.trim().length === 0) {
            throw new Error('La contraseña no puede estar vacía');
        }
        await db.query('UPDATE accounts SET Password = ? WHERE Id = (SELECT IdAcc FROM users WHERE Id = ? OR IdAcc = ? LIMIT 1)', [newPassword.trim(), id, id]);
        return true;
    }

    /**
     * Update chat mute state
     */
    async updateMute(id, isMuted) {
        const muteVal = isMuted ? '1' : '0';
        await db.query('UPDATE users SET is_muted = ? WHERE Id = ? OR IdAcc = ?', [muteVal, id, id]);
        return true;
    }

    /**
     * Disconnect / Kick player session
     */
    async kickPlayer(id) {
        const player = await this.getPlayer(id);
        if (!player) throw new Error('Jugador no encontrado');

        await db.query('UPDATE accounts SET IsOnline = 0, Session = NULL WHERE Id = ?', [player.IdAcc]);
        return true;
    }
}

module.exports = new PlayerService();
