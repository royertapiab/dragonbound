const guildService = require('../services/guildService');
const auditService = require('../services/auditService');
const { formatNumber, getRankInfo } = require('../utils/viewHelpers');

class GuildController {
    /**
     * List all guilds
     */
    async index(req, res) {
        try {
            const { search, page = 1 } = req.query;
            const data = await guildService.listGuilds({ search, page, limit: 20 });

            res.render('guilds/index', {
                pageTitle: 'Gestión de Gremios / Clanes',
                guilds: data.guilds,
                pagination: {
                    total: data.total,
                    page: data.page,
                    limit: data.limit,
                    totalPages: data.totalPages
                },
                filters: { search },
                formatNumber
            });
        } catch (error) {
            console.error('[GuildController] Error:', error);
            req.flash('error', 'Error al cargar lista de gremios.');
            res.redirect('/');
        }
    }

    /**
     * Guild details & roster
     */
    async show(req, res) {
        try {
            const guild = await guildService.getGuild(req.params.id);
            if (!guild) {
                req.flash('error', 'Gremio no encontrado.');
                return res.redirect('/guilds');
            }

            res.render('guilds/show', {
                pageTitle: `Gremio: ${guild.Name}`,
                guild,
                formatNumber,
                getRankInfo
            });
        } catch (error) {
            console.error('[GuildController] Error:', error);
            req.flash('error', 'Error al cargar detalles del gremio.');
            res.redirect('/guilds');
        }
    }

    /**
     * Update guild details
     */
    async update(req, res) {
        try {
            const { name, points, rank, img, fondo, about, website } = req.body;
            await guildService.updateGuild(req.params.id, {
                name,
                points,
                rank,
                img,
                fondo,
                about,
                website
            });

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'guild.edit',
                targetType: 'guild',
                targetId: req.params.id,
                targetGameId: name,
                oldValue: null,
                newValue: { name, points, rank },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Datos del gremio actualizados correctamente.');
            res.redirect(`/guilds/${req.params.id}`);
        } catch (error) {
            req.flash('error', error.message || 'Error al actualizar gremio.');
            res.redirect(`/guilds/${req.params.id}`);
        }
    }

    /**
     * Remove member from guild
     */
    async removeMember(req, res) {
        try {
            await guildService.removeMember(req.params.id, req.params.userId);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'guild.remove_member',
                targetType: 'guild',
                targetId: req.params.id,
                targetGameId: req.params.userId,
                oldValue: null,
                newValue: { removedUserId: req.params.userId },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Miembro expulsado del gremio.');
            res.redirect(`/guilds/${req.params.id}`);
        } catch (error) {
            req.flash('error', error.message || 'Error al expulsar miembro.');
            res.redirect(`/guilds/${req.params.id}`);
        }
    }

    /**
     * Transfer leadership
     */
    async transferMaster(req, res) {
        try {
            const { newMasterUserId } = req.body;
            await guildService.transferMaster(req.params.id, newMasterUserId);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'guild.transfer_master',
                targetType: 'guild',
                targetId: req.params.id,
                targetGameId: newMasterUserId,
                oldValue: null,
                newValue: { newMasterUserId },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Liderazgo transferido exitosamente.');
            res.redirect(`/guilds/${req.params.id}`);
        } catch (error) {
            req.flash('error', error.message || 'Error al transferir liderazgo.');
            res.redirect(`/guilds/${req.params.id}`);
        }
    }

    /**
     * Delete guild
     */
    async delete(req, res) {
        try {
            await guildService.deleteGuild(req.params.id);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'guild.delete',
                targetType: 'guild',
                targetId: req.params.id,
                targetGameId: null,
                oldValue: null,
                newValue: { deletedGuildId: req.params.id },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Gremio disuelto y eliminado permanentemente.');
            res.redirect('/guilds');
        } catch (error) {
            req.flash('error', error.message || 'Error al eliminar gremio.');
            res.redirect('/guilds');
        }
    }
}

module.exports = new GuildController();
