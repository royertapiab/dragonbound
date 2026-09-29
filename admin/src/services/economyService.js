const crypto = require('crypto');
const db = require('../config/database');

class EconomyService {
    /**
     * Get economy statistics and top rankings
     */
    async getOverview() {
        const [
            [totals],
            [topGold],
            [topCash],
            [topGp],
            [pincodeCount]
        ] = await Promise.all([
            db.query(`SELECT 
                COALESCE(SUM(gold), 0) AS total_gold,
                COALESCE(AVG(gold), 0) AS avg_gold,
                COALESCE(SUM(cash), 0) AS total_cash,
                COALESCE(AVG(cash), 0) AS avg_cash,
                COALESCE(SUM(gp), 0) AS total_gp,
                COALESCE(AVG(gp), 0) AS avg_gp,
                COUNT(*) AS total_users
             FROM users`),
            db.query(`SELECT u.Id, u.IdAcc, u.game_id, u.gold, u.rank, a.Username, a.IsOnline
                      FROM users u JOIN accounts a ON u.IdAcc = a.Id
                      ORDER BY u.gold DESC LIMIT 10`),
            db.query(`SELECT u.Id, u.IdAcc, u.game_id, u.cash, u.rank, a.Username, a.IsOnline
                      FROM users u JOIN accounts a ON u.IdAcc = a.Id
                      ORDER BY u.cash DESC LIMIT 10`),
            db.query(`SELECT u.Id, u.IdAcc, u.game_id, u.gp, u.rank, a.Username, a.IsOnline
                      FROM users u JOIN accounts a ON u.IdAcc = a.Id
                      ORDER BY u.gp DESC LIMIT 10`),
            db.query(`SELECT 
                COUNT(*) AS total_pins,
                SUM(CASE WHEN state = 'ON' THEN 1 ELSE 0 END) AS active_pins
             FROM pin_code`)
        ]);

        return {
            totals: totals[0] || {},
            topGold: topGold || [],
            topCash: topCash || [],
            topGp: topGp || [],
            pinStats: pincodeCount[0] || { total_pins: 0, active_pins: 0 }
        };
    }

    /**
     * Modify currency (Gold, Cash, GP) for a specific player
     */
    async modifyFunds({ userId, type, operation, amount }) {
        const validTypes = ['gold', 'cash', 'gp'];
        const validOps = ['add', 'subtract', 'set'];

        if (!validTypes.includes(type)) throw new Error('Tipo de moneda inválido');
        if (!validOps.includes(operation)) throw new Error('Operación inválida');

        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount < 0) throw new Error('El monto debe ser un entero positivo');

        // Fetch current user
        const [rows] = await db.query(
            `SELECT u.Id, u.IdAcc, u.game_id, u.${type} AS current_val, a.Username
             FROM users u
             JOIN accounts a ON u.IdAcc = a.Id
             WHERE u.Id = ? OR a.Id = ? OR u.game_id = ?
             LIMIT 1`,
            [userId, userId, userId]
        );

        if (rows.length === 0) throw new Error('Jugador no encontrado');
        const user = rows[0];
        const oldVal = user.current_val || 0;
        let newVal = 0;

        if (operation === 'add') {
            newVal = oldVal + parsedAmount;
        } else if (operation === 'subtract') {
            newVal = Math.max(0, oldVal - parsedAmount);
        } else if (operation === 'set') {
            newVal = parsedAmount;
        }

        await db.query(`UPDATE users SET ${type} = ? WHERE Id = ?`, [newVal, user.Id]);

        return {
            user,
            type,
            operation,
            amount: parsedAmount,
            oldVal,
            newVal
        };
    }

    /**
     * Mass airdrop funds to all online players or all players
     */
    async massAirdrop({ target = 'online', type = 'cash', amount = 1000 }) {
        const validTypes = ['gold', 'cash', 'gp'];
        if (!validTypes.includes(type)) throw new Error('Tipo de moneda inválido');

        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount <= 0) throw new Error('Monto inválido');

        let sql = '';
        if (target === 'online') {
            sql = `UPDATE users u
                   JOIN accounts a ON u.IdAcc = a.Id
                   SET u.${type} = u.${type} + ?
                   WHERE a.IsOnline = 1`;
        } else {
            sql = `UPDATE users SET ${type} = ${type} + ?`;
        }

        const [result] = await db.query(sql, [parsedAmount]);
        return {
            affectedRows: result.affectedRows,
            target,
            type,
            amount: parsedAmount
        };
    }

    /**
     * List PIN Codes
     */
    async listPinCodes({ page = 1, limit = 20, state = '' }) {
        const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
        const params = [];
        let where = '1=1';

        if (state) {
            where += ' AND p.state = ?';
            params.push(state);
        }

        const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM pin_code p WHERE ${where}`, params);
        const total = countRows[0].total || 0;

        params.push(parseInt(limit, 10), offset);
        const [pins] = await db.query(
            `SELECT p.*, a.Username AS used_by_username
             FROM pin_code p
             LEFT JOIN accounts a ON p.used_by = a.Id
             WHERE ${where}
             ORDER BY p.id DESC
             LIMIT ? OFFSET ?`,
            params
        );

        return {
            pins,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit) || 1
        };
    }

    /**
     * Generate PIN code
     */
    async createPinCode({ pin = '', seller = 'Admin', gm = 'Admin', gm_id = 0, rode = 10000 }) {
        const parsedRode = parseInt(rode, 10);
        if (isNaN(parsedRode) || parsedRode < 1000) {
            throw new Error('Monto de Cash debe ser al menos 1,000');
        }

        let pinCode = pin.trim();
        if (!pinCode) {
            // Auto generate standard DragonBound PIN format: DB10-XXXX-XXXX-XXXX
            const prefix = 'DB' + String(parsedRode).substring(0, 2);
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const rnd = (len) => {
                let s = '';
                const bytes = crypto.randomBytes(len);
                for (let i = 0; i < len; i++) {
                    s += chars[bytes[i] % chars.length];
                }
                return s;
            };
            pinCode = `${prefix}-${rnd(4)}-${rnd(4)}-${rnd(4)}`;
        }

        const nowSec = Math.round(Date.now() / 1000);

        const [result] = await db.query(
            `INSERT INTO pin_code (pin, seller, gm, gm_id, rode, state, date_time)
             VALUES (?, ?, ?, ?, ?, 'ON', ?)`,
            [pinCode, seller, gm, gm_id, String(parsedRode), nowSec]
        );

        return {
            id: result.insertId,
            pin: pinCode,
            rode: parsedRode
        };
    }

    /**
     * Delete PIN Code
     */
    async deletePinCode(id) {
        await db.query('DELETE FROM pin_code WHERE id = ?', [id]);
        return true;
    }
}

module.exports = new EconomyService();
