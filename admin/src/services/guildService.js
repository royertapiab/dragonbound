const db = require('../config/database');

class GuildService {
    /**
     * List all guilds with pagination and search
     */
    async listGuilds({ search = '', page = 1, limit = 20 }) {
        const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
        const params = [];
        let where = '1=1';

        if (search && search.trim()) {
            where += ' AND g.Name LIKE ?';
            params.push(`%${search.trim()}%`);
        }

        const [countRows] = await db.query(
            `SELECT COUNT(*) AS total FROM guild g WHERE ${where}`,
            params
        );
        const total = countRows[0].total || 0;

        params.push(parseInt(limit, 10), offset);
        const [guilds] = await db.query(
            `SELECT g.*, 
                    u.game_id AS leader_name,
                    u.Id AS leader_user_id,
                    a.Username AS leader_username,
                    (SELECT COUNT(*) FROM guild_member gm2 WHERE gm2.Id = g.Id) AS member_count
             FROM guild g
             LEFT JOIN guild_member gm ON g.Id = gm.Id AND gm.Job = 1
             LEFT JOIN users u ON gm.UserId = u.Id
             LEFT JOIN accounts a ON u.IdAcc = a.Id
             WHERE ${where}
             ORDER BY g.points DESC, g.Id ASC
             LIMIT ? OFFSET ?`,
            params
        );

        return {
            guilds,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit) || 1
        };
    }

    /**
     * Get guild details and member roster
     */
    async getGuild(id) {
        const [guildRows] = await db.query(`SELECT * FROM guild WHERE Id = ? LIMIT 1`, [id]);
        if (guildRows.length === 0) return null;
        const guild = guildRows[0];

        // Member list
        const [members] = await db.query(
            `SELECT gm.rowsec, gm.Job, 
                    u.Id as user_id, u.IdAcc, u.game_id, u.rank, u.gp, u.gold, u.cash, u.gender,
                    a.Username, a.IsOnline
             FROM guild_member gm
             JOIN users u ON gm.UserId = u.Id
             JOIN accounts a ON u.IdAcc = a.Id
             WHERE gm.Id = ?
             ORDER BY gm.Job DESC, u.gp DESC`,
            [id]
        );

        return {
            ...guild,
            members
        };
    }

    /**
     * Update guild details
     */
    async updateGuild(id, { name, points, rank, img, fondo, about, website }) {
        const guild = await this.getGuild(id);
        if (!guild) throw new Error('Gremio no encontrado');

        const updates = [];
        const params = [];

        if (name) {
            updates.push('Name = ?');
            params.push(name.trim());
        }
        if (points !== undefined) {
            updates.push('points = ?');
            params.push(parseInt(points, 10) || 0);
        }
        if (rank !== undefined) {
            updates.push('rank = ?');
            params.push(parseInt(rank, 10) || 0);
        }
        if (img !== undefined) {
            updates.push('img = ?');
            params.push(img.trim() || '/static/images/your-logo-here.png');
        }
        if (fondo !== undefined) {
            updates.push('fondo = ?');
            params.push(fondo.trim() || '/static/images/aqua_bg.jpg');
        }
        if (about !== undefined) {
            updates.push('about = ?');
            params.push(about.trim());
        }
        if (website !== undefined) {
            updates.push('website = ?');
            params.push(website.trim());
        }

        if (updates.length > 0) {
            params.push(id);
            await db.query(`UPDATE guild SET ${updates.join(', ')} WHERE Id = ?`, params);
        }

        return true;
    }

    /**
     * Remove member from guild
     */
    async removeMember(guildId, userId) {
        await db.query(`DELETE FROM guild_member WHERE Id = ? AND UserId = ?`, [guildId, userId]);
        // Update member count
        await db.query(`UPDATE guild SET members = (SELECT COUNT(*) FROM guild_member WHERE Id = ?) WHERE Id = ?`, [guildId, guildId]);
        return true;
    }

    /**
     * Transfer guild leadership to another member
     */
    async transferMaster(guildId, newMasterUserId) {
        // Demote all current leaders
        await db.query(`UPDATE guild_member SET Job = 0 WHERE Id = ? AND Job = 1`, [guildId]);
        // Promote new leader
        await db.query(`UPDATE guild_member SET Job = 1 WHERE Id = ? AND UserId = ?`, [guildId, newMasterUserId]);
        return true;
    }

    /**
     * Disband and delete entire guild
     */
    async deleteGuild(id) {
        await db.query(`DELETE FROM guild_member WHERE Id = ?`, [id]);
        await db.query(`DELETE FROM guild WHERE Id = ?`, [id]);
        return true;
    }
}

module.exports = new GuildService();
