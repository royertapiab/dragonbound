const { exec } = require('child_process');
const systemService = require('./systemService');

class ServerControlService {
    /**
     * Get detailed status of all services & multiworld channels
     */
    async getDetailedStatus() {
        const sysInfo = await systemService.getSystemStatus();

        const channels = [
            { id: 1, name: 'Servidor 1', mode: 'Normal', type: 'Libre', max: 900 },
            { id: 2, name: 'Servidor 2', mode: 'Holiday', type: 'Evento', max: 900 },
            { id: 3, name: 'Servidor 3', mode: 'Betting', type: 'Apuestas', max: 900 },
            { id: 4, name: 'Servidor 4', mode: 'All', type: 'General', max: 900 },
            { id: 5, name: 'Servidor 5', mode: 'Prix', type: 'Torneo', max: 900 },
            { id: 6, name: 'Servidor 6', mode: 'Bunge', type: 'Bunge Only', max: 900 },
            { id: 7, name: 'Servidor 7', mode: 'Avatar On', type: 'Stats Activos', max: 900 },
            { id: 8, name: 'Servidor 8', mode: 'All', type: 'General', max: 900 },
            { id: 9, name: 'Servidor 9', mode: 'Aduka', type: 'Aduka Only', max: 900 },
            { id: 10, name: 'Servidor 10', mode: 'On', type: 'Stats Activos', max: 900 },
            { id: 11, name: 'Servidor 11', mode: 'Off', type: 'Stats Desactivados', max: 900 },
            { id: 12, name: 'Servidor 12', mode: 'Prix', type: 'Torneo Semanal', max: 900 }
        ];

        return {
            ...sysInfo,
            channels
        };
    }

    /**
     * Restart Game Server
     */
    restartGameServer() {
        return new Promise((resolve, reject) => {
            const cmd = `pkill -f "node src/game.js" ; sleep 1 ; cd /var/www/dragonbound && nohup /usr/bin/node src/game.js >> /var/log/dragonbound_game.log 2>&1 &`;
            exec(cmd, (err, stdout, stderr) => {
                if (err && !err.killed) {
                    // pkill might return 1 if process wasn't running, which is fine
                    console.log('[ServerControl] Restart game output:', stdout || stderr);
                }
                setTimeout(() => resolve(true), 1500);
            });
        });
    }

    /**
     * Restart Web Server
     */
    restartWebServer() {
        return new Promise((resolve, reject) => {
            const cmd = `pkill -f "node src/web/main/server.js" ; sleep 1 ; cd /var/www/dragonbound && nohup /usr/bin/node src/web/main/server.js >> /var/log/dragonbound_web.log 2>&1 &`;
            exec(cmd, (err, stdout, stderr) => {
                if (err && !err.killed) {
                    console.log('[ServerControl] Restart web output:', stdout || stderr);
                }
                setTimeout(() => resolve(true), 1500);
            });
        });
    }

    /**
     * Restart Scheduler
     */
    restartScheduler() {
        return new Promise((resolve, reject) => {
            const cmd = `pkill -f "node src/ranking/scheduler.js" ; sleep 1 ; cd /var/www/dragonbound && nohup /usr/bin/node src/ranking/scheduler.js >> /var/log/dragonbound_scheduler.log 2>&1 &`;
            exec(cmd, (err, stdout, stderr) => {
                if (err && !err.killed) {
                    console.log('[ServerControl] Restart scheduler output:', stdout || stderr);
                }
                setTimeout(() => resolve(true), 1500);
            });
        });
    }

    /**
     * Force run ranking calculation
     */
    runRankingScript() {
        return new Promise((resolve, reject) => {
            const cmd = `cd /var/www/dragonbound && /usr/bin/node src/ranking/rankingscript.js`;
            exec(cmd, { timeout: 30000 }, (err, stdout, stderr) => {
                if (err) {
                    return resolve({ success: false, output: stderr || err.message });
                }
                resolve({ success: true, output: stdout });
            });
        });
    }
}

module.exports = new ServerControlService();
