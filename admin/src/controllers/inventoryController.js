const inventoryService = require('../services/inventoryService');
const auditService = require('../services/auditService');
const { AVATAR_TYPES, GENDERS, formatNumber, formatDate, getAvatarTypeName, getGenderName } = require('../utils/viewHelpers');

class InventoryController {
    /**
     * Avatar Catalog browser
     */
    async catalog(req, res) {
        try {
            const { query, type, gender, page = 1 } = req.query;
            const data = inventoryService.searchCatalog({
                query,
                type,
                gender,
                page,
                limit: 24
            });

            res.render('inventory/index', {
                pageTitle: 'Catálogo de Avatares',
                items: data.items,
                pagination: {
                    total: data.total,
                    page: data.page,
                    limit: data.limit,
                    totalPages: data.totalPages
                },
                filters: { query, type, gender },
                avatarTypes: AVATAR_TYPES,
                genders: GENDERS,
                getAvatarTypeName,
                getGenderName,
                formatNumber
            });
        } catch (error) {
            console.error('[InventoryController] Error:', error);
            req.flash('error', 'Error al cargar catálogo de avatares.');
            res.redirect('/');
        }
    }

    /**
     * Inspect specific player's inventory
     */
    async playerInventory(req, res) {
        try {
            const data = await inventoryService.getUserInventory(req.params.id);

            res.render('inventory/player', {
                pageTitle: `Inventario de ${data.player.game_id}`,
                player: data.player,
                equipped: data.equipped || {},
                items: data.items,
                stats: {
                    total: data.total,
                    active: data.activeCount,
                    deleted: data.deletedCount
                },
                avatarTypes: AVATAR_TYPES,
                getAvatarTypeName,
                getGenderName,
                formatDate,
                formatNumber
            });
        } catch (error) {
            console.error('[InventoryController] Error:', error);
            req.flash('error', error.message || 'Error al cargar inventario del jugador.');
            res.redirect('/players');
        }
    }

    /**
     * Grant avatar to a player
     */
    async grant(req, res) {
        try {
            const { userId, aId, expireDays, isCash, isGift } = req.body;
            const result = await inventoryService.grantAvatar({
                userId,
                aId,
                expireDays: parseInt(expireDays, 10) || 0,
                isCash: isCash !== undefined ? 1 : 0,
                isGift: isGift !== undefined ? 1 : 0,
                giftSentBy: req.session.admin.userId
            });

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'inventory.grant',
                targetType: 'user',
                targetId: result.player.Id,
                targetGameId: result.player.game_id,
                oldValue: null,
                newValue: { avatarId: aId, avatarName: result.avatar.name, permanent: result.isPermanent, days: result.days },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Avatar '${result.avatar.name}' (#${aId}) entregado a ${result.player.game_id} exitosamente.`);
            const redirectUrl = req.headers.referer || `/inventory/player/${result.player.Id}`;
            res.redirect(redirectUrl);
        } catch (error) {
            req.flash('error', error.message || 'Error al otorgar avatar.');
            res.redirect(req.headers.referer || '/inventory');
        }
    }

    /**
     * Remove / soft-delete avatar
     */
    async remove(req, res) {
        try {
            await inventoryService.removeAvatar(req.params.id);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'inventory.remove',
                targetType: 'user_avatar',
                targetId: req.params.id,
                targetGameId: null,
                oldValue: { remove_ava: 0 },
                newValue: { remove_ava: 1 },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Avatar movido a la papelera (desactivado).');
            res.redirect(req.headers.referer || '/inventory');
        } catch (error) {
            req.flash('error', error.message || 'Error al remover avatar.');
            res.redirect(req.headers.referer || '/inventory');
        }
    }

    /**
     * Restore avatar
     */
    async restore(req, res) {
        try {
            await inventoryService.restoreAvatar(req.params.id);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'inventory.restore',
                targetType: 'user_avatar',
                targetId: req.params.id,
                targetGameId: null,
                oldValue: { remove_ava: 1 },
                newValue: { remove_ava: 0 },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Avatar restaurado al inventario activo.');
            res.redirect(req.headers.referer || '/inventory');
        } catch (error) {
            req.flash('error', error.message || 'Error al restaurar avatar.');
            res.redirect(req.headers.referer || '/inventory');
        }
    }

    /**
     * Permanently delete avatar
     */
    async delete(req, res) {
        try {
            await inventoryService.deleteAvatarPermanently(req.params.id);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'inventory.delete_permanent',
                targetType: 'user_avatar',
                targetId: req.params.id,
                targetGameId: null,
                oldValue: null,
                newValue: { deletedId: req.params.id },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Avatar eliminado definitivamente de la base de datos.');
            res.redirect(req.headers.referer || '/inventory');
        } catch (error) {
            req.flash('error', error.message || 'Error al eliminar avatar.');
            res.redirect(req.headers.referer || '/inventory');
        }
    }

    /**
     * Mass grant avatar to all online or all players
     */
    async massGrant(req, res) {
        try {
            const { aId, expireDays, target } = req.body;
            const result = await inventoryService.massGrantAvatar({
                aId,
                expireDays: parseInt(expireDays, 10) || 0,
                target,
                giftSentBy: req.session.admin.userId
            });

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'inventory.mass_grant',
                targetType: 'system',
                targetId: null,
                targetGameId: `all_${target}`,
                oldValue: null,
                newValue: { avatarId: aId, avatarName: result.avatar.name, target, count: result.count },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Regalo masivo completado. Se otorgó '${result.avatar.name}' (#${aId}) a ${result.count} jugadores (${target}).`);
            res.redirect('/inventory');
        } catch (error) {
            req.flash('error', error.message || 'Error en regalo masivo de avatar.');
            res.redirect('/inventory');
        }
    }
}

module.exports = new InventoryController();
