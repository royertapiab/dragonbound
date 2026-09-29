const os = require('os');
const fs = require('fs');
const net = require('net');
const { exec } = require('child_process');
const db = require('../config/database');

class SystemService {
    /**
     * Test if a TCP port is open locally
     */
    checkPort(port, host = '127.0.0.1', timeoutMs = 800) {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(timeoutMs);
            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });
            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });
            socket.on('error', () => {
                socket.destroy();
                resolve(false);
            });
            socket.connect(port, host);
        });
    }

    /**
     * Check if a process pattern is running
     */
    checkProcess(pattern) {
        return new Promise((resolve) => {
            exec(`pgrep -f "${pattern}"`, (err, stdout) => {
                if (err || !stdout.trim()) {
                    resolve({ running: false, pids: [] });
                } else {
                    const pids = stdout.trim().split('\n').map(p => parseInt(p, 10)).filter(Boolean);
                    resolve({ running: pids.length > 0, pids });
                }
            });
        });
    }

    /**
     * Get disk usage for root partition /
     */
    getDiskUsage() {
        return new Promise((resolve) => {
            fs.statfs('/', (err, stats) => {
                if (err) {
                    return resolve({ total: 0, free: 0, used: 0, percent: 0 });
                }
                const total = stats.blocks * stats.bsize;
                const free = stats.bavail * stats.bsize;
                const used = total - free;
                const percent = total > 0 ? Math.round((used / total) * 100) : 0;
                resolve({
                    totalGb: (total / (1024 ** 3)).toFixed(1),
                    freeGb: (free / (1024 ** 3)).toFixed(1),
                    usedGb: (used / (1024 ** 3)).toFixed(1),
                    percent
                });
            });
        });
    }

    /**
     * Get system and hardware status
     */
    async getSystemStatus() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPercent = Math.round((usedMem / totalMem) * 100);

        const loadAvg = os.loadavg();
        const cpus = os.cpus();
        const uptimeSec = os.uptime();

        const days = Math.floor(uptimeSec / 86400);
        const hours = Math.floor((uptimeSec % 86400) / 3600);
        const minutes = Math.floor((uptimeSec % 3600) / 60);
        const uptimeFormatted = `${days}d ${hours}h ${minutes}m`;

        const disk = await this.getDiskUsage();

        // Check services
        const [gamePort, webPort, dbPort, schedProc, nginxProc] = await Promise.all([
            this.checkPort(9001),
            this.checkPort(3000),
            this.checkPort(3306),
            this.checkProcess('scheduler.js'),
            this.checkProcess('nginx')
        ]);

        return {
            system: {
                hostname: os.hostname(),
                platform: `${os.type()} ${os.release()} (${os.arch()})`,
                uptime: uptimeFormatted,
                uptimeSeconds: uptimeSec,
                cpuCount: cpus.length,
                cpuModel: cpus[0] ? cpus[0].model : 'Unknown',
                loadAverage: [loadAvg[0].toFixed(2), loadAvg[1].toFixed(2), loadAvg[2].toFixed(2)],
                ram: {
                    totalGb: (totalMem / (1024 ** 3)).toFixed(2),
                    usedGb: (usedMem / (1024 ** 3)).toFixed(2),
                    freeGb: (freeMem / (1024 ** 3)).toFixed(2),
                    percent: memPercent
                },
                disk
            },
            services: {
                gameServer: {
                    name: 'Game Server',
                    port: 9001,
                    status: gamePort ? 'online' : 'offline',
                    healthy: gamePort
                },
                webServer: {
                    name: 'Web Server',
                    port: 3000,
                    status: webPort ? 'online' : 'offline',
                    healthy: webPort
                },
                scheduler: {
                    name: 'Scheduler (Rankings)',
                    status: schedProc.running ? 'online' : 'offline',
                    pids: schedProc.pids,
                    healthy: schedProc.running
                },
                database: {
                    name: 'MariaDB',
                    port: 3306,
                    status: dbPort ? 'online' : 'offline',
                    healthy: dbPort
                },
                nginx: {
                    name: 'Nginx Reverse Proxy',
                    status: nginxProc.running ? 'online' : 'offline',
                    healthy: nginxProc.running
                }
            }
        };
    }

    /**
     * Get game and economy metrics
     */
    async getGameMetrics() {
        try {
            const [
                [accStats],
                [gameStats],
                [guildStats],
                [banStats],
                [econStats],
                [recentLogins]
            ] = await Promise.all([
                db.query(`SELECT 
                    COUNT(*) AS total_accounts,
                    SUM(CASE WHEN IsOnline = 1 THEN 1 ELSE 0 END) AS online_accounts
                    FROM accounts`),
                db.query(`SELECT COUNT(*) AS total_games FROM games`),
                db.query(`SELECT COUNT(*) AS total_guilds FROM guild`),
                db.query(`SELECT COUNT(*) AS total_banned FROM users WHERE banned = 1`),
                db.query(`SELECT 
                    COALESCE(SUM(gold), 0) AS total_gold,
                    COALESCE(SUM(cash), 0) AS total_cash,
                    COALESCE(SUM(gp), 0) AS total_gp
                    FROM users`),
                db.query(`SELECT u.Id, u.game_id, u.rank, u.gm, a.IsOnline, a.Username
                          FROM users u
                          JOIN accounts a ON u.IdAcc = a.Id
                          ORDER BY u.Id DESC
                          LIMIT 5`)
            ]);

            return {
                totalAccounts: accStats[0].total_accounts || 0,
                onlineAccounts: accStats[0].online_accounts || 0,
                totalGames: gameStats[0].total_games || 0,
                totalGuilds: guildStats[0].total_guilds || 0,
                totalBanned: banStats[0].total_banned || 0,
                totalGold: Number(econStats[0].total_gold || 0),
                totalCash: Number(econStats[0].total_cash || 0),
                totalGp: Number(econStats[0].total_gp || 0),
                recentUsers: recentLogins || []
            };
        } catch (error) {
            console.error('[SystemService] Error fetching game metrics:', error.message);
            return {
                totalAccounts: 0,
                onlineAccounts: 0,
                totalGames: 0,
                totalGuilds: 0,
                totalBanned: 0,
                totalGold: 0,
                totalCash: 0,
                totalGp: 0,
                recentUsers: []
            };
        }
    }
}

module.exports = new SystemService();
