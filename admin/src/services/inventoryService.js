const db = require('../config/database');
let avatarCatalog = [];
let avatarMap = new Map();

try {
    avatarCatalog = require('/var/www/dragonbound/src/game/data.js');
    for (let i = 0; i < avatarCatalog.length; i++) {
        const item = avatarCatalog[i];
        if (item && item.length > 5) {
            avatarMap.set(item[0], {
                id: item[0],
                spriteId: item[1],
                type: item[2],
                gender: item[3],
                filename: item[4],
                name: item[5],
                stats: item[6] || {}
            });
        }
    }
    console.log(`[InventoryService] Loaded ${avatarMap.size} avatars from data.js`);
} catch (err) {
    console.error('[InventoryService] Warning: Failed to load game/data.js:', err.message);
}

class InventoryService {
    /**
     * Search catalog
     */
    searchCatalog({ query = '', type = '', gender = '', page = 1, limit = 24 }) {
        let results = Array.from(avatarMap.values());

        if (query && query.trim() !== '') {
            const q = query.trim().toLowerCase();
            results = results.filter(item => 
                String(item.id) === q ||
                (item.name && item.name.toLowerCase().includes(q)) ||
                (item.filename && item.filename.toLowerCase().includes(q))
            );
        }

        if (type !== '' && type !== undefined) {
            const t = parseInt(type, 10);
            results = results.filter(item => item.type === t);
        }

        if (gender !== '' && gender !== undefined) {
            const g = parseInt(gender, 10);
            results = results.filter(item => item.gender === g || item.gender === 2);
        }

        const total = results.length;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;
        const pagedItems = results.slice(offset, offset + limitNum);

        return {
            items: pagedItems,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1
        };
    }

    /**
     * Get avatar metadata by item ID
     */
    getAvatar(id) {
        return avatarMap.get(parseInt(id, 10)) || null;
    }

    /**
     * Get all avatars in a player's inventory
     */
    async getUserInventory(userId) {
        // Find player account ID
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

        // Fetch equipped
        const [equippedRows] = await db.query(
            `SELECT * FROM user_avatar_equiped WHERE Id = ? LIMIT 1`,
            [player.game_user_id]
        );
        const equipped = equippedRows[0] || {};
        const equippedIds = new Set([
            equipped.head,
            equipped.body,
            equipped.eyes,
            equipped.flag,
            equipped.background,
            equipped.foreground
        ].filter(Boolean));

        // Fetch inventory
        const [rows] = await db.query(
            `SELECT Id, UserId, aId, type, is_cash, is_gift, gift_sent_by, amount,
                    expire_time, date_ava_time, remove_ava
             FROM user_avatars
             WHERE UserId = ?
             ORDER BY Id DESC`,
            [player.IdAcc]
        );

        const items = rows.map(row => {
            const meta = avatarMap.get(parseInt(row.aId, 10));
            const isEquipped = equippedIds.has(parseInt(row.aId, 10));

            // Check if expired
            let isExpired = false;
            let daysLeft = null;
            if (row.expire_time && row.expire_time > 0) {
                const now = Date.now();
                if (now > row.expire_time) {
                    isExpired = true;
                } else {
                    daysLeft = Math.ceil((row.expire_time - now) / 86400000);
                }
            }

            return {
                ...row,
                isEquipped,
                isExpired,
                daysLeft,
                name: meta ? meta.name : `Avatar #${row.aId}`,
                filename: meta ? meta.filename : '',
                itemType: meta ? meta.type : row.type,
                gender: meta ? meta.gender : 2,
                stats: meta ? meta.stats : {}
            };
        });

        return {
            player,
            equipped,
            items,
            total: items.length,
            activeCount: items.filter(i => i.remove_ava === 0).length,
            deletedCount: items.filter(i => i.remove_ava === 1).length
        };
    }

    /**
     * Grant avatar to a player
     */
    async grantAvatar({ userId, aId, expireDays = 0, isCash = 1, isGift = 1, giftSentBy = 0 }) {
        const avatarId = parseInt(aId, 10);
        const meta = this.getAvatar(avatarId);
        if (!meta) throw new Error(`El avatar ID ${avatarId} no existe en el catálogo`);

        const [players] = await db.query(
            `SELECT u.Id as game_user_id, u.IdAcc, u.game_id 
             FROM users u 
             JOIN accounts a ON u.IdAcc = a.Id 
             WHERE u.Id = ? OR a.Id = ? OR u.game_id = ?
             LIMIT 1`,
            [userId, userId, userId]
        );

        if (players.length === 0) throw new Error('Jugador no encontrado');
        const player = players[0];

        const days = parseInt(expireDays, 10) || 0;
        const expireTime = days > 0 ? Date.now() + (days * 86400000) : 0;
        const now = Date.now();

        const [result] = await db.query(
            `INSERT INTO user_avatars 
             (UserId, aId, type, is_cash, is_gift, gift_sent_by, amount, expire_time, date_ava_time, remove_ava)
             VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 0)`,
            [
                player.IdAcc,
                avatarId,
                meta.type,
                parseInt(isCash, 10),
                parseInt(isGift, 10),
                giftSentBy,
                expireTime,
                now
            ]
        );

        return {
            id: result.insertId,
            player,
            avatar: meta,
            isPermanent: days === 0,
            days
        };
    }

    /**
     * Remove / soft-delete avatar from player's inventory
     */
    async removeAvatar(userAvatarId) {
        await db.query('UPDATE user_avatars SET remove_ava = 1 WHERE Id = ?', [userAvatarId]);
        return true;
    }

    /**
     * Restore / undelete avatar
     */
    async restoreAvatar(userAvatarId) {
        await db.query('UPDATE user_avatars SET remove_ava = 0 WHERE Id = ?', [userAvatarId]);
        return true;
    }

    /**
     * Delete avatar permanently
     */
    async deleteAvatarPermanently(userAvatarId) {
        await db.query('DELETE FROM user_avatars WHERE Id = ?', [userAvatarId]);
        return true;
    }

    /**
     * Mass grant avatar to all online or all players
     */
    async massGrantAvatar({ aId, expireDays = 0, target = 'online', giftSentBy = 0 }) {
        const avatarId = parseInt(aId, 10);
        const meta = this.getAvatar(avatarId);
        if (!meta) throw new Error(`El avatar ID ${avatarId} no existe en el catálogo`);

        const days = parseInt(expireDays, 10) || 0;
        const expireTime = days > 0 ? Date.now() + (days * 86400000) : 0;
        const now = Date.now();

        // Get target account IDs
        let sql = 'SELECT Id FROM accounts';
        if (target === 'online') {
            sql += ' WHERE IsOnline = 1';
        }

        const [accounts] = await db.query(sql);
        if (accounts.length === 0) return { count: 0 };

        const values = accounts.map(acc => [
            acc.Id,
            avatarId,
            meta.type,
            1, // is_cash
            1, // is_gift
            giftSentBy,
            0,
            expireTime,
            now,
            0
        ]);

        await db.query(
            `INSERT INTO user_avatars 
             (UserId, aId, type, is_cash, is_gift, gift_sent_by, amount, expire_time, date_ava_time, remove_ava)
             VALUES ?`,
            [values]
        );

        return {
            count: accounts.length,
            target,
            avatar: meta,
            isPermanent: days === 0
        };
    }
}

module.exports = new InventoryService();
