/**
 * Clean all users from the system, leaving only:
 * - Destroyer: Account #1 / User #1 (Admin / OWNER)
 * - 1nsane: Account #2 / User #2 (Admin / ADMIN)
 */

const mysql = require('mysql2/promise');

async function main() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'dragonbound',
            password: 'f4434fea8ee156f9d9cd22dce841484a',
            database: 'dragonbound',
            multipleStatements: true
        });
        console.log('[+] Connected to MariaDB dragonbound.');

        // Step 1: Verify current existence of Destroyer and 1nsane
        const [destroAcc] = await conn.query("SELECT * FROM accounts WHERE Username = 'Destroyer'");
        const [insaneAcc] = await conn.query("SELECT * FROM accounts WHERE Username = '1nsane'");

        if (destroAcc.length === 0) {
            throw new Error("Account 'Destroyer' not found!");
        }
        if (insaneAcc.length === 0) {
            throw new Error("Account '1nsane' not found!");
        }

        const oldDestroAccId = destroAcc[0].Id;
        const oldInsaneAccId = insaneAcc[0].Id;

        const [destroUser] = await conn.query("SELECT * FROM users WHERE IdAcc = ?", [oldDestroAccId]);
        const [insaneUser] = await conn.query("SELECT * FROM users WHERE IdAcc = ?", [oldInsaneAccId]);

        if (destroUser.length === 0) {
            throw new Error("User 'Destroyer' not found in users table!");
        }
        if (insaneUser.length === 0) {
            throw new Error("User '1nsane' not found in users table!");
        }

        const oldDestroUserId = destroUser[0].Id;
        const oldInsaneUserId = insaneUser[0].Id;

        console.log(`[+] Current Destroyer: AccId=${oldDestroAccId}, UserId=${oldDestroUserId}`);
        console.log(`[+] Current 1nsane: AccId=${oldInsaneAccId}, UserId=${oldInsaneUserId}`);

        await conn.query("SET FOREIGN_KEY_CHECKS = 0;");

        // Step 2: Clean and re-index accounts
        console.log('[+] Cleaning accounts...');
        await conn.query("DELETE FROM accounts WHERE Id NOT IN (?, ?)", [oldDestroAccId, oldInsaneAccId]);
        await conn.query("UPDATE accounts SET Id = 1, Name = 'Destroyer' WHERE Id = ?", [oldDestroAccId]);
        await conn.query("UPDATE accounts SET Id = 2, Name = '1nsane' WHERE Id = ?", [oldInsaneAccId]);
        await conn.query("ALTER TABLE accounts AUTO_INCREMENT = 3;");

        // Step 3: Clean and re-index users
        console.log('[+] Cleaning users...');
        await conn.query("DELETE FROM users WHERE Id NOT IN (?, ?)", [oldDestroUserId, oldInsaneUserId]);
        await conn.query("UPDATE users SET Id = 1, IdAcc = 1, game_id = 'Destroyer', gm = 1 WHERE Id = ?", [oldDestroUserId]);
        await conn.query("UPDATE users SET Id = 2, IdAcc = 2, game_id = '1nsane', gm = 1 WHERE Id = ?", [oldInsaneUserId]);
        await conn.query("ALTER TABLE users AUTO_INCREMENT = 3;");

        // Step 4: User avatars
        console.log('[+] Updating user_avatars...');
        await conn.query("UPDATE user_avatars SET UserId = 1 WHERE UserId = ?", [oldDestroAccId]);
        await conn.query("UPDATE user_avatars SET UserId = 2 WHERE UserId = ?", [oldInsaneAccId]);
        await conn.query("UPDATE user_avatars SET gift_sent_by = 1 WHERE gift_sent_by = ?", [oldDestroAccId]);
        await conn.query("UPDATE user_avatars SET gift_sent_by = 2 WHERE gift_sent_by = ?", [oldInsaneAccId]);
        await conn.query("DELETE FROM user_avatars WHERE UserId NOT IN (1, 2);");

        // Ensure default body/head avatars exist for 1nsane if missing
        await conn.query(`
            INSERT INTO user_avatars (UserId, aId, type, is_cash, is_gift, amount, expire_time)
            SELECT 2, 2, 1, 0, 0, 0, 0 FROM DUAL
            WHERE NOT EXISTS (SELECT 1 FROM user_avatars WHERE UserId = 2 AND aId = 2)
        `);
        await conn.query(`
            INSERT INTO user_avatars (UserId, aId, type, is_cash, is_gift, amount, expire_time)
            SELECT 2, 1, 0, 0, 0, 0, 0 FROM DUAL
            WHERE NOT EXISTS (SELECT 1 FROM user_avatars WHERE UserId = 2 AND aId = 1)
        `);

        // Step 5: User avatar equiped
        console.log('[+] Updating user_avatar_equiped...');
        await conn.query("DELETE FROM user_avatar_equiped WHERE Id NOT IN (?, ?)", [oldDestroUserId, oldInsaneUserId]);
        await conn.query("UPDATE user_avatar_equiped SET Id = 1 WHERE Id = ?", [oldDestroUserId]);
        await conn.query("UPDATE user_avatar_equiped SET Id = 2 WHERE Id = ?", [oldInsaneUserId]);

        // Step 6: Admin users & roles
        console.log('[+] Updating admin_users...');
        await conn.query("DELETE FROM admin_users;");
        await conn.query(`
            INSERT INTO admin_users (id, user_id, role_id, is_active, created_by, created_at, updated_at)
            VALUES 
            (1, 1, 1, 1, 1, NOW(), NOW()),
            (2, 2, 2, 1, 1, NOW(), NOW())
        `);
        await conn.query("ALTER TABLE admin_users AUTO_INCREMENT = 3;");

        // Step 7: Guilds & Guild members
        console.log('[+] Updating guild and guild_member...');
        await conn.query("DELETE FROM guild WHERE Id != 1;");
        await conn.query("UPDATE guild SET members = 2, points = 0 WHERE Id = 1;");
        await conn.query("DELETE FROM guild_member;");
        await conn.query(`
            INSERT INTO guild_member (rowsec, Id, UserId, Job)
            VALUES
            (1, 1, 1, 1),
            (2, 1, 2, 2)
        `);
        await conn.query("ALTER TABLE guild_member AUTO_INCREMENT = 3;");

        // Step 8: Truncate orphan/temporary data tables
        console.log('[+] Truncating old session, social, and log tables...');
        const tablesToTruncate = [
            'account_sessions',
            'admin_sessions',
            'sessions',
            'friends',
            'relationship',
            'games',
            'user_post',
            'user_post_comment',
            'comment_post',
            'guests',
            'banned',
            'ip_user_banned',
            'my_payments',
            'chat_reseller',
            'commands',
            'rankspecial',
            'pin_code',
            'screenshot_game',
            'view_replay',
            'guild_coins',
            'admin_audit_log'
        ];

        for (const tbl of tablesToTruncate) {
            await conn.query(`TRUNCATE TABLE \`${tbl}\`;`);
            console.log(`    - Truncated ${tbl}`);
        }

        await conn.query("SET FOREIGN_KEY_CHECKS = 1;");
        console.log('[✓] Migration and cleanup successfully completed!');
    } catch (err) {
        console.error('[!] Error during migration:', err);
        process.exit(1);
    } finally {
        if (conn) {
            await conn.end();
        }
        process.exit(0);
    }
}

main();
