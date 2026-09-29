const serverControlService = require('../services/serverControlService');
const auditService = require('../services/auditService');

class ServerController {
    /**
     * Servers & processes overview
     */
    async index(req, res) {
        try {
            const status = await serverControlService.getDetailedStatus();

            res.render('servers/index', {
                pageTitle: 'Servidores & Procesos',
                system: status.system,
                services: status.services,
                channels: status.channels
            });
        } catch (error) {
            console.error('[ServerController] Error:', error);
            req.flash('error', 'Error al consultar estado de servidores.');
            res.redirect('/');
        }
    }

    /**
     * Restart Game Server
     */
    async restartGame(req, res) {
        try {
            await serverControlService.restartGameServer();

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'server.restart_game',
                targetType: 'service',
                targetId: null,
                targetGameId: 'GameServer-9001',
                oldValue: null,
                newValue: { status: 'restarted' },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Servidor de Juego (WebSocket 9001) reiniciado exitosamente.');
            res.redirect('/servers');
        } catch (error) {
            req.flash('error', error.message || 'Error al reiniciar Game Server.');
            res.redirect('/servers');
        }
    }

    /**
     * Restart Web Server
     */
    async restartWeb(req, res) {
        try {
            await serverControlService.restartWebServer();

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'server.restart_web',
                targetType: 'service',
                targetId: null,
                targetGameId: 'WebServer-3000',
                oldValue: null,
                newValue: { status: 'restarted' },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Servidor Web (HTTP 3000) reiniciado exitosamente.');
            res.redirect('/servers');
        } catch (error) {
            req.flash('error', error.message || 'Error al reiniciar Web Server.');
            res.redirect('/servers');
        }
    }

    /**
     * Restart Ranking Scheduler
     */
    async restartScheduler(req, res) {
        try {
            await serverControlService.restartScheduler();

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'server.restart_scheduler',
                targetType: 'service',
                targetId: null,
                targetGameId: 'Scheduler',
                oldValue: null,
                newValue: { status: 'restarted' },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Programador de Rangos (Scheduler) reiniciado exitosamente.');
            res.redirect('/servers');
        } catch (error) {
            req.flash('error', error.message || 'Error al reiniciar Scheduler.');
            res.redirect('/servers');
        }
    }

    /**
     * Run Ranking calculation now
     */
    async runRankings(req, res) {
        try {
            const result = await serverControlService.runRankingScript();

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'server.run_rankings',
                targetType: 'script',
                targetId: null,
                targetGameId: 'rankingscript.js',
                oldValue: null,
                newValue: { success: result.success },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            if (result.success) {
                req.flash('success', 'Cálculo y actualización de rangos ejecutado con éxito.');
            } else {
                req.flash('error', `Aviso durante la ejecución: ${result.output.substring(0, 100)}`);
            }

            res.redirect('/servers');
        } catch (error) {
            req.flash('error', error.message || 'Error al ejecutar cálculo de rangos.');
            res.redirect('/servers');
        }
    }
}

module.exports = new ServerController();
