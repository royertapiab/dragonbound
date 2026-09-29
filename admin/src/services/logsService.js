const { exec } = require('child_process');
const fs = require('fs');

const LOG_MAP = {
    game: { path: '/var/log/dragonbound_game.log', label: 'Game Server Log' },
    web: { path: '/var/log/dragonbound_web.log', label: 'Web Server Log' },
    scheduler: { path: '/var/log/dragonbound_scheduler.log', label: 'Ranking Scheduler Log' },
    admin: { path: '/var/log/dragonbound_admin.log', label: 'Admin Panel Log' },
    gametxt: { path: '/var/www/dragonbound/game.txt', label: 'Game Chat & Rooms (game.txt)' }
};

class LogsService {
    getAvailableLogs() {
        return LOG_MAP;
    }

    /**
     * Get tail of specific log file
     */
    getTail(type = 'game', lines = 100) {
        return new Promise((resolve) => {
            const logEntry = LOG_MAP[type] || LOG_MAP.game;
            const targetLines = Math.min(500, Math.max(10, parseInt(lines, 10) || 100));

            if (!fs.existsSync(logEntry.path)) {
                return resolve({
                    type,
                    label: logEntry.label,
                    path: logEntry.path,
                    content: `[Archivo no encontrado: ${logEntry.path}]`,
                    lines: 0
                });
            }

            exec(`tail -n ${targetLines} "${logEntry.path}"`, { maxBuffer: 1024 * 1024 * 2 }, (err, stdout, stderr) => {
                if (err) {
                    return resolve({
                        type,
                        label: logEntry.label,
                        path: logEntry.path,
                        content: `[Error al leer archivo: ${stderr || err.message}]`,
                        lines: 0
                    });
                }

                resolve({
                    type,
                    label: logEntry.label,
                    path: logEntry.path,
                    content: stdout,
                    lines: stdout.split('\n').length
                });
            });
        });
    }
}

module.exports = new LogsService();
