const playerService = require('../services/playerService');
const auditService = require('../services/auditService');
const { RANKS, getRankInfo } = require('../utils/viewHelpers');

class PlayerController {
    /**
     * List players
     */
    async index(req, res) {
        try {
            const { search, rank, gm, banned, isOnline, page = 1 } = req.query;
            const data = await playerService.listPlayers({
                search,
                rank,
                gm,
                banned,
                isOnline,
                page,
                limit: 25
            });

            res.render('players/index', {
                pageTitle: 'Gestión de Jugadores',
                players: data.players,
                pagination: {
                    total: data.total,
                    page: data.page,
                    limit: data.limit,
                    totalPages: data.totalPages
                },
                filters: { search, rank, gm, banned, isOnline },
                ranks: RANKS
            });
        } catch (error) {
            console.error('[PlayerController] Error:', error);
            req.flash('error', 'Error al cargar lista de jugadores.');
            res.redirect('/');
        }
    }

    /**
     * View player profile
     */
    async show(req, res) {
        try {
            const player = await playerService.getPlayer(req.params.id);
            if (!player) {
                req.flash('error', 'Jugador no encontrado.');
                return res.redirect('/players');
            }

            res.render('players/show', {
                pageTitle: `Jugador: ${player.game_id}`,
                player,
                ranks: RANKS,
                rankInfo: getRankInfo(player.rank)
            });
        } catch (error) {
            console.error('[PlayerController] Error:', error);
            req.flash('error', 'Error al cargar perfil del jugador.');
            res.redirect('/players');
        }
    }

    /**
     * Update basic profile info
     */
    async update(req, res) {
        try {
            const { game_id, email, gender, country, power_user } = req.body;
            const player = await playerService.getPlayer(req.params.id);

            await playerService.updatePlayer(req.params.id, {
                game_id,
                email,
                gender,
                country,
                power_user
            });

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'player.edit',
                targetType: 'user',
                targetId: player.Id,
                targetGameId: player.game_id,
                oldValue: { game_id: player.game_id, email: player.Email, gender: player.gender, country: player.country, power_user: player.power_user },
                newValue: { game_id, email, gender, country, power_user },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Perfil de jugador actualizado correctamente.');
            res.redirect(`/players/${player.Id}`);
        } catch (error) {
            req.flash('error', error.message || 'Error al actualizar perfil.');
            res.redirect(`/players/${req.params.id}`);
        }
    }

    /**
     * Change visual rank
     */
    async updateRank(req, res) {
        try {
            const { rank } = req.body;
            const player = await playerService.getPlayer(req.params.id);

            await playerService.updateRank(req.params.id, rank);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'player.change_rank',
                targetType: 'user',
                targetId: player.Id,
                targetGameId: player.game_id,
                oldValue: { rank: player.rank },
                newValue: { rank: parseInt(rank, 10) },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Rango actualizado a ${getRankInfo(rank).name}.`);
            res.redirect(`/players/${player.Id}`);
        } catch (error) {
            req.flash('error', error.message || 'Error al cambiar rango.');
            res.redirect(`/players/${req.params.id}`);
        }
    }

    /**
     * Toggle GM status
     */
    async toggleGM(req, res) {
        try {
            const { gm } = req.body;
            const player = await playerService.getPlayer(req.params.id);

            await playerService.toggleGM(req.params.id, gm);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'player.toggle_gm',
                targetType: 'user',
                targetId: player.Id,
                targetGameId: player.game_id,
                oldValue: { gm: player.gm },
                newValue: { gm: parseInt(gm, 10) },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Estado GM actualizado para ${player.game_id}.`);
            res.redirect(`/players/${player.Id}`);
        } catch (error) {
            req.flash('error', error.message || 'Error al alternar GM.');
            res.redirect(`/players/${req.params.id}`);
        }
    }

    /**
     * Reset password
     */
    async resetPassword(req, res) {
        try {
            const { password } = req.body;
            const player = await playerService.getPlayer(req.params.id);

            await playerService.resetPassword(req.params.id, password);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'player.reset_password',
                targetType: 'account',
                targetId: player.IdAcc,
                targetGameId: player.game_id,
                oldValue: null,
                newValue: 'Password Changed',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Contraseña de acceso actualizada correctamente.`);
            res.redirect(`/players/${player.Id}`);
        } catch (error) {
            req.flash('error', error.message || 'Error al cambiar contraseña.');
            res.redirect(`/players/${req.params.id}`);
        }
    }

    /**
     * Toggle mute
     */
    async toggleMute(req, res) {
        try {
            const { is_muted } = req.body;
            const player = await playerService.getPlayer(req.params.id);

            await playerService.updateMute(req.params.id, is_muted === '1');

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: is_muted === '1' ? 'moderation.mute' : 'moderation.unmute',
                targetType: 'user',
                targetId: player.Id,
                targetGameId: player.game_id,
                oldValue: { is_muted: player.is_muted },
                newValue: { is_muted },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', is_muted === '1' ? 'Jugador silenciado del chat.' : 'Silencio removido.');
            res.redirect(`/players/${player.Id}`);
        } catch (error) {
            req.flash('error', error.message || 'Error al mutear jugador.');
            res.redirect(`/players/${req.params.id}`);
        }
    }

    /**
     * Kick player session
     */
    async kick(req, res) {
        try {
            const player = await playerService.getPlayer(req.params.id);
            await playerService.kickPlayer(req.params.id);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'moderation.kick',
                targetType: 'account',
                targetId: player.IdAcc,
                targetGameId: player.game_id,
                oldValue: { IsOnline: player.IsOnline },
                newValue: { IsOnline: 0 },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Sesión de ${player.game_id} desconectada.`);
            res.redirect(`/players/${player.Id}`);
        } catch (error) {
            req.flash('error', error.message || 'Error al desconectar jugador.');
            res.redirect(`/players/${req.params.id}`);
        }
    }
}

module.exports = new PlayerController();
