const moderationService = require('../services/moderationService');
const auditService = require('../services/auditService');
const { formatDate, getRankInfo } = require('../utils/viewHelpers');

class ModerationController {
    /**
     * Moderation dashboard & active bans
     */
    async index(req, res) {
        try {
            const { page = 1, search } = req.query;
            const [bansData, mutedPlayers] = await Promise.all([
                moderationService.getBans({ page, limit: 20, search }),
                moderationService.getMutedPlayers()
            ]);

            res.render('moderation/index', {
                pageTitle: 'Moderación & Sanciones',
                bans: bansData.bans,
                mutedPlayers,
                pagination: {
                    total: bansData.total,
                    page: bansData.page,
                    limit: bansData.limit,
                    totalPages: bansData.totalPages
                },
                filters: { search },
                formatDate,
                getRankInfo
            });
        } catch (error) {
            console.error('[ModerationController] Error:', error);
            req.flash('error', 'Error al cargar panel de moderación.');
            res.redirect('/');
        }
    }

    /**
     * Ban a player
     */
    async ban(req, res) {
        try {
            const { userId, reason, duration } = req.body;
            const result = await moderationService.banPlayer({
                userId,
                reason,
                duration,
                gmName: req.session.admin.gameId,
                gmId: req.session.admin.userId
            });

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'moderation.ban',
                targetType: 'user',
                targetId: result.player.game_user_id,
                targetGameId: result.player.game_id,
                oldValue: { banned: 0 },
                newValue: { banned: 1, reason, duration: result.duration },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Jugador ${result.player.game_id} baneado exitosamente (${duration === 'Forever' ? 'Permanente' : duration + ' días'}).`);
            res.redirect('/moderation');
        } catch (error) {
            req.flash('error', error.message || 'Error al banear jugador.');
            res.redirect('/moderation');
        }
    }

    /**
     * Unban player
     */
    async unban(req, res) {
        try {
            const { userId } = req.body;
            const player = await moderationService.unbanPlayer(userId);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'moderation.unban',
                targetType: 'user',
                targetId: player.game_user_id,
                targetGameId: player.game_id,
                oldValue: { banned: 1 },
                newValue: { banned: 0 },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Baneo removido para ${player.game_id}.`);
            res.redirect('/moderation');
        } catch (error) {
            req.flash('error', error.message || 'Error al desbanear jugador.');
            res.redirect('/moderation');
        }
    }

    /**
     * List IP bans
     */
    async ipBans(req, res) {
        try {
            const { page = 1 } = req.query;
            const data = await moderationService.getIpBans({ page, limit: 20 });

            res.render('moderation/ip-bans', {
                pageTitle: 'Bloqueo de Direcciones IP',
                ipBans: data.ipBans,
                pagination: {
                    total: data.total,
                    page: data.page,
                    limit: data.limit,
                    totalPages: data.totalPages
                }
            });
        } catch (error) {
            console.error('[ModerationController] Error:', error);
            req.flash('error', 'Error al cargar baneos de IP.');
            res.redirect('/moderation');
        }
    }

    /**
     * Add IP ban
     */
    async banIp(req, res) {
        try {
            const { ip, reason } = req.body;
            const result = await moderationService.banIp({
                ip,
                reason,
                gm: req.session.admin.gameId,
                gmId: req.session.admin.userId
            });

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'moderation.ban_ip',
                targetType: 'ip',
                targetId: result.id,
                targetGameId: result.ip,
                oldValue: null,
                newValue: { ip: result.ip, reason: result.reason },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Dirección IP ${result.ip} bloqueada.`);
            res.redirect('/moderation/ip-bans');
        } catch (error) {
            req.flash('error', error.message || 'Error al banear IP.');
            res.redirect('/moderation/ip-bans');
        }
    }

    /**
     * Unban IP
     */
    async unbanIp(req, res) {
        try {
            await moderationService.unbanIp(req.params.id);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'moderation.unban_ip',
                targetType: 'ip',
                targetId: req.params.id,
                targetGameId: null,
                oldValue: null,
                newValue: { deletedIpId: req.params.id },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Dirección IP desbloqueada correctamente.');
            res.redirect('/moderation/ip-bans');
        } catch (error) {
            req.flash('error', error.message || 'Error al desbanear IP.');
            res.redirect('/moderation/ip-bans');
        }
    }

    /**
     * Active online sessions
     */
    async sessions(req, res) {
        try {
            const sessions = await moderationService.getOnlineSessions();
            res.render('moderation/sessions', {
                pageTitle: 'Sesiones Activas (Online)',
                sessions,
                getRankInfo
            });
        } catch (error) {
            console.error('[ModerationController] Error:', error);
            req.flash('error', 'Error al cargar sesiones activas.');
            res.redirect('/moderation');
        }
    }

    /**
     * Kick session
     */
    async kickSession(req, res) {
        try {
            await moderationService.kickSession(req.params.id);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'moderation.kick_session',
                targetType: 'account',
                targetId: req.params.id,
                targetGameId: null,
                oldValue: { IsOnline: 1 },
                newValue: { IsOnline: 0 },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Sesión cerrada y jugador desconectado.');
            res.redirect('/moderation/sessions');
        } catch (error) {
            req.flash('error', error.message || 'Error al expulsar sesión.');
            res.redirect('/moderation/sessions');
        }
    }

    /**
     * Unmute player
     */
    async unmute(req, res) {
        try {
            const { userId } = req.body;
            await moderationService.unmutePlayer(userId);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'moderation.unmute',
                targetType: 'user',
                targetId: userId,
                targetGameId: null,
                oldValue: { is_muted: '1' },
                newValue: { is_muted: '0' },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Silencio removido correctamente.');
            res.redirect('/moderation');
        } catch (error) {
            req.flash('error', error.message || 'Error al remover silencio.');
            res.redirect('/moderation');
        }
    }
}

module.exports = new ModerationController();
